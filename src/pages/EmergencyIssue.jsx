import React, { useEffect, useState } from "react";
import TopBar from "../components/TopBar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import Toast from "../components/Toast.jsx";
import { useToast } from "../hooks/useToast.js";

const EmergencyIssue = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const toggleSidebar = () => setSidebarOpen((p) => !p);

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const [issues, setIssues] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [issueType, setIssueType] = useState("");
  const [price, setPrice] = useState("");

  const [visitCosts, setVisitCosts] = useState([]);
  const [cycleName, setCycleName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [visitCost, setVisitCost] = useState("");
  const [editingVisitCostId, setEditingVisitCostId] = useState(null);
  const [editVisitCost, setEditVisitCost] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editType, setEditType] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [showAllModal, setShowAllModal] = useState(false);
  const [showVisitCostsModal, setShowVisitCostsModal] = useState(false);

  const { toasts, addToast } = useToast();

  const fetchIssues = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/VisibleIssue`);
      const json = await res.json();
      if (json.success) setIssues(json.data || []);
      else addToast(json.message || "Failed to fetch issues", "error");
    } catch (e) {
      addToast("Server error", "error");
    }
  };

  const fetchVisitCosts = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/VisitCost`);
      const json = await res.json();
      if (json.success) setVisitCosts(json.data || []);
      else addToast(json.message || "Failed to fetch visit costs", "error");
    } catch (e) {
      addToast("Server error", "error");
    }
  };

  const fetchAllData = async () => {
    try {
      setRefreshing(true);
      await Promise.all([fetchIssues(), fetchVisitCosts()]);
    } finally {
      setRefreshing(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => { fetchAllData(); }, []);

  const createIssue = async () => {
    if (!issueType || !price) { addToast("Provide issue type and price", "warning"); return; }
    try {
      const res = await fetch(`${API_BASE}/api/admin/VisibleIssue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueType, price: Number(price) }),
      });
      const json = await res.json();
      if (json.success) {
        const createdAt = { _seconds: Math.floor(Date.now() / 1000), _nanoseconds: 0 };
        addToast("Visible issue created successfully", "success");
        setIssues((p) => [{ id: json.issueId, issueType, price: Number(price), createdAt }, ...p]);
        setIssueType("");
        setPrice("");
      } else addToast(json.message || "Create failed", "error");
    } catch {
      addToast("Server error", "error");
    }
  };

  const createVisitCost = async () => {
    if (!cycleName || !startTime || !endTime || !visitCost) {
      addToast("Provide cycle name, start/end times and cost", "warning");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/admin/VisitCost`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cycleName,
          startTime,
          endTime,
          visitCost: Number(visitCost),
        }),
      });
      const json = await res.json();
      if (json.success) {
        const createdAt = { _seconds: Math.floor(Date.now() / 1000), _nanoseconds: 0 };
        addToast("Visit cost created successfully", "success");
        setVisitCosts((p) => [{ id: json.id, cycleName, startTime, endTime, visitCost: Number(visitCost), createdAt }, ...p]);
        setCycleName("");
        setStartTime("");
        setEndTime("");
        setVisitCost("");
      } else {
        addToast(json.message || "Create failed", "error");
      }
    } catch {
      addToast("Server error", "error");
    }
  };

  const startEdit = (it) => {
    setEditingId(it.id);
    setEditType(it.issueType || "");
    setEditPrice(it.price || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditType("");
    setEditPrice("");
  };

  const startVisitCostEdit = (item) => {
    setEditingVisitCostId(item.id);
    setEditVisitCost(item.visitCost || "");
  };

  const cancelVisitCostEdit = () => {
    setEditingVisitCostId(null);
    setEditVisitCost("");
  };

  const saveVisitCostEdit = async (id) => {
    if (!editVisitCost) {
      addToast("Provide a visit cost amount", "warning");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/admin/VisitCost/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitCost: Number(editVisitCost) }),
      });
      const json = await res.json();
      if (json.success) {
        addToast("Visit cost updated successfully", "success");
        setVisitCosts((prev) => prev.map((item) => (item.id === id ? { ...item, visitCost: Number(editVisitCost) } : item)));
        cancelVisitCostEdit();
      } else {
        addToast(json.message || "Update failed", "error");
      }
    } catch {
      addToast("Server error", "error");
    }
  };

  const deleteVisitCost = async (id) => {
    if (!window.confirm("Delete this visit cost?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/VisitCost/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        addToast("Visit cost deleted successfully", "success");
        setVisitCosts((prev) => prev.filter((item) => item.id !== id));
        if (editingVisitCostId === id) cancelVisitCostEdit();
      } else {
        addToast(json.message || "Delete failed", "error");
      }
    } catch {
      addToast("Server error", "error");
    }
  };

  const saveEdit = async (id) => {
    if (!editType || !editPrice) { addToast("Provide issue type and price", "warning"); return; }
    try {
      const res = await fetch(`${API_BASE}/api/admin/VisibleIssue/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueType: editType, price: Number(editPrice) }),
      });
      const json = await res.json();
      if (json.success) {
        addToast("Issue updated successfully", "success");
        setIssues((prev) => prev.map((it) => (it.id === id ? { ...it, issueType: editType, price: Number(editPrice) } : it)));
        cancelEdit();
      } else addToast(json.message || "Update failed", "error");
    } catch {
      addToast("Server error", "error");
    }
  };

  const deleteIssue = async (id) => {
    if (!window.confirm("Delete this issue?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/VisibleIssue/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        addToast("Issue deleted successfully", "success");
        setIssues((prev) => prev.filter((it) => it.id !== id));
      } else addToast(json.message || "Delete failed", "error");
    } catch {
      addToast("Server error", "error");
    }
  };

  const formatTime = (ts) => {
    if (!ts) return "-";
    const seconds = ts._seconds ?? ts.seconds ?? null;
    if (!seconds) return "-";
    return new Date(seconds * 1000).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className={`flex-1 transition-all ${sidebarOpen ? "lg:ml-60" : ""}`}>
        <TopBar toggleSidebar={toggleSidebar} />

        <main className="p-6 max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Visible Issues</h1>
              <p className="text-sm text-gray-400 mt-0.5">Manage emergency vehicle visible issues and pricing</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={fetchAllData} className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm">{refreshing ? 'Refreshing...' : 'Refresh'}</button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-5 rounded-2xl border">
                <h2 className="text-lg font-semibold mb-3">Create Visible Issue</h2>
                <label className="text-sm text-gray-600">Issue type</label>
                <input value={issueType} onChange={(e) => setIssueType(e.target.value)} className="w-full mt-1 mb-3 p-2 border rounded-md" placeholder="e.g. Dent" />
                <label className="text-sm text-gray-600">Price</label>
                <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" className="w-full mt-1 mb-4 p-2 border rounded-md" placeholder="300" />
                <div className="flex gap-3">
                  <button onClick={createIssue} className="flex-1 bg-red-600 text-white py-2 rounded-xl">Create</button>
                  <button onClick={() => { setIssueType(''); setPrice(''); }} className="flex-1 border py-2 rounded-xl">Clear</button>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border">
                <h2 className="text-lg font-semibold mb-3">Visit Cost</h2>
                <label className="text-sm text-gray-600">Cycle name</label>
                <input value={cycleName} onChange={(e) => setCycleName(e.target.value)} className="w-full mt-1 mb-3 p-2 border rounded-md" placeholder="Evening" />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-600">Start time</label>
                    <input value={startTime} onChange={(e) => setStartTime(e.target.value)} type="time" className="w-full mt-1 p-2 border rounded-md" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">End time</label>
                    <input value={endTime} onChange={(e) => setEndTime(e.target.value)} type="time" className="w-full mt-1 p-2 border rounded-md" />
                  </div>
                </div>
                <label className="text-sm text-gray-600 mt-3 block">Visit cost</label>
                <input value={visitCost} onChange={(e) => setVisitCost(e.target.value)} type="number" className="w-full mt-1 mb-4 p-2 border rounded-md" placeholder="600" />
                <div className="flex gap-3">
                  <button onClick={createVisitCost} className="flex-1 bg-red-600 text-white py-2 rounded-xl">Create</button>
                  <button onClick={() => { setCycleName(''); setStartTime(''); setEndTime(''); setVisitCost(''); }} className="flex-1 border py-2 rounded-xl">Clear</button>
                </div>

                {editingVisitCostId && (
                  <div className="mt-5 rounded-2xl bg-gray-50 p-4 border">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">Update Visit Cost</div>
                        <div className="text-xs text-gray-500">Edit only the cost for the selected cycle</div>
                      </div>
                      <button onClick={cancelVisitCostEdit} className="text-sm text-red-600 hover:underline">Cancel</button>
                    </div>
                    <label className="text-sm text-gray-600">New cost</label>
                    <input value={editVisitCost} onChange={(e) => setEditVisitCost(e.target.value)} type="number" className="w-full mt-1 mb-4 p-2 border rounded-md" />
                    <button onClick={() => saveVisitCostEdit(editingVisitCostId)} className="w-full bg-red-600 text-white py-2 rounded-xl text-sm">Save cost</button>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">Issues</h2>
                {issues.length > 4 && (
                  <button onClick={() => setShowAllModal(true)} className="text-sm text-red-600 hover:underline">See all</button>
                )}
              </div>

              {initialLoading ? (
                <div className="text-center py-12 text-gray-400">Loading…</div>
              ) : issues.length === 0 ? (
                <div className="text-center py-12 text-gray-400">No visible issues</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left table-auto">
                    <thead>
                      <tr className="text-sm text-gray-500 border-b">
                        <th className="py-2">Issue</th>
                        <th className="py-2">Price</th>
                        <th className="py-2">Created</th>
                        <th className="py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {issues.slice(0, 4).map((it) => (
                        <tr key={it.id} className="border-b last:border-b-0">
                          <td className="py-3">
                            {editingId === it.id ? (
                              <input value={editType} onChange={(e) => setEditType(e.target.value)} className="p-2 border rounded-md w-full" />
                            ) : (
                              <div className="text-sm font-medium text-gray-800">{it.issueType}</div>
                            )}
                          </td>
                          <td className="py-3 w-40">
                            {editingId === it.id ? (
                              <input value={editPrice} onChange={(e) => setEditPrice(e.target.value)} type="number" className="p-2 border rounded-md w-full" />
                            ) : (
                              <div className="text-sm text-gray-700">₹{it.price}</div>
                            )}
                          </td>
                          <td className="py-3 text-sm text-gray-500">{formatTime(it.createdAt)}</td>
                          <td className="py-3">
                            {editingId === it.id ? (
                              <div className="flex gap-2">
                                <button onClick={() => saveEdit(it.id)} className="px-3 py-1 bg-red-600 text-white rounded-md text-sm">Save</button>
                                <button onClick={cancelEdit} className="px-3 py-1 border rounded-md text-sm">Cancel</button>
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <button onClick={() => startEdit(it)} className="px-3 py-1 border rounded-md text-sm">Edit</button>
                                <button onClick={() => deleteIssue(it.id)} className="px-3 py-1 bg-red-600 text-white rounded-md text-sm">Delete</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {issues.length > 4 && (
                    <div className="mt-4 text-sm text-gray-500">Showing top 4 issues. Click "See all" to view the rest.</div>
                  )}

                  {visitCosts.length > 0 && (
                    <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-md font-semibold text-gray-900">Visit Costs</h3>
                        <div className="flex items-center gap-3">
                          {visitCosts.length > 2 && (
                            <button onClick={() => setShowVisitCostsModal(true)} className="text-sm text-red-600 hover:underline">See all</button>
                          )}
                          <button onClick={fetchVisitCosts} className="text-sm text-red-600 hover:underline">Refresh</button>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {visitCosts.slice(0, 2).map((item) => (
                          <div key={item.id} className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <div className="font-semibold mt-6 text-gray-900">{item.cycleName}</div>
                                <div className="text-sm mt-6 text-gray-500">{item.startTime} - {item.endTime}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-semibold text-gray-900">₹{item.visitCost}</div>
                              </div>
                            </div>
                            <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                              <button onClick={() => startVisitCostEdit(item)} className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100">Edit</button>
                              <button onClick={() => deleteVisitCost(item.id)} className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-600 hover:bg-red-100">Delete</button>
                            </div>
                          </div>
                        ))}
                      </div>
                      {visitCosts.length > 2 && <div className="mt-3 text-xs text-gray-500">Showing latest 2 visit costs.</div>}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* See-all modal */}
      {showAllModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAllModal(false)} />
          <div className="relative bg-white rounded-2xl w-[min(96%,900px)] max-h-[80vh] overflow-hidden shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">All Visible Issues</h3>
              <button onClick={() => setShowAllModal(false)} className="text-gray-500 hover:text-red-600">Close</button>
            </div>
            <div className="p-4 overflow-y-auto" style={{ maxHeight: '66vh' }}>
              {issues.map((it) => (
                <div key={it.id} className="mb-3 p-3 rounded-lg border">
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="font-semibold text-gray-800">{it.issueType}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-800">₹{it.price}</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-end">
                      <button
                        onClick={() => { startEdit(it); setShowAllModal(false); }}
                        className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => { deleteIssue(it.id); setShowAllModal(false); }}
                        disabled={editingId === it.id}
                        className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showVisitCostsModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowVisitCostsModal(false)} />
          <div className="relative bg-white rounded-2xl w-[min(96%,900px)] max-h-[80vh] overflow-hidden shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">All Visit Costs</h3>
              <button onClick={() => setShowVisitCostsModal(false)} className="text-gray-500 hover:text-red-600">Close</button>
            </div>
            <div className="p-4 overflow-y-auto" style={{ maxHeight: '66vh' }}>
              {visitCosts.map((item) => (
                <div key={item.id} className="mb-3 p-3 rounded-lg border">
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="font-semibold text-gray-800">{item.cycleName}</div>
                        <div className="text-sm text-gray-500">{item.startTime} - {item.endTime}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-800">₹{item.visitCost}</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-end">
                      <button
                        onClick={() => { startVisitCostEdit(item); setShowVisitCostsModal(false); }}
                        className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => { deleteVisitCost(item.id); setShowVisitCostsModal(false); }}
                        className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 transition hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Toast toasts={toasts} />
    </div>
  );
};

export default EmergencyIssue;
