import React, { useState, useEffect } from "react";
import {
  Search,
  X,
  FileText,
  RefreshCw,
  Mail,
  Clock,
  CheckCircle,
} from "lucide-react";
import TopBar from "../components/TopBar.jsx";
import Sidebar from "../components/Sidebar.jsx";

const STATUS_STEPS = ["pending", "in-progress", "resolved"];
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const Reports = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  /* ================= FILTER LOGIC ================= */

  const filteredReports = reports.filter((r) => {
    const searchText = searchQuery.toLowerCase();
    const userName = String(r.username || r.userId || "").toLowerCase();
    const contactEmail = String(r.contactEmail || "").toLowerCase();
    const ticketId = String(r.reportId || r.ticketId || "").toLowerCase();
    const issueType = String(r.issueCategory || r.issueType || "").toLowerCase();
    const description = String(r.description || "").toLowerCase();

    const matchSearch =
      userName.includes(searchText) ||
      contactEmail.includes(searchText) ||
      ticketId.includes(searchText) ||
      issueType.includes(searchText) ||
      description.includes(searchText);

    const statusValue = String(r.status || "").toLowerCase();
    const matchStatus = filterStatus === "all" || statusValue === filterStatus;
    const matchCategory =
      filterCategory === "all" || issueType === filterCategory.toLowerCase();

    return matchSearch && matchStatus && matchCategory;
  });

  /* ================= UPDATE STATUS (LOCAL) ================= */

  const fetchTickets = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/support/admin/support-tickets`);
      const data = await res.json();
      if (data.success) {
        setReports(Array.isArray(data.data) ? data.data : []);
      } else {
        setError(data.message || "Failed to load support tickets");
      }
    } catch (err) {
      setError(err.message || "Unable to fetch support tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const ticket = reports.find((r) => r.id === id);
      if (!ticket) return;
      const res = await fetch(`${API_BASE}/api/support/admin/update-ticket-status/${ticket.ticketId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to update status");

      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
      setSelectedReport((prev) =>
        prev ? { ...prev, status } : null
      );
    } catch (err) {
      setError(err.message || "Unable to update ticket status");
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className={`flex-1 ${sidebarOpen ? "lg:ml-60" : ""}`}>
        <TopBar toggleSidebar={toggleSidebar} />

        <main className="p-6">
          {/* HEADER */}
          <div className="flex justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Support Tickets
              </h1>
              <p className="text-sm text-gray-500">
                Manage customer support issues
              </p>
            </div>

            <button
              onClick={fetchTickets}
              disabled={loading}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {/* SEARCH & FILTER */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email or ticket ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full py-2 border rounded-lg"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded-lg px-4 py-2"
            >
              <option value="all">All Status</option>
              <option value="pending">Open</option>
              <option value="in-progress">In Process</option>
              <option value="resolved">Resolved</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border rounded-lg px-4 py-2"
            >
              <option value="all">All Categories</option>
              <option value="Payment Issue">Payment Issue</option>
              <option value="Booking Issue">Booking Issue</option>
              <option value="Service Quality">Service Quality</option>
              <option value="App Issue">App Issue</option>
              <option value="Other">Other</option>
            </select>
          </div>
          {error && (
            <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
              {error}
            </div>
          )}

          {/* TABLE */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4 text-left">User</th>
                  <th className="p-4 text-left">role</th>
                  <th className="p-4 text-left">Issue</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Date</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.length ? (
                  filteredReports.map((r) => (
                    <tr key={r.id} className="border-t hover:bg-gray-50">
                      <td className="p-4">
                        <p className="font-medium">{r.userDetails?.name || r.username || r.userId}</p>
                        <p className="text-xs text-gray-500">
                          {r.userDetails?.email || r.contactEmail || "-"}
                        </p>
                      </td>
                      <td className="p-4">{r.userDetails?.role || "-"}</td>
                      <td className="p-4">{r.issueType || r.issueCategory}</td>
                      <td className="p-4 text-center capitalize">
                        {String(r.status || "").toLowerCase().replace("-", " ")}
                      </td>
                      <td className="p-4 text-center">
                        {formatDate(r.createdAt)}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setSelectedReport(r)}
                          className="text-red-600 font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : loading ? (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-gray-500">
                      Loading tickets...
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan="5" className="p-12 text-center">
                      <FileText size={40} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-gray-500">No reports found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* ================= MODAL ================= */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b flex justify-between">
              <h2 className="font-semibold">Ticket Status</h2>
              <button onClick={() => setSelectedReport(null)}>
                <X />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-red-50 p-4 rounded-xl">
                  <p className="text-sm font-medium">Ticket ID</p>
                  <p className="text-sm text-gray-600">#{selectedReport.ticketId || selectedReport.reportId}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm font-medium">Issue Type</p>
                    <p className="text-sm text-gray-600">{selectedReport.issueType || selectedReport.issueCategory || "-"}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm font-medium">Created At</p>
                    <p className="text-sm text-gray-600">{formatDate(selectedReport.createdAt)}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl overflow-auto max-h-48">
                  <p className="text-sm font-medium mb-3">User Details</p>
                  <div className="space-y-2 text-sm text-gray-700">
                    {Object.entries(selectedReport.userDetails || { userId: selectedReport.userId }).map(([key, value]) => (
                      <div key={key} className="flex justify-between gap-4 rounded-lg bg-white px-3 py-2 border border-gray-100">
                        <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                        <span className="font-medium text-gray-800 text-right break-words">{String(value || "-")}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedReport.booking && (
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm font-medium">Booking</p>
                    <p className="text-sm text-gray-600">{selectedReport.booking?.service || "-"}</p>
                    <p className="text-xs text-gray-500">{selectedReport.booking?.vehicle || ""}</p>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm font-medium">Updated At</p>
                  <p className="text-sm text-gray-600">{formatDate(selectedReport.updatedAt)}</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-sm text-gray-700">{selectedReport.description || "No description provided."}</p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Timeline</h3>
                <div className="space-y-2">
                  {Array.isArray(selectedReport.timeline) && selectedReport.timeline.length > 0 ? (
                    selectedReport.timeline.map((event, index) => (
                      <div key={index} className="flex items-center justify-between rounded-xl border p-3 bg-white">
                        <span className="text-sm text-gray-700 capitalize">{String(event.status || "").replace("-", " ")}</span>
                        <span className="text-xs text-gray-500">{formatDate(event.time)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400">No timeline data available.</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Update Status</h3>
                <select
                  value={selectedReport.status}
                  onChange={(e) => updateStatus(selectedReport.id, e.target.value)}
                  className="w-full border rounded-lg px-4 py-2"
                >
                  <option value="pending">Open</option>
                  <option value="in-progress">In Process</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <button
                onClick={() => {
                  const email = selectedReport.userDetails?.email || selectedReport.contactEmail || "";
                  const subject = encodeURIComponent(`Re: ${selectedReport.ticketId || selectedReport.reportId}`);
                  const body = encodeURIComponent(`Hello ${selectedReport.userDetails?.name || ""},\n\nI am writing regarding your support ticket ${selectedReport.ticketId || selectedReport.reportId}.\n\nIssue Type: ${selectedReport.issueType || selectedReport.issueCategory || "-"}\nDescription: ${selectedReport.description || "-"}\n\nPlease reply with any additional details or confirmation.\n\nThanks,\n`);
                  window.open(`mailto:${email}?subject=${subject}&body=${body}`, "_blank");
                }}
                className="w-full bg-red-600 text-white py-3 rounded-xl"
              >
                Reply via Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
