import React, { useEffect, useState } from "react";
import TopBar from "../components/TopBar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import {
  RefreshCw,
  Image as ImageIcon,
  Trash2,
  X,
  Video,
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
  const [file, setFile] = useState(null);
  const [bannerType, setBannerType] = useState("image"); // image | video
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
    setTimeout(() => setPopup({ open: false, type, message: "" }), 3000);
  };

  /* ================= FETCH ================= */

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

  /* ================= UPLOAD ================= */

  const uploadBanner = async () => {
    if (!file || !bannerName) {
      showPopup("error", "Banner name and file are required");
      return;
    }

    try {
      setLoading(true);

      const fileRef = ref(
        storage,
        `dashboard-banners/${bannerType}/${Date.now()}-${file.name}`
      );

      await uploadBytes(fileRef, file);
      const fileUrl = await getDownloadURL(fileRef);

      await addDoc(collection(db, "dashboard_banners"), {
        name: bannerName,
        fileUrl,
        fileType: bannerType, // image | video
        createdAt: serverTimestamp(),
      });

      setBannerName("");
      setFile(null);
      setBannerType("image");
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
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? "lg:ml-60" : "ml-0"
          }`}
      >
        <TopBar toggleSidebar={toggleSidebar} />

        <main className="flex-1 p-6 overflow-auto">
          {/* HEADER */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Dashboard Banners
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Upload image or video banners
              </p>
            </div>

            <button
              onClick={fetchBanners}
              disabled={refreshing}
              className="flex items-center gap-2 bg-red-600 text-white px-5 py-2 rounded-xl hover:bg-red-700"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          {/* UPLOAD TYPE */}
          <div className="flex gap-4 mb-4 max-w-xl">
            <button
              onClick={() => setBannerType("image")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border font-medium transition
                ${bannerType === "image"
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-white text-gray-700 hover:bg-red-50"
                }`}
            >
              <ImageIcon size={18} />
              Image Banner
            </button>

            <button
              onClick={() => setBannerType("video")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border font-medium transition
                ${bannerType === "video"
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-white text-gray-700 hover:bg-red-50"
                }`}
            >
              <Video size={18} />
              Video Banner
            </button>
          </div>

          {/* UPLOAD FORM */}
          <div className="bg-white rounded-2xl border shadow-sm p-5 flex flex-col lg:flex-row gap-4 items-center mb-10">
            <input
              type="file"
              accept={
                bannerType === "image"
                  ? "image/*"
                  : "video/mp4,video/webm"
              }
              onChange={(e) => setFile(e.target.files[0])}
              className="
    w-full lg:w-1/3
    border-2 border-dashed border-gray-300
    rounded-xl p-4
    text-sm text-gray-600
    bg-white
    cursor-pointer
    file:mr-4 file:py-2 file:px-4
    file:rounded-lg file:border-0
    file:bg-red-600 file:text-white
    file:font-medium
    hover:border-red-400
    hover:file:bg-red-700
    focus:outline-none focus:ring-2 focus:ring-red-500
    transition
  "
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
              className="bg-red-600 hover:bg-red-700 text-white px-7 py-3 rounded-xl disabled:opacity-50"
            >
              {loading ? "Uploading..." : "Upload Banner"}
            </button>
          </div>

          {/* LIST */}
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
                  className="group bg-white rounded-2xl border shadow-sm overflow-hidden hover:-translate-y-1 hover:shadow-xl transition"
                >
                  <div className="relative">
                    {banner.fileType === "video" ? (
                      <video
                        src={banner.fileUrl}
                        controls
                        className="h-52 w-full object-cover"
                      />
                    ) : (
                      <img
                        src={banner.fileUrl}
                        alt={banner.name}
                        className="h-52 w-full object-cover"
                      />
                    )}

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <button
                        onClick={() => deleteBanner(banner.id)}
                        className="bg-white p-2 rounded-full"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="font-semibold text-gray-800 truncate">
                      {banner.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {banner.fileType === "video"
                        ? "Video Banner"
                        : "Image Banner"}
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
                Upload your first image or video banner
              </p>
            </div>
          )}
        </main>
      </div>

      {/* POPUP */}
      {popup.open && (
        <div className="fixed bottom-6 right-6 z-50">
          <div
            className={`flex items-center gap-3 px-5 py-4 rounded-xl shadow-xl text-white ${popup.type === "success" ? "bg-red-600" : "bg-gray-800"
              }`}
          >
            <span className="text-sm">{popup.message}</span>
            <button onClick={() => setPopup({ ...popup, open: false })}>
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddBanner;
