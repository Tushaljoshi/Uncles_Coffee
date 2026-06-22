import React, { useEffect, useState, useCallback, useRef } from "react";
import { Plus, X, Folder, Trash2, Edit2, Search, ChevronDown, ChevronUp } from "lucide-react";
import TopBar from "../components/TopBar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import Toast from "../components/Toast.jsx";
import { useToast } from "../hooks/useToast.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const VEHICLE_ORDER_GROUPS = [
  ["scooter"],
  ["bike", "bicycle", "2-wheeler"],
  ["car", "cars"],
  ["3-wheeler", "three", "three-wheeler", "three wheeler"],
  ["pickup", "van"],
  ["tractor", "tractors"],
  ["bus"],
  ["truck"],
];

const getOrderIndex = (name = "") => {
  const n = name.toLowerCase();
  for (let i = 0; i < VEHICLE_ORDER_GROUPS.length; i++) {
    for (const kw of VEHICLE_ORDER_GROUPS[i]) {
      if (n.includes(kw)) return i;
    }
  }
  return VEHICLE_ORDER_GROUPS.length;
};

const sortVehicles = (vehicles) =>
  [...vehicles].sort((a, b) => getOrderIndex(a.name) - getOrderIndex(b.name));

const CategoryCardSkeleton = () => (
  <div className="bg-white rounded-xl border shadow-sm overflow-hidden animate-pulse">
    <div className="p-4 flex items-center justify-between">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-12 h-12 bg-gray-200 rounded-lg" />
        <div className="space-y-2 flex-1">
          <div className="h-5 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-100 rounded w-20" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="w-8 h-8 bg-gray-100 rounded-lg" />
        <div className="w-8 h-8 bg-gray-100 rounded-lg" />
      </div>
    </div>
  </div>
);

const ServiceListSkeleton = () => (
  <div className="p-4 border-t bg-gray-50/50 space-y-4 animate-pulse">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="border rounded-lg p-4 bg-white">
        <div className="flex items-center gap-3 mb-3 border-b pb-2">
          <div className="w-8 h-8 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded flex-1 max-w-[200px]" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(2)].map((_, j) => (
            <div key={j} className="bg-gray-50 p-3 rounded border flex gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const ListItemSkeleton = () => (
  <div className="flex items-center justify-between border p-2 rounded-lg animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-1/3" />
    <div className="flex gap-2">
      <div className="w-8 h-8 bg-gray-100 rounded" />
      <div className="w-8 h-8 bg-gray-100 rounded" />
    </div>
  </div>
);

const CreateService = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [activeTab, setActiveTab] = useState("vehicle");
  const [showModal, setShowModal] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingVehicleIds, setLoadingVehicleIds] = useState(() => new Set());
  const [error, setError] = useState(null);
  const fetchingVehicleIds = useRef(new Set());
  const loadedVehicleIdsRef = useRef(new Set());
  const { toasts, addToast } = useToast();

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
  const [itemDiscountPrice, setItemDiscountPrice] = useState("");
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
  const [selectedBrandId, setSelectedBrandId] = useState(null);
  const [modelsList, setModelsList] = useState([]);
  const [modelName, setModelName] = useState("");
  const [editingModelId, setEditingModelId] = useState(null);
  const [modelLoading, setModelLoading] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState(null);
  const [fuelsList, setFuelsList] = useState([]);
  const [fuelName, setFuelName] = useState("");
  const [editingFuelId, setEditingFuelId] = useState(null);
  const [fuelLoading, setFuelLoading] = useState(false);
  const [engineCCList, setEngineCCList] = useState([]);
  const [engineCCName, setEngineCCName] = useState("");
  const [editingEngineCCId, setEditingEngineCCId] = useState(null);
  const [engineCCLoading, setEngineCCLoading] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Card click handler
  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const setVehicleLoading = useCallback((vehicleId, isLoading) => {
    setLoadingVehicleIds((prev) => {
      const next = new Set(prev);
      if (isLoading) next.add(vehicleId);
      else next.delete(vehicleId);
      return next;
    });
  }, []);

  const fetchVehicleDetails = useCallback(async (vehicleId, force = false) => {
    if (!vehicleId || fetchingVehicleIds.current.has(vehicleId)) return;
    if (!force && loadedVehicleIdsRef.current.has(vehicleId)) return;

    fetchingVehicleIds.current.add(vehicleId);
    setVehicleLoading(vehicleId, true);

    try {
      const sRes = await fetch(`${API_BASE_URL}/api/client/vehicle/${vehicleId}/services`);
      if (sRes.status === 429) throw new Error("Rate limit exceeded. Please wait.");
      const services = await sRes.json();

      const servicesWithTypes = await Promise.all(
        (Array.isArray(services) ? services : []).map(async (s) => {
          try {
            const tRes = await fetch(
              `${API_BASE_URL}/api/client/vehicle/${vehicleId}/service/${s.id}/types`
            );
            const types = await tRes.json();
            return { ...s, types: Array.isArray(types) ? types : [] };
          } catch {
            return { ...s, types: [] };
          }
        })
      );

      loadedVehicleIdsRef.current.add(vehicleId);
      setCategories((prev) => ({
        ...prev,
        vehicle: prev.vehicle.map((v) =>
          v.id === vehicleId
            ? { ...v, items: servicesWithTypes, detailsLoaded: true }
            : v
        ),
      }));
    } catch (err) {
      addToast(err.message || "Failed to load services", "error");
    } finally {
      fetchingVehicleIds.current.delete(vehicleId);
      setVehicleLoading(vehicleId, false);
    }
  }, [addToast, setVehicleLoading]);

  const fetchVehicles = useCallback(async () => {
    setInitialLoading(true);
    setError(null);
    loadedVehicleIdsRef.current = new Set();
    try {
      const vRes = await fetch(`${API_BASE_URL}/api/client/vehicles`);
      if (vRes.status === 429) throw new Error("Rate limit exceeded. Please wait.");
      const vehicles = await vRes.json();

      const vehicleData = sortVehicles(
        (Array.isArray(vehicles) ? vehicles : []).map((v) => ({
          id: v.id,
          name: v.name,
          icon: v.iconUrl || v.icon || v.icon_url || "",
          items: [],
          detailsLoaded: false,
        }))
      );

      setCategories((prev) => ({ ...prev, vehicle: vehicleData }));
    } catch (err) {
      setError(err.message);
    } finally {
      setInitialLoading(false);
    }
  }, []);

  const fetchEquipment = useCallback(async () => {
    setInitialLoading(true);
    setError(null);
    try {
      const eRes = await fetch(`${API_BASE_URL}/api/client/equipments`);
      const eData = await eRes.json();
      const equipments = Array.isArray(eData) ? eData : eData.data || [];

      setCategories((prev) => ({
        ...prev,
        equipment: [{
          id: "all-equip",
          name: "General Equipment",
          items: equipments.map((e) => ({
            id: e.id,
            name: e.name,
            icon: e.iconUrl,
            types: [],
          })),
        }],
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setInitialLoading(false);
    }
  }, []);

  const refreshCurrentTab = useCallback(async (vehicleId = null) => {
    if (activeTab === "vehicle") {
      await fetchVehicles();
      if (vehicleId) {
        loadedVehicleIdsRef.current.delete(vehicleId);
        await fetchVehicleDetails(vehicleId, true);
      }
    } else {
      await fetchEquipment();
    }
  }, [activeTab, fetchVehicles, fetchEquipment, fetchVehicleDetails]);

  useEffect(() => {
    setExpandedId(null);
    if (activeTab === "vehicle") fetchVehicles();
    else fetchEquipment();
  }, [activeTab, fetchVehicles, fetchEquipment]);

  useEffect(() => {
    if (activeTab === "vehicle" && expandedId) {
      fetchVehicleDetails(expandedId);
    }
  }, [activeTab, expandedId, fetchVehicleDetails]);

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
      addToast(err.message || "Failed to load brands", "error");
      setBrandsList([]);
    } finally {
      setBrandLoading(false);
    }
  };

  const openBrandsModal = (vehicleId) => {
    setBrandsVehicleId(vehicleId);
    setBrandName("");
    setEditingBrandIdLocal(null);
    setSelectedBrandId(null);
    setModelsList([]);
    setModelName("");
    setEditingModelId(null);
    fetchBrands(vehicleId);
    setShowBrandModal(true);
  };

  const resetBrandModal = () => {
    setBrandsVehicleId(null);
    setBrandsList([]);
    setBrandName("");
    setEditingBrandIdLocal(null);
    setSelectedBrandId(null);
    setModelsList([]);
    setModelName("");
    setEditingModelId(null);
    setSelectedModelId(null);
    setFuelsList([]);
    setFuelName("");
    setEditingFuelId(null);
    setEngineCCList([]);
    setEngineCCName("");
    setEditingEngineCCId(null);
    setShowBrandModal(false);
  };

  const handleCreateBrand = async () => {
    if (!brandName?.trim()) return addToast("Brand name is required", "warning");
    if (!brandsVehicleId) return addToast("Vehicle not selected", "warning");
    try {
      setBrandLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/vehicle/${brandsVehicleId}/brand`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: brandName.trim() })
      });
      if (!res.ok) throw new Error("Failed to create brand");
      const data = await res.json().catch(() => ({}));
      addToast(data.message || "Brand created", "success");
      setBrandName("");
      fetchBrands(brandsVehicleId);
    } catch (err) {
      addToast(err.message || "Create brand failed", "error");
    } finally {
      setBrandLoading(false);
    }
  };

  const handleUpdateBrand = async () => {
    if (!brandName?.trim()) return addToast("Brand name is required", "warning");
    if (!brandsVehicleId || !editingBrandIdLocal) return addToast("Missing info", "warning");
    try {
      setBrandLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/vehicle/${brandsVehicleId}/brand/${editingBrandIdLocal}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: brandName.trim() })
      });
      if (!res.ok) throw new Error("Failed to update brand");
      const data = await res.json().catch(() => ({}));
      addToast(data.message || "Brand updated", "success");
      setBrandName("");
      setEditingBrandIdLocal(null);
      fetchBrands(brandsVehicleId);
    } catch (err) {
      addToast(err.message || "Update brand failed", "error");
    } finally {
      setBrandLoading(false);
    }
  };

  const fetchModels = async (vehicleId, brandId) => {
    if (!vehicleId || !brandId) return;
    setModelLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/vehicle/${vehicleId}/brand/${brandId}/model`);
      if (!res.ok) throw new Error("Failed to fetch models");
      const data = await res.json();
      setModelsList(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      addToast(err.message || "Failed to load models", "error");
      setModelsList([]);
    } finally {
      setModelLoading(false);
    }
  };

  const selectBrandModels = (brandId) => {
    setSelectedBrandId(brandId);
    setSelectedModelId(null);
    setEditingModelId(null);
    setModelName("");
    setFuelsList([]);
    setFuelName("");
    setEditingFuelId(null);
    fetchModels(brandsVehicleId, brandId);
  };

  const fetchFuels = async (vehicleId, brandId, modelId) => {
    if (!vehicleId || !brandId || !modelId) return;
    setFuelLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/vehicle/${vehicleId}/brand/${brandId}/model/${modelId}/fuel`);
      if (!res.ok) throw new Error("Failed to fetch fuels");
      const data = await res.json();
      setFuelsList(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      addToast(err.message || "Failed to load fuels", "error");
      setFuelsList([]);
    } finally {
      setFuelLoading(false);
    }
  };

  const selectModelFuels = (modelId) => {
    setSelectedModelId(modelId);
    setEditingFuelId(null);
    setFuelName("");
    fetchFuels(brandsVehicleId, selectedBrandId, modelId);
    selectModelEngineCC(modelId);
  };

  const handleCreateModel = async () => {
    if (!modelName?.trim()) return addToast("Model name is required", "warning");
    if (!brandsVehicleId || !selectedBrandId) return addToast("Select a brand first", "warning");
    try {
      setModelLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/vehicle/${brandsVehicleId}/brand/${selectedBrandId}/model`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: modelName.trim() })
      });
      if (!res.ok) throw new Error("Failed to create model");
      const data = await res.json().catch(() => ({}));
      addToast(data.message || "Model created", "success");
      setModelName("");
      fetchModels(brandsVehicleId, selectedBrandId);
    } catch (err) {
      addToast(err.message || "Create model failed", "error");
    } finally {
      setModelLoading(false);
    }
  };

  const handleUpdateModel = async () => {
    if (!modelName?.trim()) return addToast("Model name is required", "warning");
    if (!brandsVehicleId || !selectedBrandId || !editingModelId) return addToast("Missing model information", "warning");
    try {
      setModelLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/vehicle/${brandsVehicleId}/brand/${selectedBrandId}/model/${editingModelId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: modelName.trim() })
      });
      if (!res.ok) throw new Error("Failed to update model");
      const data = await res.json().catch(() => ({}));
      addToast(data.message || "Model updated", "success");
      setModelName("");
      setEditingModelId(null);
      fetchModels(brandsVehicleId, selectedBrandId);
    } catch (err) {
      addToast(err.message || "Update model failed", "error");
    } finally {
      setModelLoading(false);
    }
  };

  const handleDeleteModel = async (modelId) => {
    if (!brandsVehicleId || !selectedBrandId || !modelId) return;
    if (!window.confirm("Delete this model?")) return;
    try {
      setModelLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/vehicle/${brandsVehicleId}/brand/${selectedBrandId}/model/${modelId}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete model");
      const data = await res.json().catch(() => ({}));
      addToast(data.message || "Model deleted", "success");
      if (selectedModelId === modelId) {
        setSelectedModelId(null);
        setFuelsList([]);
        setFuelName("");
        setEditingFuelId(null);
      }
      fetchModels(brandsVehicleId, selectedBrandId);
    } catch (err) {
      addToast(err.message || "Delete model failed", "error");
    } finally {
      setModelLoading(false);
    }
  };

  const handleCreateFuel = async () => {
    if (!fuelName?.trim()) return addToast("Fuel name is required", "warning");
    if (!brandsVehicleId || !selectedBrandId || !selectedModelId) return addToast("Select a model first", "warning");
    try {
      setFuelLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/vehicle/${brandsVehicleId}/brand/${selectedBrandId}/model/${selectedModelId}/fuel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fuelName.trim() })
      });
      if (!res.ok) throw new Error("Failed to create fuel");
      const data = await res.json().catch(() => ({}));
      addToast(data.message || "Fuel created", "success");
      setFuelName("");
      fetchFuels(brandsVehicleId, selectedBrandId, selectedModelId);
    } catch (err) {
      addToast(err.message || "Create fuel failed", "error");
    } finally {
      setFuelLoading(false);
    }
  };

  const handleUpdateFuel = async () => {
    if (!fuelName?.trim()) return addToast("Fuel name is required", "warning");
    if (!brandsVehicleId || !selectedBrandId || !selectedModelId || !editingFuelId) return addToast("Missing fuel information", "warning");
    try {
      setFuelLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/vehicle/${brandsVehicleId}/brand/${selectedBrandId}/model/${selectedModelId}/fuel/${editingFuelId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fuelName.trim() })
      });
      if (!res.ok) throw new Error("Failed to update fuel");
      const data = await res.json().catch(() => ({}));
      addToast(data.message || "Fuel updated", "success");
      setFuelName("");
      setEditingFuelId(null);
      fetchFuels(brandsVehicleId, selectedBrandId, selectedModelId);
    } catch (err) {
      addToast(err.message || "Update fuel failed", "error");
    } finally {
      setFuelLoading(false);
    }
  };

  const handleDeleteFuel = async (fuelId) => {
    if (!brandsVehicleId || !selectedBrandId || !selectedModelId || !fuelId) return;
    if (!window.confirm("Delete this fuel?")) return;
    try {
      setFuelLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/vehicle/${brandsVehicleId}/brand/${selectedBrandId}/model/${selectedModelId}/fuel/${fuelId}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete fuel");
      const data = await res.json().catch(() => ({}));
      addToast(data.message || "Fuel deleted", "success");
      fetchFuels(brandsVehicleId, selectedBrandId, selectedModelId);
    } catch (err) {
      addToast(err.message || "Delete fuel failed", "error");
    } finally {
      setFuelLoading(false);
    }
  };

  const fetchEngineCC = async (vehicleId, brandId, modelId) => {
    if (!vehicleId || !brandId || !modelId) return;
    setEngineCCLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/vehicle/${vehicleId}/brand/${brandId}/model/${modelId}/engine-cc`);
      if (!res.ok) throw new Error("Failed to fetch engine CCs");
      const data = await res.json();
      setEngineCCList(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      addToast(err.message || "Failed to load engine CCs", "error");
      setEngineCCList([]);
    } finally {
      setEngineCCLoading(false);
    }
  };

  const selectModelEngineCC = (modelId) => {
    setEditingEngineCCId(null);
    setEngineCCName("");
    fetchEngineCC(brandsVehicleId, selectedBrandId, modelId);
  };

  const handleCreateEngineCC = async () => {
    if (!engineCCName?.trim()) return addToast("Engine CC name is required", "warning");
    if (!brandsVehicleId || !selectedBrandId || !selectedModelId) return addToast("Select a model first", "warning");
    try {
      setEngineCCLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/vehicle/${brandsVehicleId}/brand/${selectedBrandId}/model/${selectedModelId}/engine-cc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: engineCCName.trim() })
      });
      if (!res.ok) throw new Error("Failed to create engine CC");
      const data = await res.json().catch(() => ({}));
      addToast(data.message || "Engine CC created", "success");
      setEngineCCName("");
      fetchEngineCC(brandsVehicleId, selectedBrandId, selectedModelId);
    } catch (err) {
      addToast(err.message || "Create engine CC failed", "error");
    } finally {
      setEngineCCLoading(false);
    }
  };

  const handleUpdateEngineCC = async () => {
    if (!engineCCName?.trim()) return addToast("Engine CC name is required", "warning");
    if (!brandsVehicleId || !selectedBrandId || !selectedModelId || !editingEngineCCId) return addToast("Missing engine CC information", "warning");
    try {
      setEngineCCLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/vehicle/${brandsVehicleId}/brand/${selectedBrandId}/model/${selectedModelId}/engine-cc/${editingEngineCCId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: engineCCName.trim() })
      });
      if (!res.ok) throw new Error("Failed to update engine CC");
      const data = await res.json().catch(() => ({}));
      addToast(data.message || "Engine CC updated", "success");
      setEngineCCName("");
      setEditingEngineCCId(null);
      fetchEngineCC(brandsVehicleId, selectedBrandId, selectedModelId);
    } catch (err) {
      addToast(err.message || "Update engine CC failed", "error");
    } finally {
      setEngineCCLoading(false);
    }
  };

  const handleDeleteEngineCC = async (engineCCId) => {
    if (!brandsVehicleId || !selectedBrandId || !selectedModelId || !engineCCId) return;
    if (!window.confirm("Delete this engine CC?")) return;
    try {
      setEngineCCLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/vehicle/${brandsVehicleId}/brand/${selectedBrandId}/model/${selectedModelId}/engine-cc/${engineCCId}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete engine CC");
      const data = await res.json().catch(() => ({}));
      addToast(data.message || "Engine CC deleted", "success");
      fetchEngineCC(brandsVehicleId, selectedBrandId, selectedModelId);
    } catch (err) {
      addToast(err.message || "Delete engine CC failed", "error");
    } finally {
      setEngineCCLoading(false);
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
      addToast(data.message || "Brand deleted", "success");
      fetchBrands(brandsVehicleId);
      if (selectedBrandId === brandId) {
        setSelectedBrandId(null);
        setSelectedModelId(null);
        setModelsList([]);
        setModelName("");
        setEditingModelId(null);
        setFuelsList([]);
        setFuelName("");
        setEditingFuelId(null);
      }
    } catch (err) {
      addToast(err.message || "Delete brand failed", "error");
    } finally {
      setBrandLoading(false);
    }
  };

  const handleCreate = async () => {
    if (modalMode === "vehicle" || modalMode === "editVehicle") {
      if (!categoryName?.trim()) return addToast("Vehicle name is required", "warning");
      if (modalMode === "vehicle" && !iconFile) return addToast("Vehicle icon is required", "warning");
    } else if (modalMode === "editService") {
      if (!itemName?.trim()) return addToast("Name is required", "warning");
    } else if (modalMode === "editType") {
      if (!itemName?.trim()) return addToast("Name is required", "warning");
      if (!itemPrice) return addToast("Price is required", "warning");
    } else if (modalMode === "editEquipment") {
      if (!itemName?.trim()) return addToast("Name is required", "warning");
    } else if (!itemName?.trim()) {
      return addToast("Name is required", "warning");
    }
    if (modalMode === "service" && activeTab === "vehicle" && !selectedCategoryId) {
      return addToast("Please select a vehicle", "warning");
    }
    if ((modalMode === "service" || modalMode === "type") && !iconFile) {
      return addToast("Icon/Image is required", "warning");
    }
    try {
      setSubmitting(true);
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
        await refreshCurrentTab();
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
        await refreshCurrentTab(editingVehicleId);
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
        await refreshCurrentTab(editingServiceCategoryId);
      } else if (modalMode === "editType") {
        const updateTypeFormData = new FormData();
        updateTypeFormData.append("name", itemName.trim());
        updateTypeFormData.append("price", itemPrice);
        updateTypeFormData.append("discountPrice", itemDiscountPrice || 0);
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
        await refreshCurrentTab(editingTypeCategoryId);
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
        await refreshCurrentTab();
      } else if (modalMode === "type") {
        const formData = new FormData();
        formData.append("name", itemName.trim());
        formData.append("price", itemPrice);
        formData.append("discountPrice", itemDiscountPrice || 0);
        formData.append("description", itemDesc);
        formData.append("image", iconFile);

        const response = await fetch(`${API_BASE_URL}/api/admin/vehicle/${selectedCategoryId}/service/${selectedServiceId}/type`, {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          setShowModal(false);
          resetModal();
          await refreshCurrentTab(selectedCategoryId);
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
          const refreshId = activeTab === "vehicle" ? selectedCategoryId : null;
          await refreshCurrentTab(refreshId);
        }
      }
    } catch (error) {
      addToast("Action failed.", "error");
    } finally {
      setSubmitting(false);
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
    setItemDiscountPrice("");
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
    setItemDiscountPrice(type.discountPrice ?? type.discount_price ?? 0);
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
      setSubmitting(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/vehicle/${vehicleId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete vehicle");
      const data = await res.json().catch(() => ({}));
      addToast(data.message || "Vehicle deleted", "success");
      if (expandedId === vehicleId) setExpandedId(null);
      await refreshCurrentTab();
    } catch (err) {
      addToast("Delete failed.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteService = async (vehicleId, serviceId) => {
    if (!window.confirm("Delete this service?")) return;
    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/vehicle/${vehicleId}/service/${serviceId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete service");
      const data = await res.json().catch(() => ({}));
      addToast(data.message || "Service deleted", "success");
      await refreshCurrentTab(vehicleId);
    } catch (err) {
      addToast("Delete failed.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteType = async (vehicleId, serviceId, typeId) => {
    if (!window.confirm("Delete this service type?")) return;
    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/vehicle/${vehicleId}/service/${serviceId}/type/${typeId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete service type");
      const data = await res.json().catch(() => ({}));
      addToast(data.message || "Service type deleted", "success");
      await refreshCurrentTab(vehicleId);
    } catch (err) {
      addToast("Delete failed.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEquipment = async (equipmentId) => {
    if (!window.confirm("Delete this equipment?")) return;
    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/equipment/${equipmentId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete equipment");
      const data = await res.json().catch(() => ({}));
      addToast(data.message || "Equipment deleted", "success");
      await refreshCurrentTab();
    } catch (err) {
      addToast("Delete failed.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVehicleSelect = (vehicleId) => {
    setSelectedCategoryId(vehicleId);
    if (vehicleId) fetchVehicleDetails(vehicleId);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Toast toasts={toasts} />
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
            {initialLoading ? (
              [...Array(5)].map((_, i) => <CategoryCardSkeleton key={i} />)
            ) : categories[activeTab]?.length === 0 ? (
              <div className="text-center py-12 text-gray-400 bg-white rounded-xl border">
                No {activeTab} categories found.
              </div>
            ) : (
            categories[activeTab]?.map(category => (
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
                      {category.detailsLoaded || activeTab === "equipment"
                        ? `${category.items?.length ?? 0} Services`
                        : loadingVehicleIds.has(category.id)
                          ? "Loading..."
                          : "Expand to load"}
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
                  loadingVehicleIds.has(category.id) || (activeTab === "vehicle" && !category.detailsLoaded) ? (
                    <ServiceListSkeleton />
                  ) : (
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
                                        <p className="text-red-600 font-semibold"> Original Price: ₹{type.price}</p>
                                        {((type.discountPrice ?? type.discount_price) || 0) > 0 && (
                                          <p className="text-sm font-medium text-green-600">Discount Price: ₹{type.discountPrice ?? type.discount_price}</p>
                                        )}
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
                  )
                )}
              </div>
            ))
            )}
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
                  <div>
                    <label className="block text-sm font-medium mb-1">Type Name</label>
                    <input
                      type="text"
                      placeholder="Type Name"
                      className="w-full border p-2 rounded-lg"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Price</label>
                    <input
                      type="number"
                      placeholder="Price (e.g. 500)"
                      className="w-full border p-2 rounded-lg"
                      value={itemPrice}
                      onChange={(e) => setItemPrice(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Discount Price</label>
                    <input
                      type="number"
                      placeholder="Discount Price (default 0)"
                      className="w-full border p-2 rounded-lg"
                      value={itemDiscountPrice}
                      onChange={(e) => setItemDiscountPrice(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      placeholder="Description"
                      className="w-full border p-2 rounded-lg"
                      value={itemDesc}
                      onChange={(e) => setItemDesc(e.target.value)}
                      rows="3"
                    />
                  </div>
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
                  <div>
                    <label className="block text-sm font-medium mb-1">Select Vehicle</label>
                    <select className="w-full border p-2 rounded-lg" onChange={(e) => handleVehicleSelect(e.target.value)}>
                      <option value="">Choose Vehicle</option>
                      {categories.vehicle.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Select Service</label>
                    <select className="w-full border p-2 rounded-lg" onChange={(e) => setSelectedServiceId(e.target.value)} disabled={!selectedCategoryId || loadingVehicleIds.has(selectedCategoryId)}>
                      <option value="">{loadingVehicleIds.has(selectedCategoryId) ? "Loading services..." : "Choose Service"}</option>
                      {categories.vehicle.find(v => v.id === selectedCategoryId)?.items.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Price</label>
                    <input type="number" placeholder="Price (e.g. 500)" className="w-full border p-2 rounded-lg" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Discount Price</label>
                    <input type="number" placeholder="Discount Price (default 0)" className="w-full border p-2 rounded-lg" value={itemDiscountPrice} onChange={(e) => setItemDiscountPrice(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea placeholder="Description" className="w-full border p-2 rounded-lg" value={itemDesc} onChange={(e) => setItemDesc(e.target.value)} />
                  </div>
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
                      onChange={(e) => handleVehicleSelect(e.target.value)}
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

              <button onClick={handleCreate} disabled={submitting} className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 disabled:opacity-60">
                {submitting ? "Processing..." : modalMode === "editService" || modalMode === "editVehicle" || modalMode === "editType" || modalMode === "editEquipment" ? "Update" : "Submit"}
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
                  <div className="space-y-2">
                    {[...Array(4)].map((_, i) => <ListItemSkeleton key={i} />)}
                  </div>
                ) : brandsList.length === 0 ? (
                  <p className="text-sm text-gray-400">No brands yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {brandsList.map((b) => (
                      <li key={b.id} className="flex items-center justify-between border p-2 rounded-lg">
                        <span className="text-gray-700">{b.name}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => selectBrandModels(b.id)}
                            className="p-2 rounded hover:bg-gray-100"
                            title="View Models"
                          >
                            <Search size={16} className="text-gray-600" />
                          </button>
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

              {selectedBrandId && (
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">Models for {brandsList.find((b) => b.id === selectedBrandId)?.name || "Selected Brand"}</h4>
                      <p className="text-sm text-gray-500">Create or manage models under this brand.</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedBrandId(null);
                        setModelsList([]);
                        setModelName("");
                        setEditingModelId(null);
                      }}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Close selection
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 border p-2 rounded-lg"
                        value={modelName}
                        onChange={(e) => setModelName(e.target.value)}
                        placeholder="e.g. i20"
                      />
                      {editingModelId ? (
                        <button onClick={handleUpdateModel} disabled={modelLoading} className="bg-yellow-500 text-white px-4 py-2 rounded-lg">{modelLoading ? 'Updating...' : 'Update'}</button>
                      ) : (
                        <button onClick={handleCreateModel} disabled={modelLoading} className="bg-red-600 text-white px-4 py-2 rounded-lg">{modelLoading ? 'Creating...' : 'Create'}</button>
                      )}
                    </div>

                    {modelLoading && modelsList.length === 0 ? (
                      <div className="space-y-2">
                        {[...Array(3)].map((_, i) => <ListItemSkeleton key={i} />)}
                      </div>
                    ) : modelsList.length === 0 ? (
                      <p className="text-sm text-gray-400">No models yet for this brand.</p>
                    ) : (
                      <ul className="space-y-2">
                        {modelsList.map((m) => (
                          <li key={m.id} className="flex items-center justify-between border p-2 rounded-lg">
                            <span className="text-gray-700">{m.name}</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => selectModelFuels(m.id)}
                                className="p-2 rounded hover:bg-gray-100"
                                title="View Fuels"
                              >
                                <Search size={16} className="text-gray-600" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingModelId(m.id);
                                  setModelName(m.name || "");
                                }}
                                className="p-2 rounded hover:bg-gray-100"
                                title="Edit Model"
                              >
                                <Edit2 size={16} className="text-gray-600" />
                              </button>
                              <button
                                onClick={() => handleDeleteModel(m.id)}
                                className="p-2 rounded hover:bg-gray-100"
                                title="Delete Model"
                              >
                                <Trash2 size={16} className="text-gray-600" />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {selectedModelId && (
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">Fuels for {modelsList.find((m) => m.id === selectedModelId)?.name || "Selected Model"}</h4>
                      <p className="text-sm text-gray-500">Create or manage fuel types under this model.</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedModelId(null);
                        setFuelsList([]);
                        setFuelName("");
                        setEditingFuelId(null);
                      }}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Close fuel list
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 border p-2 rounded-lg"
                        value={fuelName}
                        onChange={(e) => setFuelName(e.target.value)}
                        placeholder="e.g. Petrol"
                      />
                      {editingFuelId ? (
                        <button onClick={handleUpdateFuel} disabled={fuelLoading} className="bg-yellow-500 text-white px-4 py-2 rounded-lg">{fuelLoading ? 'Updating...' : 'Update'}</button>
                      ) : (
                        <button onClick={handleCreateFuel} disabled={fuelLoading} className="bg-red-600 text-white px-4 py-2 rounded-lg">{fuelLoading ? 'Creating...' : 'Create'}</button>
                      )}
                    </div>

                    {fuelLoading && fuelsList.length === 0 ? (
                      <div className="space-y-2">
                        {[...Array(3)].map((_, i) => <ListItemSkeleton key={i} />)}
                      </div>
                    ) : fuelsList.length === 0 ? (
                      <p className="text-sm text-gray-400">No fuels yet for this model.</p>
                    ) : (
                      <ul className="space-y-2">
                        {fuelsList.map((f) => (
                          <li key={f.id} className="flex items-center justify-between border p-2 rounded-lg">
                            <span className="text-gray-700">{f.name}</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingFuelId(f.id);
                                  setFuelName(f.name || "");
                                }}
                                className="p-2 rounded hover:bg-gray-100"
                                title="Edit Fuel"
                              >
                                <Edit2 size={16} className="text-gray-600" />
                              </button>
                              <button
                                onClick={() => handleDeleteFuel(f.id)}
                                className="p-2 rounded hover:bg-gray-100"
                                title="Delete Fuel"
                              >
                                <Trash2 size={16} className="text-gray-600" />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {selectedModelId && (
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">Engine CC for {modelsList.find((m) => m.id === selectedModelId)?.name || "Selected Model"}</h4>
                      <p className="text-sm text-gray-500">Create or manage engine cubic capacities.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 border p-2 rounded-lg"
                        value={engineCCName}
                        onChange={(e) => setEngineCCName(e.target.value)}
                        placeholder="e.g. 500 CC"
                      />
                      {editingEngineCCId ? (
                        <button onClick={handleUpdateEngineCC} disabled={engineCCLoading} className="bg-yellow-500 text-white px-4 py-2 rounded-lg">{engineCCLoading ? 'Updating...' : 'Update'}</button>
                      ) : (
                        <button onClick={handleCreateEngineCC} disabled={engineCCLoading} className="bg-red-600 text-white px-4 py-2 rounded-lg">{engineCCLoading ? 'Creating...' : 'Create'}</button>
                      )}
                    </div>

                    {engineCCLoading && engineCCList.length === 0 ? (
                      <div className="space-y-2">
                        {[...Array(3)].map((_, i) => <ListItemSkeleton key={i} />)}
                      </div>
                    ) : engineCCList.length === 0 ? (
                      <p className="text-sm text-gray-400">No engine CCs yet for this model.</p>
                    ) : (
                      <ul className="space-y-2">
                        {engineCCList.map((e) => (
                          <li key={e.id} className="flex items-center justify-between border p-2 rounded-lg">
                            <span className="text-gray-700">{e.name}</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingEngineCCId(e.id);
                                  setEngineCCName(e.name || "");
                                }}
                                className="p-2 rounded hover:bg-gray-100"
                                title="Edit Engine CC"
                              >
                                <Edit2 size={16} className="text-gray-600" />
                              </button>
                              <button
                                onClick={() => handleDeleteEngineCC(e.id)}
                                className="p-2 rounded hover:bg-gray-100"
                                title="Delete Engine CC"
                              >
                                <Trash2 size={16} className="text-gray-600" />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

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