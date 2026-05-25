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
  const [editingVehicleId, setEditingVehicleId] = useState(null);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [editingServiceCategoryId, setEditingServiceCategoryId] = useState(null);
  const [editingTypeId, setEditingTypeId] = useState(null);
  const [editingTypeServiceId, setEditingTypeServiceId] = useState(null);
  const [editingTypeCategoryId, setEditingTypeCategoryId] = useState(null);
  const [editingEquipmentId, setEditingEquipmentId] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);

  const [categories, setCategories] = useState({ vehicle: [], equipment: [] });
  // Brand states
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [brandsList, setBrandsList] = useState([]);
  const [brandsVehicleId, setBrandsVehicleId] = useState(null);
  const [brandName, setBrandName] = useState("");
  const [editingBrandIdLocal, setEditingBrandIdLocal] = useState(null);
  const [brandLoading, setBrandLoading] = useState(false);

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

          return {  
            id: v.id,
            name: v.name,
            icon: v.iconUrl || v.icon || v.icon_url || "",
            items: servicesWithTypes
          };
        }));
        // order vehicles according to preferred sequence
        const orderGroups = [
          ["scooter"],
          ["bike", "bicycle","2-wheeler"],
          ["car", "cars"],
          ["3-wheeler","3-wheeler", "three", "three-wheeler", "three wheeler"],
          ["pickup", "van"],
          ["tractor", "tractors"],
          ["bus", "Bus", "BUS", "Bus"],
          ["truck"],
        ];

        const getOrderIndex = (name = "") => {
          const n = name.toLowerCase();
          for (let i = 0; i < orderGroups.length; i++) {
            for (const kw of orderGroups[i]) {
              if (n.includes(kw)) return i;
            }
          }
          return orderGroups.length; // put unknowns at the end
        };

        vehicleData.sort((a, b) => {
          return getOrderIndex(a.name) - getOrderIndex(b.name);
        });

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

  // Brands API helpers
  const fetchBrands = async (vehicleId) => {
    if (!vehicleId) return;
    setBrandLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/vehicle/${vehicleId}/brand`);
      if (!res.ok) throw new Error("Failed to fetch brands");
      const data = await res.json();
      setBrandsList(Array.isArray(data) ? data : []);
    } catch (err) {
      alert(err.message || "Failed to load brands");
      setBrandsList([]);
    } finally {
      setBrandLoading(false);
    }
  };

  const openBrandsModal = (vehicleId) => {
    setBrandsVehicleId(vehicleId);
    setBrandName("");
    setEditingBrandIdLocal(null);
    fetchBrands(vehicleId);
    setShowBrandModal(true);
  };

  const resetBrandModal = () => {
    setBrandsVehicleId(null);
    setBrandsList([]);
    setBrandName("");
    setEditingBrandIdLocal(null);
    setShowBrandModal(false);
  };

  const handleCreateBrand = async () => {
    if (!brandName?.trim()) return alert("Brand name is required");
    if (!brandsVehicleId) return alert("Vehicle not selected");
    try {
      setBrandLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/vehicle/${brandsVehicleId}/brand`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: brandName.trim() })
      });
      if (!res.ok) throw new Error("Failed to create brand");
      const data = await res.json().catch(() => ({}));
      alert(data.message || "Brand created");
      setBrandName("");
      fetchBrands(brandsVehicleId);
    } catch (err) {
      alert(err.message || "Create brand failed");
    } finally {
      setBrandLoading(false);
    }
  };

  const handleUpdateBrand = async () => {
    if (!brandName?.trim()) return alert("Brand name is required");
    if (!brandsVehicleId || !editingBrandIdLocal) return alert("Missing info");
    try {
      setBrandLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/vehicle/${brandsVehicleId}/brand/${editingBrandIdLocal}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: brandName.trim() })
      });
      if (!res.ok) throw new Error("Failed to update brand");
      const data = await res.json().catch(() => ({}));
      alert(data.message || "Brand updated");
      setBrandName("");
      setEditingBrandIdLocal(null);
      fetchBrands(brandsVehicleId);
    } catch (err) {
      alert(err.message || "Update brand failed");
    } finally {
      setBrandLoading(false);
    }
  };

  const handleDeleteBrand = async (brandId) => {
    if (!brandsVehicleId || !brandId) return;
    if (!window.confirm("Delete this brand?")) return;
    try {
      setBrandLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/vehicle/${brandsVehicleId}/brand/${brandId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete brand");
      const data = await res.json().catch(() => ({}));
      alert(data.message || "Brand deleted");
      fetchBrands(brandsVehicleId);
    } catch (err) {
      alert(err.message || "Delete brand failed");
    } finally {
      setBrandLoading(false);
    }
  };

  const handleCreate = async () => {
    if (modalMode === "vehicle" || modalMode === "editVehicle") {
      if (!categoryName?.trim()) return alert("Vehicle name is required");
      if (modalMode === "vehicle" && !iconFile) return alert("Vehicle icon is required");
    } else if (modalMode === "editService") {
      if (!itemName?.trim()) return alert("Name is required");
    } else if (modalMode === "editType") {
      if (!itemName?.trim()) return alert("Name is required");
      if (!itemPrice) return alert("Price is required");
    } else if (modalMode === "editEquipment") {
      if (!itemName?.trim()) return alert("Name is required");
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
      } else if (modalMode === "editVehicle") {
        const updateData = new FormData();
        updateData.append("name", categoryName.trim());
        if (iconFile) updateData.append("icon", iconFile);

        const response = await fetch(`${API_BASE_URL}/api/admin/vehicle/${editingVehicleId}`, {
          method: "PUT",
          body: updateData,
        });

        if (!response.ok) throw new Error("Failed to update vehicle");

        setShowModal(false);
        resetModal();
        fetchAllData();
      } else if (modalMode === "editService") {
        const updateFormData = new FormData();
        updateFormData.append("name", itemName.trim());
        if (iconFile) updateFormData.append("icon", iconFile);

        const response = await fetch(
          `${API_BASE_URL}/api/admin/vehicle/${editingServiceCategoryId}/service/${editingServiceId}`,
          {
            method: "PUT",
            body: updateFormData,
          }
        );

        if (!response.ok) throw new Error("Failed to update service");

        setShowModal(false);
        resetModal();
        fetchAllData();
      } else if (modalMode === "editType") {
        const updateTypeFormData = new FormData();
        updateTypeFormData.append("name", itemName.trim());
        updateTypeFormData.append("price", itemPrice);
        updateTypeFormData.append("description", itemDesc);
        if (iconFile) updateTypeFormData.append("image", iconFile);
      
        const response = await fetch(
          `${API_BASE_URL}/api/admin/vehicle/${editingTypeCategoryId}/service/${editingTypeServiceId}/type/${editingTypeId}`,
          {
            method: "PUT",
            body: updateTypeFormData,
          }
        );

        if (!response.ok) throw new Error("Failed to update service type");

        setShowModal(false);
        resetModal();
        fetchAllData();
      } else if (modalMode === "editEquipment") {
        const updateEquipmentData = new FormData();
        updateEquipmentData.append("name", itemName.trim());
        if (iconFile) updateEquipmentData.append("icon", iconFile);

        const response = await fetch(
          `${API_BASE_URL}/api/admin/equipment/${editingEquipmentId}`,
          {
            method: "PUT",
            body: updateEquipmentData,
          }
        );

        if (!response.ok) throw new Error("Failed to update equipment");

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
    setEditingVehicleId(null);
    setEditingServiceId(null);
    setEditingServiceCategoryId(null);
    setEditingTypeId(null);
    setEditingTypeServiceId(null);
    setEditingTypeCategoryId(null);
    setEditingEquipmentId(null);
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

  const openEditVehicleModal = (vehicle) => {
    resetModal();
    setModalMode("editVehicle");
    setEditingVehicleId(vehicle.id);
    setCategoryName(vehicle.name || "");
    setIconPreview(vehicle.icon || vehicle.iconUrl || null);
    setShowModal(true);
  };

  const openEditServiceModal = (service, categoryId) => {
    resetModal();
    setModalMode("editService");
    setEditingServiceId(service.id);
    setEditingServiceCategoryId(categoryId);
    setItemName(service.name || "");
    setIconPreview(service.icon || service.iconUrl || service.icon_url || null);
    setShowModal(true);
  };

  const openEditTypeModal = (type, serviceId, categoryId) => {
    resetModal();
    setModalMode("editType");
    setEditingTypeId(type.id);
    setEditingTypeServiceId(serviceId);
    setEditingTypeCategoryId(categoryId);
    setItemName(type.name || "");
    setItemPrice(type.price || "");
    setItemDesc(type.description || "");
    setIconPreview(type.image || type.image_url || null); 
    setShowModal(true);
  };

  const openEditEquipmentModal = (equipment) => {
    resetModal();
    setModalMode("editEquipment");
    setEditingEquipmentId(equipment.id);
    setItemName(equipment.name || "");
    setIconPreview(equipment.icon || equipment.iconUrl || null);
    setShowModal(true);
  };

  const handleIconUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIconFile(file);
      setIconPreview(URL.createObjectURL(file));
    }
  };

  // Delete handlers
  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm("Delete this vehicle and all its services?")) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/vehicle/${vehicleId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete vehicle");
      const data = await res.json().catch(() => ({}));
      alert(data.message || "Vehicle deleted");
      fetchAllData();
    } catch (err) {
      alert("Delete failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (vehicleId, serviceId) => {
    if (!window.confirm("Delete this service?")) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/vehicle/${vehicleId}/service/${serviceId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete service");
      const data = await res.json().catch(() => ({}));
      alert(data.message || "Service deleted");
      fetchAllData();
    } catch (err) {
      alert("Delete failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteType = async (vehicleId, serviceId, typeId) => {
    if (!window.confirm("Delete this service type?")) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/vehicle/${vehicleId}/service/${serviceId}/type/${typeId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete service type");
      const data = await res.json().catch(() => ({}));
      alert(data.message || "Service type deleted");
      fetchAllData();
    } catch (err) {
      alert("Delete failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEquipment = async (equipmentId) => {
    if (!window.confirm("Delete this equipment?")) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/equipment/${equipmentId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete equipment");
      const data = await res.json().catch(() => ({}));
      alert(data.message || "Equipment deleted");
      fetchAllData();
    } catch (err) {
      alert("Delete failed.");
    } finally {
      setLoading(false);
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
                    <div className="bg-red-50 p-2 rounded-lg overflow-hidden">
                      {(category.icon || category.iconUrl) ? (
                        <img
                          src={category.icon || category.iconUrl}
                          alt={`${category.name} icon`}
                          className="w-8 h-8 object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <Folder size={20} className="text-red-600" />
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">{category.name}</h3>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-500">
                      {category.items.length} Services
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditVehicleModal(category);
                      }}
                      className="p-2 rounded-lg hover:bg-gray-100"
                    >
                      <Edit2 size={18} className="text-gray-500" />
                    </button>
                    {activeTab === "vehicle" && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openBrandsModal(category.id);
                        }}
                        className="p-2 rounded-lg hover:bg-gray-100"
                        title="Manage Brands"
                      >
                        <Plus size={16} className="text-gray-500" />
                      </button>
                    )}
                    {activeTab === "vehicle" && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!window.confirm("Delete this vehicle and all its services?")) return;
                          handleDeleteVehicle(category.id);
                        }}
                        className="p-2 rounded-lg hover:bg-gray-100"
                        title="Delete Vehicle"
                      >
                        <Trash2 size={18} className="text-gray-500" />
                      </button>
                    )}
                    {expandedId === category.id ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                  </div>
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
                            <div className="flex items-center justify-between font-semibold mb-3 border-b pb-2">
                              <div className="flex items-center gap-3">
                                <img src={item.iconUrl || item.icon || item.icon_url} className="w-8 h-8 object-contain" alt={item.name || "service icon"} loading="lazy" />
                                <span className="flex-1 text-gray-700">{item.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => activeTab === "equipment" ? openEditEquipmentModal(item) : openEditServiceModal(item, category.id)}
                                  className="p-2 rounded-lg hover:bg-gray-100"
                                  title={activeTab === "equipment" ? "Edit Equipment" : "Edit Service"}
                                >
                                  <Edit2 size={18} className="text-gray-500" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!window.confirm(activeTab === "equipment" ? "Delete this equipment?" : "Delete this service?")) return;
                                    if (activeTab === "equipment") {
                                      handleDeleteEquipment(item.id);
                                    } else {
                                      handleDeleteService(category.id, item.id);
                                    }
                                  }}
                                  className="p-2 rounded-lg hover:bg-gray-100"
                                  title={activeTab === "equipment" ? "Delete Equipment" : "Delete Service"}
                                >
                                  <Trash2 size={18} className="text-gray-500" />
                                </button>
                              </div>
                            </div>

                            {/* Service Types inside the Service */}
                            {item.types && item.types.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {item.types.map(type => (
                                  <div key={type.id} className="bg-gray-50 p-3 rounded border flex items-center justify-between gap-3 group">
                                    <div className="flex items-center gap-3 flex-1">
                                      <img src={type.imageUrl} className="w-10 h-10 rounded object-cover" alt="" />
                                      <div className="text-sm">
                                        <p className="font-bold text-gray-800">{type.name}</p>
                                        <p className="font-bold text-gray-800">{type.description}</p>
                                        <p className="text-red-600 font-semibold">₹{type.price}</p>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => openEditTypeModal(type, item.id, category.id)}
                                      className="p-1 rounded hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                                      title="Edit Service Type"
                                    >
                                      <Edit2 size={16} className="text-gray-600" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (!window.confirm("Delete this service type?")) return;
                                        handleDeleteType(category.id, item.id, type.id);
                                      }}
                                      className="p-1 rounded hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                                      title="Delete Service Type"
                                    >
                                      <Trash2 size={16} className="text-gray-600" />
                                    </button>
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
                {modalMode === "type"
                  ? "Add Service Type"
                  : modalMode === "editType"
                  ? "Edit Service Type"
                  : modalMode === "vehicle"
                  ? "Add Vehicle"
                  : modalMode === "editVehicle"
                  ? "Edit Vehicle"
                  : modalMode === "editService"
                  ? "Edit Service"
                  : modalMode === "editEquipment"
                  ? "Edit Equipment"
                  : "Add Service"}
              </h3>
              <X className="cursor-pointer hover:text-red-600" onClick={() => setShowModal(false)} />
            </div>

            <div className="space-y-4">
              {modalMode === "editType" ? (
                <>
                  <input
                    type="text"
                    placeholder="Type Name"
                    className="w-full border p-2 rounded-lg"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Price (e.g. 500)"
                    className="w-full border p-2 rounded-lg"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                  />
                  <textarea
                    placeholder="Description"
                    className="w-full border p-2 rounded-lg"
                    value={itemDesc}
                    onChange={(e) => setItemDesc(e.target.value)}
                    rows="3"
                  />
                  <div>
                    <label className="block text-sm font-medium mb-1">Upload Image</label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center justify-center px-4 py-2 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
                        <span className="text-sm text-gray-600 font-medium">
                          Upload Image
                        </span>
                        <input
                          type="file"
                          onChange={handleIconUpload}
                          className="hidden"
                        />
                      </label>
                      {iconPreview && (
                        <div className="relative">
                          <img
                            src={iconPreview}
                            alt="preview"
                            className="w-14 h-14 rounded-xl border shadow-sm object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setIconFile(null);
                              setIconPreview(null);
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow hover:bg-red-600"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : modalMode === "type" ? (
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
              ) : modalMode === "editVehicle" ? (
                <input
                  type="text"
                  placeholder="Vehicle Name"
                  className="w-full border p-2 rounded-lg"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                />
              ) : modalMode === "editService" ? (
                <input
                  type="text"
                  placeholder="Service Name"
                  className="w-full border p-2 rounded-lg"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                />
              ) : modalMode === "editEquipment" ? (
                <input
                  type="text"
                  placeholder="Equipment Name"
                  className="w-full border p-2 rounded-lg"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
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

              {modalMode !== "vehicle" && modalMode !== "editVehicle" && modalMode !== "editType" && modalMode !== "editEquipment" && (
                <input
                  type="text"
                  placeholder="Name"
                  className="w-full border p-2 rounded-lg"
                  onChange={(e) => setItemName(e.target.value)}
                />
              )}

              {modalMode !== "editType" && modalMode !== "editEquipment" && (
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
                        onClick={() => {
                          setIconFile(null);
                          setIconPreview(null);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                </div>
              </div>
              )}

              <button onClick={handleCreate} disabled={loading} className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700">
                {loading ? "Processing..." : modalMode === "editService" || modalMode === "editVehicle" || modalMode === "editType" || modalMode === "editEquipment" ? "Update" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Brand Modal */}
      {showBrandModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between mb-4 border-b pb-2">
              <h3 className="text-xl font-bold">Manage Brands</h3>
              <X className="cursor-pointer hover:text-red-600" onClick={resetBrandModal} />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Brand Name</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 border p-2 rounded-lg"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="e.g. Honda"
                  />
                  {editingBrandIdLocal ? (
                    <button onClick={handleUpdateBrand} disabled={brandLoading} className="bg-yellow-500 text-white px-4 py-2 rounded-lg">{brandLoading ? 'Updating...' : 'Update'}</button>
                  ) : (
                    <button onClick={handleCreateBrand} disabled={brandLoading} className="bg-red-600 text-white px-4 py-2 rounded-lg">{brandLoading ? 'Creating...' : 'Create'}</button>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Existing Brands</h4>
                {brandLoading && brandsList.length === 0 ? (
                  <p className="text-sm text-gray-500">Loading...</p>
                ) : brandsList.length === 0 ? (
                  <p className="text-sm text-gray-400">No brands yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {brandsList.map((b) => (
                      <li key={b.id} className="flex items-center justify-between border p-2 rounded-lg">
                        <span className="text-gray-700">{b.name}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingBrandIdLocal(b.id);
                              setBrandName(b.name || "");
                            }}
                            className="p-2 rounded hover:bg-gray-100"
                            title="Edit Brand"
                          >
                            <Edit2 size={16} className="text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteBrand(b.id)}
                            className="p-2 rounded hover:bg-gray-100"
                            title="Delete Brand"
                          >
                            <Trash2 size={16} className="text-gray-600" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex justify-end">
                <button onClick={resetBrandModal} className="px-4 py-2 rounded-lg border">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateService;