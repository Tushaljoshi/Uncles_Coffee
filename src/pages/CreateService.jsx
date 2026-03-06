import React, { useEffect, useState, useMemo } from "react";
import { Plus, Car, Wrench, X, Upload, Folder, Trash2, Edit2, Search, Filter } from "lucide-react";
import TopBar from "../components/TopBar.jsx";
import Sidebar from "../components/Sidebar.jsx";

const API_BASE_URL = "https://bmm-backend.onrender.com";

/* ================= SERVICE SKELETON ================= */

const ServiceSkeleton = () => (
  <div className="bg-white border rounded-xl p-4 shadow-sm animate-pulse flex items-center gap-4">
    <div className="w-12 h-12 rounded-lg bg-red-100" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
    </div>
  </div>
);

const CreateService = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [activeTab, setActiveTab] = useState("vehicle");
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("");

  // Form states
  const [categoryName, setCategoryName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [isNewCategory, setIsNewCategory] = useState(true);
  const [serviceName, setServiceName] = useState("");
  const [equipmentName, setEquipmentName] = useState("");
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);
  
  // Edit states
  const [editingItem, setEditingItem] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState("");

  // Data structure: categories with nested items
  const [categories, setCategories] = useState({
    vehicle: [],
    equipment: [],
  });

  // Raw API data for reference
  const [rawData, setRawData] = useState({
    vehicle: [],
    equipment: [],
  });

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  /* ================= TRANSFORM API DATA TO UI FORMAT ================= */
  const transformApiDataToCategories = (data, type) => {
    const categoryMap = {};
    
    data.forEach((item) => {
      const categoryName = type === "vehicle" ? item.category : item.category;
      if (!categoryMap[categoryName]) {
        categoryMap[categoryName] = {
          id: categoryName,
          name: categoryName,
          items: [],
        };
      }
      
      const iconUrl = type === "vehicle" 
        ? item.serviceIcon 
        : item.equipmentIcon;
      
      let fullIconUrl = "";
      if (iconUrl) {
        fullIconUrl = iconUrl.startsWith('http') 
          ? iconUrl 
          : `${API_BASE_URL}${iconUrl}`;
      } else {
        // Fallback icon if no icon URL provided
        fullIconUrl = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='%23ef4444' d='M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z'/%3E%3C/svg%3E";
      }
      
      categoryMap[categoryName].items.push({
        id: item.id,
        name: type === "vehicle" ? item.serviceName : item.equipmentName,
        icon: fullIconUrl,
        apiData: item, // Keep reference to original API data
      });
    });
    
    return Object.values(categoryMap);
  };

  /* ================= FETCH DATA FROM API ================= */
  const fetchVehicles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/vehicle`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setRawData((prev) => ({ ...prev, vehicle: Array.isArray(data) ? data : [] }));
      const transformed = transformApiDataToCategories(Array.isArray(data) ? data : [], "vehicle");
      setCategories((prev) => ({ ...prev, vehicle: transformed }));
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      setCategories((prev) => ({ ...prev, vehicle: [] }));
    }
  };

  const fetchEquipments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/equipment`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setRawData((prev) => ({ ...prev, equipment: Array.isArray(data) ? data : [] }));
      const transformed = transformApiDataToCategories(Array.isArray(data) ? data : [], "equipment");
      setCategories((prev) => ({ ...prev, equipment: transformed }));
    } catch (error) {
      console.error("Error fetching equipments:", error);
      setCategories((prev) => ({ ...prev, equipment: [] }));
    }
  };

  /* ================= LOAD DATA ON MOUNT ================= */
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchVehicles(), fetchEquipments()]);
      setLoading(false);
    };
    loadData();
  }, []);

  /* ================= HANDLE SVG UPLOAD ================= */

  const handleIconUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "image/svg+xml") {
      alert("Only SVG icons are allowed");
      return;
    }

    setIconFile(file);
    setIconPreview(URL.createObjectURL(file));
  };

  /* ================= FILTERED AND SEARCHED DATA ================= */
  const filteredCategories = useMemo(() => {
    let filtered = categories[activeTab];

    // Filter by category
    if (selectedCategoryFilter) {
      filtered = filtered.filter(cat => cat.id === selectedCategoryFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.map(category => ({
        ...category,
        items: category.items.filter(item =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          category.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.items.length > 0);
    }

    return filtered;
  }, [categories, activeTab, searchQuery, selectedCategoryFilter]);

  /* ================= GET UNIQUE CATEGORIES FOR FILTER ================= */
  const availableCategories = useMemo(() => {
    return categories[activeTab].map(cat => ({
      id: cat.id,
      name: cat.name
    }));
  }, [categories, activeTab]);

  /* ================= RESET MODAL ================= */
  const resetModal = () => {
    setCategoryName("");
    setSelectedCategoryId("");
    setIsNewCategory(true);
    setServiceName("");
    setEquipmentName("");
    setIconFile(null);
    setIconPreview(null);
  };

  /* ================= RESET EDIT MODAL ================= */
  const resetEditModal = () => {
    setEditingItem(null);
    setEditCategoryName("");
  };

  /* ================= CREATE SERVICE/EQUIPMENT ================= */

  const handleCreate = async () => {
    const itemName = activeTab === "vehicle" ? serviceName : equipmentName;
    
    if (!itemName || !iconFile) {
      alert("Please fill all required fields");
      return;
    }

    const finalCategory = isNewCategory 
      ? categoryName.trim() 
      : categories[activeTab].find(cat => cat.id === selectedCategoryId)?.name;

    if (!finalCategory) {
      alert("Please enter category name or select existing category");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      
      if (activeTab === "vehicle") {
        formData.append("category", finalCategory);
        formData.append("serviceName", itemName);
        formData.append("serviceIcon", iconFile);
      } else {
        // Backend naming is inconsistent across docs; send both to be safe
        formData.append("category", finalCategory);
        formData.append("equipmentName", itemName);
        formData.append("equipmentIcon", iconFile);
      }

      const endpoint = activeTab === "vehicle" 
        ? `${API_BASE_URL}/api/admin/vehicle`
        : `${API_BASE_URL}/api/admin/equipment`;

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        // Show real backend error (often returned as JSON/text)
        const errorText = await response.text().catch(() => "");
        throw new Error(
          `HTTP error! status: ${response.status}${errorText ? ` - ${errorText}` : ""}`
        );
      }

      const result = await response.json();
      
      // Refresh data after creation
      if (activeTab === "vehicle") {
        await fetchVehicles();
      } else {
        await fetchEquipments();
      }

      resetModal();
      setShowModal(false);
    } catch (error) {
      console.error("Error creating item:", error);
      alert("Failed to create item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= OPEN EDIT MODAL ================= */
  const handleEdit = (item) => {
    setEditingItem(item);
    setEditCategoryName(item.apiData?.category || "");
    setShowEditModal(true);
  };

  /* ================= UPDATE CATEGORY (PUT) ================= */
  const handleUpdateCategory = async () => {
    if (!editingItem || !editCategoryName.trim()) {
      alert("Please enter a category name");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      // Both vehicle and equipment use "category" for PUT
      formData.append("category", editCategoryName.trim());

      const endpoint = activeTab === "vehicle"
        ? `${API_BASE_URL}/api/admin/vehicle/${editingItem.id}`
        : `${API_BASE_URL}/api/admin/equipment/${editingItem.id}`;

      const response = await fetch(endpoint, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Refresh data after update
      if (activeTab === "vehicle") {
        await fetchVehicles();
      } else {
        await fetchEquipments();
      }

      resetEditModal();
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating category:", error);
      alert("Failed to update category. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ITEM ================= */
  const handleDelete = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) {
      return;
    }

    try {
      setLoading(true);

      const endpoint = activeTab === "vehicle"
        ? `${API_BASE_URL}/api/admin/vehicle/${itemId}`
        : `${API_BASE_URL}/api/admin/equipment/${itemId}`;

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh data after deletion
      if (activeTab === "vehicle") {
        await fetchVehicles();
      } else {
        await fetchEquipments();
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item. Please try again.");
    } finally {
      setLoading(false);
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

        <main className="flex-1 p-6 overflow-auto">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Service Management
            </h2>

            <button
              onClick={() => {
                resetModal();
                setShowModal(true);
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
            >
              <Plus size={18} />
              Create {activeTab === "vehicle" ? "Service" : "Equipment"}
            </button>
          </div>

          {/* TABS */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => {
                setActiveTab("vehicle");
                setSearchQuery("");
                setSelectedCategoryFilter("");
              }}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                activeTab === "vehicle"
                  ? "bg-red-600 text-white"
                  : "bg-white border text-gray-700 hover:bg-red-50 hover:text-red-600"
              }`}
            >
              <Car size={18} />
              Vehicle Services
            </button>

            <button
              onClick={() => {
                setActiveTab("equipment");
                setSearchQuery("");
                setSelectedCategoryFilter("");
              }}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                activeTab === "equipment"
                  ? "bg-red-600 text-white"
                  : "bg-white border text-gray-700 hover:bg-red-50 hover:text-red-600"
              }`}
            >
              <Wrench size={18} />
              Equipment Services
            </button>
          </div>

          {/* SEARCH AND FILTER BAR */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeTab === "vehicle" ? "services" : "equipment"}...`}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            {/* Category Filter */}
            <div className="relative sm:w-64">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 appearance-none bg-white"
              >
                <option value="">All Categories</option>
                {availableCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* CATEGORIES AND ITEMS LIST */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <ServiceSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredCategories.length === 0 && !loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-gray-500">No results found</p>
                  {(searchQuery || selectedCategoryFilter) && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategoryFilter("");
                      }}
                      className="mt-2 text-red-600 hover:text-red-700 text-sm"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                filteredCategories.map((category) => (
                <div key={category.id} className="bg-white border rounded-xl p-6 shadow-sm">
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b">
                    <Folder className="text-red-600" size={20} />
                    <h3 className="text-lg font-semibold text-gray-800">
                      {category.name}
                    </h3>
                    <span className="ml-auto text-sm text-gray-500">
                      {category.items.length} {activeTab === "vehicle" ? "services" : "equipment"}
                    </span>
                  </div>

                  {/* Items Grid */}
                  {category.items.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {category.items.map((item) => (
                        <div
                          key={item.id}
                          className="bg-gray-50 border rounded-lg p-4 flex items-center gap-3 hover:bg-gray-100 transition group"
                        >
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <img
                              src={item.icon}
                              alt="icon"
                              className="w-6 h-6"
                              onError={(e) => {
                                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='%23ef4444' d='M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z'/%3E%3C/svg%3E";
                              }}
                            />
                          </div>
                          <p className="font-medium text-gray-800 text-sm flex-1">
                            {item.name}
                          </p>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                              title="Edit"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No {activeTab === "vehicle" ? "services" : "equipment"} in this category yet
                    </p>
                  )}
                </div>
                ))
              )}
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && categories[activeTab].length === 0 && !searchQuery && !selectedCategoryFilter && (
            <div className="flex flex-col items-center mt-20 justify-center h-[300px] text-center">
              <div className="w-20 h-20 flex items-center justify-center rounded-full bg-red-100 mb-4">
                <Plus className="text-red-600" size={36} />
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                No Services Found
              </h3>

              <p className="text-sm text-gray-500 max-w-sm mb-4">
                There are no{" "}
                {activeTab === "vehicle" ? "vehicle" : "equipment"}{" "}
                categories created yet. Click below to add your first category.
              </p>

              <button
                onClick={() => {
                  resetModal();
                  setShowModal(true);
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 font-medium transition"
              >
                <Plus size={18} />
                Create {activeTab === "vehicle" ? "Service" : "Equipment"}
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
              Create {activeTab === "vehicle" ? "Service" : "Equipment"}
            </h3>

            <div className="space-y-4">
              {/* CATEGORY SELECTION */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Category
                </label>
                
                {/* New or Existing Toggle */}
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewCategory(true);
                      setSelectedCategoryId("");
                    }}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isNewCategory
                        ? "bg-red-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    New Category
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewCategory(false);
                      setCategoryName("");
                    }}
                    disabled={categories[activeTab].length === 0}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                      !isNewCategory
                        ? "bg-red-600 text-white"
                        : categories[activeTab].length === 0
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Existing Category
                  </button>
                </div>

                {/* Category Input/Select */}
                {isNewCategory ? (
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="Enter category name"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300
                               focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                ) : (
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300
                               focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">Select a category</option>
                    {categories[activeTab].map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* SERVICE/EQUIPMENT NAME */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {activeTab === "vehicle" ? "Service Name" : "Equipment Name"}
                </label>
                <input
                  type="text"
                  value={activeTab === "vehicle" ? serviceName : equipmentName}
                  onChange={(e) =>
                    activeTab === "vehicle"
                      ? setServiceName(e.target.value)
                      : setEquipmentName(e.target.value)
                  }
                  placeholder={
                    activeTab === "vehicle"
                      ? "e.g. Car Wash"
                      : "e.g. Diagnostic Tool"
                  }
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300
                             focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              {/* SVG UPLOAD */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {activeTab === "vehicle" ? "Service" : "Equipment"} Icon (SVG)
                </label>

                <label className="mt-1 flex items-center gap-3 px-4 py-3
                                  border-2 border-dashed rounded-lg cursor-pointer
                                  hover:bg-red-50 transition">
                  <Upload size={18} className="text-red-600" />
                  <span className="text-sm text-gray-600">
                    Upload SVG Icon
                  </span>
                  <input
                    type="file"
                    accept=".svg"
                    onChange={handleIconUpload}
                    className="hidden"
                  />
                </label>

                {iconPreview && (
                  <div className="mt-3 flex items-center gap-3">
                    <div className="w-12 h-12 border rounded-lg flex items-center justify-center">
                      <img src={iconPreview} alt="Preview" className="w-8 h-8" />
                    </div>
                    <span className="text-sm text-gray-500">
                      SVG Uploaded
                    </span>
                  </div>
                )}
              </div>

              {/* ACTIONS */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    resetModal();
                    setShowModal(false);
                  }}
                  className="flex-1 border py-2 rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= EDIT MODAL ================= */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={() => {
                resetEditModal();
                setShowEditModal(false);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-600"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Edit {activeTab === "vehicle" ? "Service" : "Equipment"}
            </h3>

            <div className="space-y-4">
              {/* Current Item Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">
                  {activeTab === "vehicle" ? "Service Name" : "Equipment Name"}
                </p>
                <p className="font-medium text-gray-800">{editingItem.name}</p>
              </div>

              {/* Category Update */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Category
                </label>
                <input
                  type="text"
                  value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)}
                  placeholder="Enter category name"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300
                             focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Current category: {editingItem.apiData?.category || "N/A"}
                </p>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    resetEditModal();
                    setShowEditModal(false);
                  }}
                  className="flex-1 border py-2 rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateCategory}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium"
                >
                  Update Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateService;
