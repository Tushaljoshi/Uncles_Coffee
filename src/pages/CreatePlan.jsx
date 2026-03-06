import React, { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import TopBar from "../components/TopBar.jsx";
import Sidebar from "../components/Sidebar.jsx";

/* ================= PLAN SKELETON ================= */

const PlanSkeleton = () => (
  <div className="bg-white border rounded-xl p-4 shadow-sm animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
    <div className="h-3 bg-gray-200 rounded w-1/2" />
  </div>
);

const SubscriptionPlans = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState("");

  const [planName, setPlanName] = useState("");
  const [planPrice, setPlanPrice] = useState("");

  const [plans, setPlans] = useState([]);

  const API_BASE = "https://bmm-backend.onrender.com/api/plans";

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  /* ================= FETCH PLANS ================= */
  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(API_BASE);
      const data = await response.json();

      if (data.success) {
        setPlans(data.data);
      } else {
        setError("Failed to fetch plans");
      }
    } catch (err) {
      setError("Error fetching plans: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= CREATE PLAN ================= */

  const handleCreatePlan = async () => {
    if (!planName || !planPrice) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setCreating(true);
      setError("");
      const response = await fetch(API_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planName: planName,
          pricePerDay: Number(planPrice),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPlanName("");
        setPlanPrice("");
        setShowModal(false);
        await fetchPlans();
      } else {
        setError("Failed to create plan");
      }
    } catch (err) {
      setError("Error creating plan: " + err.message);
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  /* ================= DELETE PLAN ================= */

  const handleDeletePlan = async (planId) => {
    if (!window.confirm("Are you sure you want to delete this plan?")) return;

    try {
      setDeleting(planId);
      setError("");
      const response = await fetch(`${API_BASE}/${planId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        await fetchPlans();
      } else {
        setError("Failed to delete plan");
      }
    } catch (err) {
      setError("Error deleting plan: " + err.message);
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? "lg:ml-60" : "ml-0"
          }`}
      >
        <TopBar toggleSidebar={toggleSidebar} />

        <main className="flex-1 p-6 overflow-auto">
          {/* ERROR MESSAGE */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex justify-between items-center">
              <span>{error}</span>
              <button onClick={() => setError("")} className="text-red-500 hover:text-red-700">
                <X size={18} />
              </button>
            </div>
          )}

          {/* HEADER */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Subscription Plans
            </h2>

            <button
              onClick={() => setShowModal(true)}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
            >
              <Plus size={18} />
              Create Plan
            </button>
          </div>

          {/* PLANS LIST / SKELETON */}
          {loading ? (
            <div className="bg-white rounded-lg border overflow-hidden">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 border-b bg-gray-50 animate-pulse" />
              ))}
            </div>
          ) : plans.length > 0 ? (
            <div className="overflow-x-auto bg-white border rounded-lg shadow-sm">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Plan Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Price Per Day</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Created At</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {plans.map((plan) => (
                    <tr key={plan.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-800">
                        {plan.planName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 text-red-600 font-semibold">
                          ₹ {plan.pricePerDay}
                          <span className="text-xs font-medium text-red-500">/ day</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(plan.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleDeletePlan(plan.id)}
                          disabled={deleting === plan.id}
                          className="text-red-600 hover:bg-red-50 p-2 rounded inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium hover:text-red-700"
                          title="Delete plan"
                        >
                          <X size={16} />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}


          {/* EMPTY STATE */}
          {!loading && plans.length === 0 && (
            <div className="flex flex-col items-center mt-20 justify-center h-[300px] text-center">
              <div className="w-20 h-20 flex items-center justify-center rounded-full bg-red-100 mb-4">
                <Plus className="text-red-600" size={36} />
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                No Plans Found
              </h3>

              <p className="text-sm text-gray-500 max-w-sm mb-4">
                You haven’t created any subscription plans yet.
              </p>

              <button
                onClick={() => setShowModal(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 font-medium"
              >
                <Plus size={18} />
                Create Plan
              </button>
            </div>
          )}
        </main>
      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-600"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Create Subscription Plan
            </h3>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* PLAN NAME */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Plan Name
                </label>
                <input
                  type="text"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  disabled={creating}
                  placeholder="e.g. Basic Plan"
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300
                             focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100"
                />
              </div>

              {/* PLAN PRICE */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Price Per Day (₹)
                </label>

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={planPrice}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || Number(value) >= 0) {
                      setPlanPrice(value);
                    }
                  }}
                  disabled={creating}
                  placeholder="e.g. 99"
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300
               focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100"
                />
              </div>


              {/* ACTIONS */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={creating}
                  className="flex-1 border py-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePlan}
                  disabled={creating}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-500 text-white py-2 rounded-lg font-medium disabled:cursor-not-allowed"
                >
                  {creating ? "Creating..." : "Create Plan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlans;
