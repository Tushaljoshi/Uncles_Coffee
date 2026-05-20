import React, { useEffect, useState, useMemo } from "react";
import { Plus, Car, Wrench, X, Upload, Folder, Trash2, Edit2, Search, Filter, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import TopBar from "../components/TopBar.jsx";
import Sidebar from "../components/Sidebar.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CreateService = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [activeTab, setActiveTab] = useState("vehicle");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dropdown state: card ID track karne ke liye
  const [expandedId, setExpandedId] = useState(null);

  // Form states
  const [modalMode, setModalMode] = useState("service");
  const [categoryName, setCategoryName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);

  const [categories, setCategories] = useState({ vehicle: [], equipment: [] });

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Card click handler
  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === "vehicle") {
        const vRes = await fetch(`${API_BASE_URL}/api/client/vehicles`);
        if (vRes.status === 429) throw new Error("Rate limit exceeded. Please wait.");
        const vehicles = await vRes.json();

        const vehicleData = await Promise.all(vehicles.map(async (v) => {
          const sRes = await fetch(`${API_BASE_URL}/api/client/vehicle/${v.id}/services`);
          const services = await sRes.json();

          const servicesWithTypes = await Promise.all(services.map(async (s) => {
            try {
              const tRes = await fetch(`${API_BASE_URL}/api/client/vehicle/${v.id}/service/${s.id}/types`);
              const types = await tRes.json();
              return { ...s, types: Array.isArray(types) ? types : [] };
            } catch {
              return { ...s, types: [] };
            }
          }));

          return { id: v.id, name: v.name, icon: v.iconUrl, items: servicesWithTypes };
        }));
        setCategories(prev => ({ ...prev, vehicle: vehicleData }));
      } else {
        const eRes = await fetch(`${API_BASE_URL}/api/client/equipments`);
        const eData = await eRes.json();

        const equipments = Array.isArray(eData) ? eData : eData.data || [];

        setCategories(prev => ({
          ...prev,
          equipment: [{
            id: "all-equip",
            name: "General Equipment",
            items: equipments.map(e => ({
              id: e.id,
              name: e.name,
              icon: e.iconUrl,
              types: []
            }))
          }]
        }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAllData(); }, [activeTab]);

  const handleCreate = async () => {
    if (modalMode === "vehicle") {
      if (!categoryName?.trim()) return alert("Vehicle name is required");
      if (!iconFile) return alert("Vehicle icon is required");
    } else if (!itemName?.trim()) {
      return alert("Name is required");
    }
    if (modalMode === "service" && activeTab === "vehicle" && !selectedCategoryId) {
      return alert("Please select a vehicle");
    }
    if ((modalMode === "service" || modalMode === "type") && !iconFile) {
      return alert("Icon/Image is required");
    }
    try {
      setLoading(true);
      if (modalMode === "vehicle") {
        const vFormData = new FormData();
        vFormData.append("name", categoryName.trim());
        vFormData.append("icon", iconFile);

        const response = await fetch(`${API_BASE_URL}/api/admin/vehicle`, {
          method: "POST",
          body: vFormData,
        });

        if (!response.ok) throw new Error("Failed to create vehicle");

        setShowModal(false);
        resetModal();
        fetchAllData();
      } else if (modalMode === "type") {
        const formData = new FormData();
        formData.append("name", itemName.trim());
        formData.append("price", itemPrice);
        formData.append("description", itemDesc);
        formData.append("image", iconFile);

        const response = await fetch(`${API_BASE_URL}/api/admin/vehicle/${selectedCategoryId}/service/${selectedServiceId}/type`, {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          setShowModal(false);
          resetModal();
          fetchAllData();
        }
      } else {
        const formData = new FormData();
        formData.append("name", itemName.trim());
        formData.append("icon", iconFile);

        const endpoint = activeTab === "vehicle"
          ? `${API_BASE_URL}/api/admin/vehicle/${selectedCategoryId}/service`
          : `${API_BASE_URL}/api/admin/equipment`;

        const response = await fetch(endpoint, { method: "POST", body: formData });
        if (response.ok) {
          setShowModal(false);
          resetModal();
          fetchAllData();
        }
      }
    } catch (error) {
      alert("Action failed.");
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setCategoryName("");
    setItemName("");
    setItemPrice("");
    setItemDesc("");
    setSelectedCategoryId("");
    setSelectedServiceId("");
    setIconFile(null);
    setIconPreview(null);
    setModalMode("service");
  };

  const handleIconUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIconFile(file);
      setIconPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className={`flex-1 flex flex-col transition-all ${sidebarOpen ? "lg:ml-60" : "ml-0"}`}>
        <TopBar toggleSidebar={toggleSidebar} />

        <main className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Service Management</h2>
            <div className="flex gap-2">
              {activeTab === "vehicle" && (
                <button
                  onClick={() => { resetModal(); setModalMode("vehicle"); setShowModal(true); }}
                  className="bg-[#DC2626] text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  New Vehicle
                </button>
              )}
              <button onClick={() => { resetModal(); setModalMode("service"); setShowModal(true); }} className="bg-[#DC2626] text-white px-4 py-2 rounded-lg flex items-center gap-2">
                New Service
              </button>
              {activeTab === "vehicle" && (
                <button onClick={() => { resetModal(); setModalMode("type"); setShowModal(true); }} className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                New Service Type
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            {["vehicle", "equipment"].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg capitalize ${activeTab === tab ? "bg-red-600 text-white" : "bg-white border"}`}>
                {tab} Services
              </button>
            ))}
          </div>

          {error && <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">{error}</div>}

          <div className="space-y-4">
            {categories[activeTab]?.map(category => (
              <div key={category.id} className="bg-white rounded-xl border shadow-sm overflow-hidden">
                {/* Accordion Header (Card click karne par toggle hoga) */}
                <div
                  onClick={() => toggleExpand(category.id)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-red-50 p-2 rounded-lg text-red-600">
                      <Folder size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">{category.name}</h3>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-500">
                      {category.items.length} Services
                    </span>
                  </div>
                  {expandedId === category.id ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                </div>

                {/* Accordion Body (Expanded hone par hi dikhega) */}
                {expandedId === category.id && (
                  <div className="p-4 border-t bg-gray-50/50 space-y-4 animate-in fade-in slide-in-from-top-2">
                    {category.items.length === 0 ? (
                      <p className="text-center text-gray-400 text-sm py-4">No services added yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {category.items.map(item => (
                          <div key={item.id} className="border rounded-lg p-4 bg-white shadow-sm">
                            <div className="flex items-center gap-3 font-semibold mb-3 border-b pb-2">
                              <img src={item.iconUrl || item.icon} className="w-8 h-8 object-contain" alt="" />
                              <span className="flex-1 text-gray-700">{item.name}</span>
                            </div>

                            {/* Service Types inside the Service */}
                            {item.types && item.types.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {item.types.map(type => (
                                  <div key={type.id} className="bg-gray-50 p-3 rounded border flex items-center gap-3">
                                    <img src={type.imageUrl} className="w-10 h-10 rounded object-cover" alt="" />
                                    <div className="text-sm">
                                      <p className="font-bold text-gray-800">{type.name}</p>
                                      <p className="font-bold text-gray-800">{type.description}</p>
                                      <p className="text-red-600 font-semibold">₹{type.price}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Modal code remains the same... */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between mb-4 border-b pb-2">
              <h3 className="text-xl font-bold">
                {modalMode === "type" ? "Add Service Type" : modalMode === "vehicle" ? "Add Vehicle" : "Add Service"}
              </h3>
              <X className="cursor-pointer hover:text-red-600" onClick={() => setShowModal(false)} />
            </div>

            <div className="space-y-4">
              {modalMode === "type" ? (
                <>
                  <label className="block text-sm font-medium">Select Vehicle & Service</label>
                  <select className="w-full border p-2 rounded-lg" onChange={(e) => setSelectedCategoryId(e.target.value)}>
                    <option value="">Choose Vehicle</option>
                    {categories.vehicle.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                  <select className="w-full border p-2 rounded-lg" onChange={(e) => setSelectedServiceId(e.target.value)}>
                    <option value="">Choose Service</option>
                    {categories.vehicle.find(v => v.id === selectedCategoryId)?.items.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <input type="number" placeholder="Price (e.g. 500)" className="w-full border p-2 rounded-lg" onChange={(e) => setItemPrice(e.target.value)} />
                  <textarea placeholder="Description" className="w-full border p-2 rounded-lg" onChange={(e) => setItemDesc(e.target.value)} />
                </>
              ) : modalMode === "vehicle" ? (
                <input
                  type="text"
                  placeholder="Vehicle Name"
                  className="w-full border p-2 rounded-lg"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                />
              ) : (
                <>
                  {activeTab === "vehicle" && (
                    <select
                      className="w-full border p-2 rounded-lg"
                      value={selectedCategoryId}
                      onChange={(e) => setSelectedCategoryId(e.target.value)}
                    >
                      <option value="">Choose Vehicle</option>
                      {categories.vehicle.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                  )}
                </>
              )}

              {modalMode !== "vehicle" && (
                <input
                  type="text"
                  placeholder="Name"
                  className="w-full border p-2 rounded-lg"
                  onChange={(e) => setItemName(e.target.value)}
                />
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Upload Icon/Image</label>
                <div className="flex items-center gap-4">

                  {/* Upload Button */}
                  <label className="flex items-center justify-center px-4 py-2 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
                    <span className="text-sm text-gray-600 font-medium">
                      Upload Icon
                    </span>
                    <input
                      type="file"
                      onChange={handleIconUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Preview */}
                  {iconPreview && (
                    <div className="relative">
                      <img
                        src={iconPreview}
                        alt="preview"
                        className="w-14 h-14 rounded-xl border shadow-sm object-cover"
                      />

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => setIconPreview(null)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                </div>
              </div>

              <button onClick={handleCreate} disabled={loading} className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700">
                {loading ? "Processing..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateService;