import React, { useState, useEffect } from "react";
import {
  Search,
  X,
  FileText,
  RefreshCw,
  Clock,
} from "lucide-react";
import TopBar from "../components/TopBar.jsx";
import Sidebar from "../components/Sidebar.jsx";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const STATUS_FLOW = ["raised", "under_review", "resolution_in_progress", "resolved"];

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "raised", label: "Raised" },
  { value: "under_review", label: "Under Review" },
  { value: "resolution_in_progress", label: "Resolution in Progress" },
  { value: "resolved", label: "Resolved" },
];

const UPDATE_STATUS_OPTIONS = STATUS_OPTIONS.filter((opt) => opt.value !== "all");

const formatStatus = (status) =>
  (status || "unknown")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const getStatusStyle = (status) => {
  const map = {
    raised: "bg-red-100 text-red-700 border border-red-200",
    under_review: "bg-amber-100 text-amber-800 border border-amber-200",
    resolution_in_progress: "bg-blue-100 text-blue-700 border border-blue-200",
    resolved: "bg-green-100 text-green-700 border border-green-200",
  };
  return map[status] || "bg-gray-100 text-gray-600 border border-gray-200";
};

const getStatusDotColor = (status) => {
  const map = {
    raised: "bg-red-600",
    under_review: "bg-amber-500",
    resolution_in_progress: "bg-blue-600",
    resolved: "bg-green-600",
  };
  return map[status] || "bg-gray-400";
};

const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const normalizeDispute = (item) => {
  const dispute = item.dispute || {};
  return {
    id: item.bookingDocId || item.bookingId,
    bookingId: item.bookingId,
    disputeId: dispute.disputeId || "—",
    username: item.customer?.name || "Unknown",
    customerImage: item.customer?.image || "",
    mechanicName: item.mechanic?.name || "—",
    mechanicImage: item.mechanic?.image || "",
    serviceStatus: item.serviceStatus,
    reason: dispute.reason || "—",
    description: dispute.description || "",
    status: dispute.status || "raised",
    images: dispute.images || [],
    createdAt: dispute.createdAt,
    updatedAt: dispute.updatedAt,
    resolvedAt: dispute.resolvedAt,
    resolution: dispute.resolution,
    adminRemark: dispute.adminRemark,
  };
};

