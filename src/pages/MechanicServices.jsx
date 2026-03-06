import React, { useState, useEffect } from "react";
import { Plus, X, Wrench, Car, Trash2Icon } from "lucide-react";
import TopBar from "../components/TopBar.jsx";
import Sidebar from "../components/Sidebar.jsx";

const API_BASE_URL = "https://bmm-backend.onrender.com/api/mechanic-services";

const ListItem = ({ label, id, onDelete, isDeleting }) => (
  <div className="flex items-center justify-between px-4 py-3 rounded-lg border bg-gray-50 hover:bg-gray-100 transition">
    <span className="text-sm font-medium text-gray-800">{label}</span>
    <button
      onClick={() => onDelete(id)}
      disabled={isDeleting}
      className="text-gray-400 hover:text-red-600 disabled:opacity-50 transition"
    >
      <Trash2Icon size={16} />
    </button>
  </div>
);

const SHOW_LIMIT = 4;

const MechanicServices = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // skills | vehicles
  const [inputValue, setInputValue] = useState("");

  const [showAllSkills, setShowAllSkills] = useState(false);
  const [showAllVehicles, setShowAllVehicles] = useState(false);

  const [skills, setSkills] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Fetch Skills
  const fetchSkills = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/skills`);
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setSkills(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching skills:", err);
      setError("Failed to load skills");
    }
  };

  // Fetch Vehicles
  const fetchVehicles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles`);
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setVehicles(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      setError("Failed to load vehicles");
    }
  };

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchSkills(), fetchVehicles()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Add Skill or Vehicle
  const handleAddItem = async () => {
    if (!inputValue.trim()) return;

    setIsAdding(true);
    try {
      const endpoint =
        modalType === "skills"
          ? `${API_BASE_URL}/skills`
          : `${API_BASE_URL}/vehicles`;
      const body =
        modalType === "skills"
          ? { skillName: inputValue }
          : { vehicleName: inputValue };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (data.success) {
        if (modalType === "skills") {
          await fetchSkills();
          setShowAllSkills(true);
        } else {
          await fetchVehicles();
          setShowAllVehicles(true);
        }
        setShowModal(false);
        setInputValue("");
      }
    } catch (err) {
      console.error("Error adding item:", err);
      setError(
        modalType === "skills"
          ? "Failed to add skill"
          : "Failed to add vehicle"
      );
    } finally {
      setIsAdding(false);
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setInputValue("");
    setShowModal(true);
  };

  const visibleSkills = showAllSkills
    ? skills
    : skills.slice(0, SHOW_LIMIT);

  const visibleVehicles = showAllVehicles
    ? vehicles
    : vehicles.slice(0, SHOW_LIMIT);

  const handleDeleteSkill = async (id) => {
    setDeletingId(id);
    try {
      const response = await fetch(`${API_BASE_URL}/skills/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        await fetchSkills();
      }
    } catch (err) {
      console.error("Error deleting skill:", err);
      setError("Failed to delete skill");
    } finally {
      setDeletingId("");
    }
  };

  const handleDeleteVehicle = async (id) => {
    setDeletingId(id);
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        await fetchVehicles();
      }
    } catch (err) {
      console.error("Error deleting vehicle:", err);
      setError("Failed to delete vehicle");
    } finally {
      setDeletingId("");
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
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarOpen ? "lg:ml-60" : "ml-0"
        }`}
      >
        <TopBar toggleSidebar={toggleSidebar} />

        {/* ================= MAIN CONTENT ================= */}
        <main className="flex-1 p-6 overflow-auto">
          {/* PAGE HEADER */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800">
              Mechanic Services Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage skills, expertise, and serviceable vehicles for mechanics
            </p>
          </div>

          {/* ================= GRID ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl">
            {/* ===== SKILLS ===== */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Wrench size={18} className="text-red-600" />
                  Skills & Expertise
                </h3>

                <button
                  onClick={() => openModal("skills")}
                  className="text-sm text-red-600 font-medium hover:underline"
                >
                  + Add Skill
                </button>
              </div>

              {loading ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : (
                <>
                  <div className="space-y-3">
                    {visibleSkills.map((item) => (
                      <ListItem
                        key={item.id}
                        id={item.id}
                        label={item.skillName}
                        onDelete={handleDeleteSkill}
                        isDeleting={deletingId === item.id}
                      />
                    ))}
                  </div>

                  {skills.length > SHOW_LIMIT && (
                    <button
                      onClick={() => setShowAllSkills(!showAllSkills)}
                      className="text-xs text-red-600 mt-4 hover:underline"
                    >
                      {showAllSkills ? "View Less" : "View More"}
                    </button>
                  )}
                </>
              )}
            </div>

            {/* ===== VEHICLES ===== */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Car size={18} className="text-red-600" />
                  Vehicles / Equipment
                </h3>

                <button
                  onClick={() => openModal("vehicles")}
                  className="text-sm text-red-600 font-medium hover:underline"
                >
                  + Add Vehicle
                </button>
              </div>

              {loading ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : (
                <>
                  <div className="space-y-3">
                    {visibleVehicles.map((item) => (
                      <ListItem
                        key={item.id}
                        id={item.id}
                        label={item.vehicleName}
                        onDelete={handleDeleteVehicle}
                        isDeleting={deletingId === item.id}
                      />
                    ))}
                  </div>

                  {vehicles.length > SHOW_LIMIT && (
                    <button
                      onClick={() => setShowAllVehicles(!showAllVehicles)}
                      className="text-xs text-red-600 mt-4 hover:underline"
                    >
                      {showAllVehicles ? "View Less" : "View More"}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-600"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Add {modalType === "skills" ? "Skill / Expertise" : "Vehicle / Equipment"}
            </h3>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                modalType === "skills"
                  ? "e.g. Engine Diagnostics"
                  : "e.g. Tractor"
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-300
                         focus:ring-2 focus:ring-red-500 focus:border-red-500"
              disabled={isAdding}
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border py-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                disabled={isAdding}
              >
                Cancel
              </button>
              <button
                onClick={handleAddItem}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium disabled:opacity-50"
                disabled={isAdding || !inputValue.trim()}
              >
                {isAdding ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MechanicServices;