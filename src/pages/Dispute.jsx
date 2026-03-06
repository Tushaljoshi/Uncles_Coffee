import React, { useState } from "react";
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

/* ================= DUMMY DISPUTE DATA ================= */

const DUMMY_DISPUTES = [
  {
    id: 1,
    disputeId: "DS-226412",
    service: "General Service",
    vehicle: "Hyundai i20 | Petrol | MH 12 AB 1234",
    dateTime: "28 Dec, 2025 | 10:15 AM",
    username: "Vivek Sharma",
    email: "vivek054@gmail.com",
    reason: "Unsatisfactory service quality",
    description: "Mechanic did not complete service properly.",
    status: "submitted",
    createdAt: "29 Nov, 10:15 AM",
  },
  {
    id: 2,
    disputeId: "DS-226413",
    service: "Brake Service",
    vehicle: "Honda City | Petrol | DL 01 AA 7788",
    dateTime: "25 Dec, 2025 | 04:30 PM",
    username: "Ananya Verma",
    email: "ananya@gmail.com",
    reason: "Incorrect charges & bill discrepancy",
    description: "Charged more than estimated amount.",
    status: "under-review",
    createdAt: "28 Nov, 02:20 PM",
  },
];

const STATUS_FLOW = [
  "submitted",
  "under-review",
  "in-progress",
  "resolved",
];

const AdminDisputePage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [disputes, setDisputes] = useState(DUMMY_DISPUTES);
  const [selectedDispute, setSelectedDispute] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  /* ================= FILTER LOGIC ================= */

  const filteredDisputes = disputes.filter((d) => {
    const matchSearch =
      d.username.toLowerCase().includes(search.toLowerCase()) ||
      d.email.toLowerCase().includes(search.toLowerCase()) ||
      d.disputeId.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "all" || d.status === statusFilter;

    return matchSearch && matchStatus;
  });

  /* ================= UPDATE STATUS ================= */

  const updateStatus = (id, newStatus) => {
    setDisputes((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, status: newStatus } : d
      )
    );

    setSelectedDispute((prev) =>
      prev ? { ...prev, status: newStatus } : null
    );
  };

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
                Dispute Management
              </h1>
              <p className="text-sm text-gray-500">
                Manage disputes raised by customers
              </p>
            </div>

            <button className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg">
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {/* SEARCH & FILTER */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email or dispute ID"
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
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="under-review">Under Review</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4 text-left">User</th>
                  <th className="p-4 text-left">Service</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Date</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredDisputes.length ? (
                  filteredDisputes.map((d) => (
                    <tr key={d.id} className="border-t hover:bg-gray-50">
                      <td className="p-4">
                        <p className="font-medium">{d.username}</p>
                        <p className="text-xs text-gray-500">{d.email}</p>
                      </td>
                      <td className="p-4">{d.service}</td>
                      <td className="p-4 text-center capitalize">
                        {d.status.replace("-", " ")}
                      </td>
                      <td className="p-4 text-center">{d.createdAt}</td>
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

      {/* ================= DISPUTE MODAL ================= */}
      {selectedDispute && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden">
            <div className="p-5 border-b flex justify-between">
              <h2 className="font-semibold">Dispute Status</h2>
              <button onClick={() => setSelectedDispute(null)}>
                <X />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-red-50 p-4 rounded-xl">
                <p className="text-sm font-medium">Dispute ID</p>
                <p className="text-sm text-gray-600">
                  #{selectedDispute.disputeId}
                </p>
              </div>

              {/* STATUS TIMELINE */}
              <div>
                <h3 className="font-medium mb-2">Status</h3>
                {STATUS_FLOW.map((s, i) => (
                  <div key={s} className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        STATUS_FLOW.indexOf(selectedDispute.status) >= i
                          ? "bg-red-600"
                          : "border"
                      }`}
                    />
                    <p className="text-sm capitalize">
                      {s.replace("-", " ")}
                    </p>
                  </div>
                ))}
              </div>

              <p className="text-sm text-gray-700">
                <strong>Reason:</strong> {selectedDispute.reason}
              </p>

              <p className="text-sm text-gray-600">
                {selectedDispute.description}
              </p>

              <select
                value={selectedDispute.status}
                onChange={(e) =>
                  updateStatus(selectedDispute.id, e.target.value)
                }
                className="w-full border rounded-lg px-4 py-2"
              >
                <option value="submitted">Submitted</option>
                <option value="under-review">Under Review</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>

              <button
                onClick={() =>
                  window.open(
                    `mailto:${selectedDispute.email}`,
                    "_blank"
                  )
                }
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

export default AdminDisputePage;