const AdminDisputePage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [disputes, setDisputes] = useState([]);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editStatus, setEditStatus] = useState("raised");
  const [editRemark, setEditRemark] = useState("");
  const [updating, setUpdating] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const fetchDisputes = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/servicebookings/admin/disputes`);
      if (!res.ok) throw new Error(`API Error: ${res.status}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setDisputes(data.data.map(normalizeDispute));
      } else {
        throw new Error(data.message || "Failed to load disputes");
      }
    } catch (err) {
      setError(err.message || "Unable to fetch disputes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  useEffect(() => {
    if (selectedDispute) {
      setEditStatus(selectedDispute.status);
      setEditRemark(selectedDispute.adminRemark || "");
    }
  }, [selectedDispute]);

  const updateDisputeStatus = async () => {
    if (!selectedDispute) return;
    setUpdating(true);
    setError("");
    try {
      const res = await fetch(
        `${API_BASE}/api/servicebookings/admin/update-dispute-status/${selectedDispute.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: editStatus,
            adminRemark: editRemark,
          }),
        }
      );
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to update dispute");
      }

      const updated = {
        ...selectedDispute,
        status: editStatus,
        adminRemark: editRemark,
      };
      setDisputes((prev) =>
        prev.map((d) => (d.id === selectedDispute.id ? updated : d))
      );
      setSelectedDispute(updated);
    } catch (err) {
      setError(err.message || "Unable to update dispute status");
    } finally {
      setUpdating(false);
    }
  };

  const filteredDisputes = disputes.filter((d) => {
    const searchText = search.toLowerCase();
    const matchSearch =
      d.username.toLowerCase().includes(searchText) ||
      d.disputeId.toLowerCase().includes(searchText) ||
      d.bookingId.toLowerCase().includes(searchText) ||
      d.mechanicName.toLowerCase().includes(searchText) ||
      d.reason.toLowerCase().includes(searchText);

    const matchStatus =
      statusFilter === "all" || d.status === statusFilter;

    return matchSearch && matchStatus;
  });

  const getStatusStepIndex = (status) => {
    const idx = STATUS_FLOW.indexOf(status);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className={`flex-1 ${sidebarOpen ? "lg:ml-60" : ""}`}>
        <TopBar toggleSidebar={toggleSidebar} />

        <main className="p-6">
          <div className="flex justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Dispute Management
              </h1>
              <p className="text-sm text-gray-500">
                Manage disputes raised by customers
              </p>
            </div>

            <button
              onClick={fetchDisputes}
              disabled={loading}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">
              {error}
            </div>
          )}

          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, dispute ID, booking ID or reason"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-full py-2 border rounded-lg"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-lg px-4 py-2"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4 text-left">Customer</th>
                  <th className="p-4 text-left">Mechanic</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Raised On</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i} className="border-t animate-pulse">
                      {[...Array(5)].map((__, j) => (
                        <td key={j} className="p-4">
                          <div className="h-4 bg-gray-200 rounded" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredDisputes.length ? (
                  filteredDisputes.map((d) => (
                    <tr key={d.id} className="border-t hover:bg-gray-50">
                      <td className="p-4">
                        <p className="font-medium">{d.username}</p>
                        <p className="text-xs text-gray-500">{d.disputeId}</p>
                      </td>
                      <td className="p-4">
                        <p>{d.mechanicName}</p>
                        <p className="text-xs text-gray-500 capitalize">
                          {formatStatus(d.serviceStatus)}
                        </p>
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(d.status)}`}
                        >
                          {formatStatus(d.status)}
                        </span>
                      </td>
                      <td className="p-4 text-center">{formatDate(d.createdAt)}</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setSelectedDispute(d)}
                          className="text-red-600 font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-12 text-center">
                      <FileText
                        size={40}
                        className="mx-auto text-gray-300 mb-2"
                      />
                      <p className="text-gray-500">No disputes found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {selectedDispute && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b flex justify-between">
              <h2 className="font-semibold">Dispute Details</h2>
              <button onClick={() => setSelectedDispute(null)}>
                <X />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-red-50 p-4 rounded-xl">
                <p className="text-sm font-medium">Dispute ID</p>
                <p className="text-sm text-gray-600">
                  {selectedDispute.disputeId}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Booking: {selectedDispute.bookingId}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Customer</p>
                  <p className="font-medium">{selectedDispute.username}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Mechanic</p>
                  <p className="font-medium">{selectedDispute.mechanicName}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">Status</h3>
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(selectedDispute.status)}`}
                  >
                    {formatStatus(selectedDispute.status)}
                  </span>
                </div>
                {STATUS_FLOW.map((s, i) => {
                  const isActive = getStatusStepIndex(selectedDispute.status) >= i;
                  return (
                    <div key={s} className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          isActive ? getStatusDotColor(s) : "border border-gray-300 bg-white"
                        }`}
                      />
                      <p
                        className={`text-sm ${
                          isActive ? "font-medium text-gray-800" : "text-gray-400"
                        }`}
                      >
                        {formatStatus(s)}
                      </p>
                    </div>
                  );
                })}
              </div>

              <p className="text-sm text-gray-700">
                <strong>Reason:</strong> {selectedDispute.reason}
              </p>

              {selectedDispute.description && (
                <p className="text-sm text-gray-600">
                  <strong>Description:</strong> {selectedDispute.description}
                </p>
              )}

              {selectedDispute.resolution && (
                <p className="text-sm text-green-700 bg-green-50 p-3 rounded-lg">
                  <strong>Resolution:</strong> {selectedDispute.resolution}
                </p>
              )}

              {selectedDispute.adminRemark && (
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <strong>Admin Remark:</strong> {selectedDispute.adminRemark}
                </p>
              )}

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock size={14} />
                <span>Raised: {formatDate(selectedDispute.createdAt)}</span>
                {selectedDispute.resolvedAt && (
                  <span>· Resolved: {formatDate(selectedDispute.resolvedAt)}</span>
                )}
              </div>

              {selectedDispute.images.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">
                    Evidence ({selectedDispute.images.length})
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedDispute.images.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="aspect-square rounded-lg overflow-hidden border hover:ring-2 hover:ring-red-400"
                      >
                        <img
                          src={url}
                          alt={`Dispute evidence ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t space-y-3">
                <h3 className="font-medium">Update Status</h3>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full border rounded-lg px-4 py-2"
                >
                  {UPDATE_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <textarea
                  value={editRemark}
                  onChange={(e) => setEditRemark(e.target.value)}
                  placeholder="Admin remark (e.g. Investigation started)"
                  rows={3}
                  className="w-full border rounded-lg px-4 py-2 resize-none"
                />
                <button
                  onClick={updateDisputeStatus}
                  disabled={updating}
                  className="w-full bg-red-600 text-white py-3 rounded-xl disabled:opacity-50"
                >
                  {updating ? "Updating..." : "Update Dispute"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDisputePage;
