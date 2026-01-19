import React, { useEffect, useState } from "react";
import TopBar from "../components/TopBar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import {
  RefreshCw,
  Image as ImageIcon,
  Trash2,
  Link,
  X,
} from "lucide-react";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";

const BannerSkeleton = () => (
  <div className="bg-white rounded-2xl border shadow-sm overflow-hidden animate-pulse">
    <div className="h-52 bg-gray-200 w-full" />
    <div className="p-4 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
    </div>
  </div>
);

const AddBanner = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const [bannerName, setBannerName] = useState("");
  const [image, setImage] = useState(null);
  const [banners, setBanners] = useState([]);

  const [loading, setLoading] = useState(false);       
  const [refreshing, setRefreshing] = useState(false); 
  const [initialLoading, setInitialLoading] = useState(true); 
  const [popup, setPopup] = useState({
    open: false,
    type: "success",
    message: "",
  });

  const showPopup = (type, message) => {
    setPopup({ open: true, type, message });
    setTimeout(() => {
      setPopup({ open: false, type, message: "" });
    }, 3000);
  };
  const fetchBanners = async () => {
    try {
      setRefreshing(true);
      const snap = await getDocs(collection(db, "dashboard_banners"));
      setBanners(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch {
      showPopup("error", "Failed to load banners");
    } finally {
      setRefreshing(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);
  const uploadBanner = async () => {
    if (!image || !bannerName) {
      showPopup("error", "Banner name and image are required");
      return;
    }

    try {
      setLoading(true);

      const imageRef = ref(
        storage,
        `dashboard-banners/${Date.now()}-${image.name}`
      );

      await uploadBytes(imageRef, image);
      const imageUrl = await getDownloadURL(imageRef);

      await addDoc(collection(db, "dashboard_banners"), {
        name: bannerName,
        imageUrl,
        createdAt: serverTimestamp(),
      });

      setBannerName("");
      setImage(null);
      showPopup("success", "Banner uploaded successfully");
      fetchBanners();
    } catch {
      showPopup("error", "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const deleteBanner = async (id) => {
    try {
      await deleteDoc(doc(db, "dashboard_banners", id));
      showPopup("success", "Banner deleted");
      fetchBanners();
    } catch {
      showPopup("error", "Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6FB] flex">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarOpen ? "lg:ml-60" : "ml-0"
        }`}
      >
        <TopBar toggleSidebar={toggleSidebar} />

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-primaryDarkBlue">
                Dashboard Banners
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Upload, manage and control dashboard banners
              </p>
            </div>

            <button
              onClick={fetchBanners}
              disabled={refreshing}
              className="flex items-center gap-2 bg-primaryDarkBlue text-white px-5 py-2 rounded-xl shadow
                         hover:scale-[1.03] transition disabled:opacity-70"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <div className="bg-white border-l-4 border-primaryDarkBlue rounded-xl p-5 mb-8 shadow-sm">
            <h3 className="font-semibold text-primaryDarkBlue mb-2">
              Banner Upload Guidelines
            </h3>
            <ul className="grid sm:grid-cols-2 gap-2 text-sm text-gray-600 list-disc ml-5">
              <li>Recommended size: <b>1200 × 400 px</b></li>
              <li>Aspect ratio: <b>3 : 1</b></li>
              <li>Maximum size: <b>10 MB</b></li>
              <li>Formats: JPG, PNG, WEBP</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl border shadow-sm p-5 flex flex-col lg:flex-row gap-4 items-center mb-10">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="border rounded-xl p-3 w-full lg:w-1/3"
            />

            <input
              type="text"
              placeholder="Enter banner name"
              value={bannerName}
              onChange={(e) => setBannerName(e.target.value)}
              className="border rounded-xl p-3 w-full lg:w-1/3"
            />

            <button
              onClick={uploadBanner}
              disabled={loading}
              className="bg-primaryDarkBlue text-white px-7 py-3 rounded-xl hover:scale-[1.04]
                         transition disabled:opacity-50 shadow-lg"
            >
              {loading ? "Uploading..." : "Upload Banner"}
            </button>
          </div>

          {initialLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-7">
              {[...Array(6)].map((_, i) => (
                <BannerSkeleton key={i} />
              ))}
            </div>
          ) : banners.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-7">
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className="group bg-white rounded-2xl border shadow-sm overflow-hidden
                             hover:-translate-y-1 hover:shadow-xl transition-all"
                >
                  <div className="relative">
                    <img
                      src={banner.imageUrl}
                      alt={banner.name}
                      className="h-52 w-full object-cover"
                    />

                    <div className="absolute inset-0 bg-black/40 opacity-0
                                    group-hover:opacity-100 transition
                                    flex items-center justify-center gap-3">
                    
                      <button
                        onClick={() => deleteBanner(banner.id)}
                        className="bg-white p-2 rounded-full hover:scale-110"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="font-semibold text-primaryDarkBlue truncate">
                      {banner.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      ID: {banner.id}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 text-gray-400">
              <ImageIcon size={52} className="mx-auto mb-4" />
              <p className="text-lg font-medium">No banners uploaded</p>
              <p className="text-sm mt-1">
                Upload your first dashboard banner
              </p>
            </div>
          )}
        </main>
      </div>

      {popup.open && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div
            className={`flex items-center gap-3 px-5 py-4 rounded-xl shadow-xl text-white ${
              popup.type === "success"
                ? "bg-primaryDarkBlue"
                : "bg-red-600"
            }`}
          >
            <span className="text-sm font-medium">{popup.message}</span>
            <button
              onClick={() => setPopup({ ...popup, open: false })}
              className="text-white/80 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddBanner;
