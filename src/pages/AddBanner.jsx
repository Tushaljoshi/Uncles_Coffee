import React, { useEffect, useRef, useState } from "react";
import TopBar from "../components/TopBar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import { RefreshCw, ImageIcon, Trash2, X, UploadCloud } from "lucide-react";

const BannerSkeleton = () => (
  <div className="rounded-2xl overflow-hidden animate-pulse bg-white border border-gray-100">
    <div className="h-40 bg-gray-100 w-full" />
  </div>
);

const Toast = ({ popup, onClose }) => {
  if (!popup.open) return null;
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl text-white text-sm shadow-lg transition-all ${
        popup.type === "success" ? "bg-green-700" : "bg-red-700"
      }`}
    >
      <span>{popup.message}</span>
      <button onClick={onClose} className="hover:opacity-70">
        <X size={14} />
      </button>
    </div>
  );
};

const AddBanner = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const toggleSidebar = () => setSidebarOpen((p) => !p);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [banners, setBanners] = useState([]);
  const [newIds, setNewIds] = useState(new Set());

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const [popup, setPopup] = useState({ open: false, type: "success", message: "" });

  const showPopup = (type, message) => {
    setPopup({ open: true, type, message });
    setTimeout(() => setPopup({ open: false, type, message: "" }), 3000);
  };

  // ── FETCH ──────────────────────────────────────────────
  const fetchBanners = async () => {
    try {
      setRefreshing(true);
      const res = await fetch(`${API_BASE}/api/picture/get`);
      const result = await res.json();
      if (result.success) setBanners(result.data || []);
      else showPopup("error", "Failed to fetch banners");
    } catch {
      showPopup("error", "Server error");
    } finally {
      setRefreshing(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => { fetchBanners(); }, []);

  // ── FILE HANDLING ─────────────────────────────────────
  const applyFile = (selected) => {
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleFileChange = (e) => applyFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type.startsWith("image/")) applyFile(dropped);
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── UPLOAD ────────────────────────────────────────────
  const uploadBanner = async () => {
    if (!file) { showPopup("error", "Please select an image"); return; }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("singleImage", file);

      const res = await fetch(`${API_BASE}/api/picture/create`, {
        method: "POST",
        body: formData,
      });
      const result = await res.json();

      if (result.success) {
        showPopup("success", "Banner uploaded");
        const newBanner = { id: result.id, images: { singleImage: result.imageUrl } };
        setBanners((prev) => [newBanner, ...prev]);
        setNewIds((prev) => new Set(prev).add(result.id));
        setTimeout(() => setNewIds((prev) => { const s = new Set(prev); s.delete(result.id); return s; }), 3000);
        clearFile();
      } else {
        showPopup("error", result.message || "Upload failed");
      }
    } catch {
      showPopup("error", "Upload error");
    } finally {
      setLoading(false);
    }
  };

  // ── DELETE ────────────────────────────────────────────
  const deleteBanner = async (id) => {
    if (!window.confirm("Delete this banner?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/picture/delete/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        showPopup("success", "Banner deleted");
        setBanners((prev) => prev.filter((b) => b.id !== id));
      } else {
        showPopup("error", result.message || "Delete failed");
      }
    } catch {
      showPopup("error", "Delete error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className={`flex-1 transition-all ${sidebarOpen ? "lg:ml-60" : ""}`}>
        <TopBar toggleSidebar={toggleSidebar} />

        <main className="p-6 max-w-6xl mx-auto">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Banners</h1>
              <p className="text-sm text-gray-400 mt-0.5">Manage your storefront banners</p>
            </div>
            <button
              onClick={fetchBanners}
              disabled={refreshing}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {/* DROP ZONE */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => !preview && fileInputRef.current?.click()}
            className={`relative bg-white border-2 border-dashed rounded-2xl p-8 mb-10 text-center transition-all cursor-pointer
              ${isDragging ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-red-300 hover:bg-gray-50"}
              ${preview ? "cursor-default" : ""}`}
          >
            <input
              ref={fileInputRef}
              id="bannerInput"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {!preview ? (
              <>
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
                  <UploadCloud size={24} className="text-red-500" />
                </div>
                <p className="text-sm font-medium text-gray-700">
                  Drop image here or{" "}
                  <span className="text-red-600 underline underline-offset-2">browse</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 5 MB</p>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="relative inline-block">
                  <img
                    src={preview}
                    alt="Preview"
                    className="h-44 max-w-xs rounded-xl border border-gray-100 object-cover shadow-sm"
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); clearFile(); }}
                    className="absolute -top-2.5 -right-2.5 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
                <p className="text-xs text-gray-400">{file?.name}</p>
                <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={clearFile}
                    className="px-5 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={uploadBanner}
                    disabled={loading}
                    className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-all active:scale-95 disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
                        </svg>
                        Uploading…
                      </span>
                    ) : "Upload banner"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SECTION LABEL */}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Uploaded banners
          </p>

          {/* GRID */}
          {initialLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => <BannerSkeleton key={i} />)}
            </div>
          ) : banners.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-200 hover:shadow-md transition-all"
                >
                  <img
                    src={banner.images.singleImage}
                    alt="Banner"
                    className="h-40 w-full object-cover"
                  />

                  {/* New badge */}
                  {newIds.has(banner.id) && (
                    <span className="absolute top-2 left-2 bg-red-600 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                      New
                    </span>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => deleteBanner(banner.id)}
                      className="flex items-center gap-1.5 bg-white text-red-600 hover:bg-red-600 hover:text-white px-4 py-2 rounded-xl text-sm font-medium transition-all"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 text-gray-400">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <ImageIcon size={28} className="text-gray-300" />
              </div>
              <p className="font-medium text-gray-500">No banners yet</p>
              <p className="text-sm mt-1">Upload your first banner above</p>
            </div>
          )}
        </main>
      </div>

      <Toast popup={popup} onClose={() => setPopup((p) => ({ ...p, open: false }))} />
    </div>
  );
};

export default AddBanner;