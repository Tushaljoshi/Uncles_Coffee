import React, { useEffect, useState, useRef } from "react";
import * as XLSX from "xlsx"; // npm install xlsx
import {
  Search, Trash2, Car, Calendar, Clock, Phone,
  User, Wrench, Fuel, MapPin, Hash, FileText,
  ChevronRight, AlertCircle, X, CheckCircle,
  Download, CheckSquare,
} from "lucide-react";
import TopBar from "../components/TopBar.jsx";
import Sidebar from "../components/Sidebar.jsx";

/* ================= SKELETON ================= */
const BookingSkeleton = () => (
  <tr className="animate-pulse border-b border-slate-100">
    {[...Array(11)].map((_, i) => (
      <td key={i} className="px-4 py-4">
        <div className="h-4 bg-slate-200 rounded w-full" />
      </td>
    ))}
  </tr>
);

/* ================= CONFIRM DELETE MODAL ================= */
const ConfirmModal = ({ booking, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center text-center">
      <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
        <AlertCircle size={28} className="text-red-500" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-1">Delete Booking?</h3>
      <p className="text-slate-500 text-sm mb-1">You're about to delete the booking for</p>
      <p className="font-bold text-slate-800 text-sm mb-5">"{booking.fullName}"</p>
      <p className="text-xs text-slate-400 mb-6">This action cannot be undone.</p>
      <div className="flex gap-3 w-full">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors text-sm">Cancel</button>
        <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors text-sm">Delete</button>
      </div>
    </div>
  </div>
);

/* ================= DETAIL MODAL ================= */
const DetailCard = ({ label, value, icon }) => (
  <div className="p-3 bg-white border border-slate-100 rounded-xl">
    <div className="flex items-center gap-1.5 mb-0.5">
      {icon && <span className="text-slate-400">{icon}</span>}
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
    </div>
    <div className="text-slate-700 font-semibold text-sm break-words">{value || "—"}</div>
  </div>
);

const DetailModal = ({ booking, onClose }) => {
  if (!booking) return null;
  const createdAt = booking.createdAt?._seconds
    ? new Date(booking.createdAt._seconds * 1000).toLocaleString()
    : "N/A";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-blue-50 rounded-2xl flex items-center justify-center">
              <Car size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">{booking.fullName}</h2>
              <span className="text-xs text-slate-400">{booking.id}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailCard label="Full Name" value={booking.fullName} icon={<User size={14} />} />
            <DetailCard label="Phone" value={booking.phone} icon={<Phone size={14} />} />
            <DetailCard label="Vehicle Brand" value={booking.vehicleBrand} icon={<Car size={14} />} />
            <DetailCard label="Vehicle Type" value={booking.vehicleType} icon={<Car size={14} />} />
            <DetailCard label="Fuel Type" value={booking.fuelType} icon={<Fuel size={14} />} />
            <DetailCard label="Reg. Number" value={booking.regNumber} icon={<Hash size={14} />} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailCard label="Service Type" value={booking.serviceType} icon={<Wrench size={14} />} />
            <DetailCard label="Rate Category" value={typeof booking.selectedRate === "object" ? `${booking.selectedRate.label} — ${booking.selectedRate.sub}` : booking.selectedRate} icon={<FileText size={14} />} />
            <DetailCard label="Service Date" value={booking.serviceDate} icon={<Calendar size={14} />} />
            <DetailCard label="Time Slot" value={booking.timeSlot} icon={<Clock size={14} />} />
          </div>
          <DetailCard label="Address" value={`Flat ${booking.flatNo}, ${booking.address}`} icon={<MapPin size={14} />} />
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Reported Issues</p>
            <div className="flex flex-wrap gap-2">
              {booking.issues?.map((issue, i) => (
                <span key={i} className="px-3 py-1 bg-red-50 text-red-700 border border-red-100 rounded-full text-xs font-semibold">{issue}</span>
              ))}
            </div>
            {booking.additionalIssues && <p className="text-xs text-slate-500 mt-3 italic">Additional: "{booking.additionalIssues}"</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <DetailCard label="Booked At" value={createdAt} icon={<Calendar size={14} />} />
            <div className="p-3 bg-white border border-slate-100 rounded-xl flex items-center gap-3">
              <CheckCircle size={16} className={booking.agreed ? "text-green-500" : "text-slate-300"} />
              <span className="text-sm font-semibold text-slate-700">{booking.agreed ? "Terms Agreed" : "Not Agreed"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= TOAST ================= */
const Toast = ({ message, type, onClose }) => (
  <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-white text-sm font-semibold ${type === "success" ? "bg-green-600" : "bg-red-600"}`}>
    {type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
    {message}
    <button onClick={onClose} className="ml-2 hover:opacity-70"><X size={16} /></button>
  </div>
);

/* ================= EXPORT MODAL ================= */
const ExportModal = ({ selectedCount, allCount, onClose, onExport }) => {
  const [fileName, setFileName] = useState(`Bookings_Export_${new Date().toISOString().split("T")[0]}`);
  const [sheetName, setSheetName] = useState("Customer Bookings");
  const [exportScope, setExportScope] = useState(selectedCount > 0 ? "selected" : "all");
  const count = exportScope === "selected" ? selectedCount : allCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <Download size={18} className="text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Export to Excel</h3>
              <p className="text-xs text-slate-400">Configure your export settings</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Scope selector */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Export Scope</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setExportScope("all")}
                className={`py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all ${exportScope === "all" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}
              >
                All Bookings
                <span className="block text-[10px] font-normal mt-0.5 opacity-70">{allCount} records</span>
              </button>
              <button
                onClick={() => setExportScope("selected")}
                disabled={selectedCount === 0}
                className={`py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${exportScope === "selected" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}
              >
                Selected Only
                <span className="block text-[10px] font-normal mt-0.5 opacity-70">{selectedCount} records</span>
              </button>
            </div>
          </div>

          {/* File name */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">File Name</label>
            <div className="flex items-center gap-2">
              <input
                value={fileName}
                onChange={e => setFileName(e.target.value)}
                className="flex-1 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter file name..."
              />
              <span className="text-xs text-slate-400 font-mono bg-slate-100 px-2 py-2.5 rounded-lg">.xlsx</span>
            </div>
          </div>

          {/* Sheet name */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Sheet Name</label>
            <input
              value={sheetName}
              onChange={e => setSheetName(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Sheet name..."
            />
          </div>

          {/* Summary */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
            <FileText size={16} className="text-slate-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600 leading-relaxed">
              Will export <span className="font-bold text-slate-800">{count} booking{count !== 1 ? "s" : ""}</span> with{" "}
              <span className="font-bold text-slate-800">18 columns</span> including customer info, vehicle details, issues, and timestamps into{" "}
              <span className="font-mono text-green-700 font-bold">{fileName || "export"}.xlsx</span>.
              Headers will be frozen and auto-filter enabled.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors text-sm">Cancel</button>
          <button
            onClick={() => onExport({ scope: exportScope, fileName: fileName || "export", sheetName: sheetName || "Sheet1" })}
            className="flex-1 py-2.5 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-all shadow-md flex items-center justify-center gap-2 text-sm"
          >
            <Download size={16} /> Export Excel
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================= INDETERMINATE CHECKBOX ================= */
const Checkbox = ({ checked, indeterminate, onChange }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = !!indeterminate;
  }, [indeterminate]);
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="w-4 h-4 rounded border-slate-300 text-blue-600 accent-blue-600 cursor-pointer"
    />
  );
};

/* ================= UTILS ================= */
const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const formatCreatedAt = (ts) => {
  if (!ts?._seconds) return "—";
  return new Date(ts._seconds * 1000).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const getRateLabel = (rate) => {
  if (!rate) return "—";
  if (typeof rate === "object") return `${rate.label}${rate.sub ? ` (${rate.sub})` : ""}`;
  return rate;
};

/* ================= EXCEL EXPORT ENGINE ================= */
const buildAndExport = (bookings, { fileName, sheetName }) => {
  const rows = bookings.map((b, idx) => ({
    "S.No": idx + 1,
    "Booking ID": b.id,
    "Customer Name": b.fullName,
    "Phone": b.phone,
    "Flat No": b.flatNo,
    "Address": b.address,
    "Vehicle Brand": b.vehicleBrand,
    "Vehicle Type": b.vehicleType,
    "Reg. Number": b.regNumber,
    "Fuel Type": b.fuelType,
    "Service Type": b.serviceType,
    "Rate Category": getRateLabel(b.selectedRate),
    "Service Date": b.serviceDate,
    "Time Slot": b.timeSlot,
    "Issues": (b.issues || []).join(", "),
    "Additional Issues": b.additionalIssues || "",
    "Terms Agreed": b.agreed ? "Yes" : "No",
    "Booked On": b.createdAt?._seconds
      ? new Date(b.createdAt._seconds * 1000).toLocaleDateString("en-IN")
      : "N/A",
  }));

  const ws = XLSX.utils.json_to_sheet(rows);

  // Column widths
  ws["!cols"] = [
    { wch: 6 },   // S.No
    { wch: 26 },  // Booking ID
    { wch: 22 },  // Customer Name
    { wch: 15 },  // Phone
    { wch: 10 },  // Flat No
    { wch: 22 },  // Address
    { wch: 16 },  // Vehicle Brand
    { wch: 14 },  // Vehicle Type
    { wch: 14 },  // Reg Number
    { wch: 12 },  // Fuel Type
    { wch: 22 },  // Service Type
    { wch: 30 },  // Rate Category
    { wch: 14 },  // Service Date
    { wch: 16 },  // Time Slot
    { wch: 52 },  // Issues
    { wch: 26 },  // Additional Issues
    { wch: 13 },  // Terms Agreed
    { wch: 14 },  // Booked On
  ];

  // Freeze header row
  ws["!freeze"] = { xSplit: 0, ySplit: 1, topLeftCell: "A2", activePane: "bottomLeft" };

  // Auto-filter
  const range = XLSX.utils.decode_range(ws["!ref"]);
  ws["!autofilter"] = {
    ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: 0, c: range.e.c } }),
  };

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

/* ================= MAIN PAGE ================= */
const AdminBookings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showExportModal, setShowExportModal] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/bookings`);
      const data = await res.json();
      if (data.success) setBookings(data.data);
    } catch (err) {
      console.error(err);
      showToast("Failed to load bookings", "error");
    } finally {
      setLoading(false);
    }
  };

  const deleteBooking = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setBookings(prev => prev.filter(b => b.id !== id));
        setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
        showToast("Booking deleted successfully", "success");
      } else {
        showToast("Delete failed", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Something went wrong", "error");
    } finally {
      setDeleteTarget(null);
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Filtered rows ── */
  const filteredBookings = bookings
    .filter(b =>
      b.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      b.phone?.includes(search) ||
      b.regNumber?.toLowerCase().includes(search.toLowerCase()) ||
      b.serviceType?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const aTime = a.createdAt?._seconds || 0;
      const bTime = b.createdAt?._seconds || 0;
      return bTime - aTime; // latest first
    });

  /* ── Selection logic ── */
  const allFilteredSelected = filteredBookings.length > 0 && filteredBookings.every(b => selectedIds.has(b.id));
  const someFilteredSelected = filteredBookings.some(b => selectedIds.has(b.id)) && !allFilteredSelected;

  const toggleSelectAll = () => {
    setSelectedIds(prev => {
      const n = new Set(prev);
      if (allFilteredSelected) {
        filteredBookings.forEach(b => n.delete(b.id));
      } else {
        filteredBookings.forEach(b => n.add(b.id));
      }
      return n;
    });
  };

  const toggleRow = (id) => {
    setSelectedIds(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  /* ── Export handler ── */
  const handleExport = ({ scope, fileName, sheetName }) => {
    const toExport = scope === "selected"
      ? bookings.filter(b => selectedIds.has(b.id))
      : filteredBookings;
    buildAndExport(toExport, { fileName, sheetName });
    setShowExportModal(false);
    showToast(`Exported ${toExport.length} booking${toExport.length !== 1 ? "s" : ""} to Excel`, "success");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? "lg:ml-60" : ""}`}>
        <TopBar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="p-4 md:p-8">
          {/* ── Page Header ── */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Customer Bookings</h1>
              <p className="text-slate-500 text-sm">View, manage and export service booking requests</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-sm font-semibold text-slate-700">{bookings.length} Total</span>
              </div>
              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-sm transition-colors text-sm"
              >
                <Download size={16} />
                Export Excel
                {selectedIds.size > 0 && (
                  <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                    {selectedIds.size}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* ── Selection Banner ── */}
          {selectedIds.size > 0 && (
            <div className="mb-4 flex items-center justify-between px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-2">
                <CheckSquare size={16} className="text-blue-600" />
                <span className="text-sm font-bold text-blue-700">
                  {selectedIds.size} booking{selectedIds.size !== 1 ? "s" : ""} selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowExportModal(true)}
                  className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Download size={12} /> Export Selected
                </button>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* ── Search ── */}
          <div className="mb-5 relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, phone, reg no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
            />
          </div>

          {/* ── Table ── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[1050px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-4 py-3.5 w-10">
                      <Checkbox
                        checked={allFilteredSelected}
                        indeterminate={someFilteredSelected}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th className="px-4 py-3.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">#</th>
                    <th className="px-4 py-3.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-3.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</th>
                    <th className="px-4 py-3.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vehicle</th>
                    <th className="px-4 py-3.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Service</th>
                    <th className="px-4 py-3.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date & Slot</th>
                    <th className="px-4 py-3.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Booked On</th>
                    <th className="px-4 py-3.5 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    [...Array(5)].map((_, i) => <BookingSkeleton key={i} />)
                  ) : filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-4 py-16 text-center text-slate-400 text-sm">
                        <div className="flex flex-col items-center gap-2">
                          <FileText size={36} className="text-slate-200" />
                          <p className="font-medium">No bookings found</p>
                          <p className="text-xs">Try adjusting your search query</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b, idx) => {
                      const isSelected = selectedIds.has(b.id);
                      return (
                        <tr
                          key={b.id}
                          className={`transition-colors group ${isSelected ? "bg-blue-50/60" : "hover:bg-slate-50/60"}`}
                        >
                          {/* Checkbox */}
                          <td className="px-4 py-4">
                            <Checkbox checked={isSelected} onChange={() => toggleRow(b.id)} />
                          </td>

                          {/* Index */}
                          <td className="px-4 py-4">
                            <span className="text-slate-400 text-xs font-mono">{idx + 1}</span>
                          </td>

                          {/* Customer */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? "bg-blue-100" : "bg-blue-50"}`}>
                                <User size={14} className="text-blue-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-slate-800 text-sm leading-tight">{b.fullName}</p>
                                <p className="text-xs text-slate-400">Flat {b.flatNo}, {b.address}</p>
                              </div>
                            </div>
                          </td>

                          {/* Phone */}
                          <td className="px-4 py-4">
                            <span className="font-mono text-xs text-slate-600">{b.phone}</span>
                          </td>

                          {/* Vehicle */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-1.5">
                              <Car size={13} className="text-slate-400 flex-shrink-0" />
                              <div>
                                <p className="text-slate-800 font-semibold text-xs">{b.vehicleBrand} ({b.vehicleType})</p>
                                <p className="text-[10px] text-slate-400">{b.regNumber} · {b.fuelType}</p>
                              </div>
                            </div>
                          </td>

                          {/* Service */}
                          <td className="px-4 py-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-md text-[11px] font-bold">
                              <Wrench size={10} />{b.serviceType}
                            </span>
                          </td>

                          {/* Date & Slot */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-1 text-slate-600 text-xs">
                              <Calendar size={12} className="text-slate-400" />
                              <span className="font-semibold">{formatDate(b.serviceDate)}</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-400 text-[11px] mt-0.5">
                              <Clock size={11} />{b.timeSlot}
                            </div>
                          </td>


                          {/* Booked On */}
                          <td className="px-4 py-4">
                            <span className="text-xs text-slate-500">
                              {formatCreatedAt(b.createdAt)}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => setSelectedBooking(b)}
                                title="View Details"
                                className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                              >
                                <ChevronRight size={16} />
                              </button>
                              <button
                                onClick={() => setDeleteTarget(b)}
                                title="Delete Booking"
                                className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            {!loading && filteredBookings.length > 0 && (
              <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between flex-wrap gap-2">
                <p className="text-xs text-slate-400">
                  Showing <span className="font-semibold text-slate-600">{filteredBookings.length}</span> of{" "}
                  <span className="font-semibold text-slate-600">{bookings.length}</span> bookings
                  {selectedIds.size > 0 && (
                    <span className="ml-2 font-bold text-blue-600">· {selectedIds.size} selected</span>
                  )}
                </p>
                <p className="text-xs text-slate-400">Last updated: {new Date().toLocaleTimeString()}</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      {selectedBooking && <DetailModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />}
      {deleteTarget && (
        <ConfirmModal
          booking={deleteTarget}
          onConfirm={() => deleteBooking(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      {showExportModal && (
        <ExportModal
          selectedCount={selectedIds.size}
          allCount={filteredBookings.length}
          onClose={() => setShowExportModal(false)}
          onExport={handleExport}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default AdminBookings;