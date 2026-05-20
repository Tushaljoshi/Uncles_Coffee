import React, { useEffect, useState } from "react";
import {
  X,
  Mail,
  Phone,
  Calendar,
  Search,
  Users,
} from "lucide-react";
import TopBar from "../components/TopBar.jsx";
import Sidebar from "../components/Sidebar.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* ================= SKELETON CARD ================= */

const CustomerSkeleton = () => (
  <div className="bg-white rounded-2xl border p-5 animate-pulse">
    <div className="flex justify-center mb-4">
      <div className="w-24 h-24 rounded-full bg-gray-200" />
    </div>
    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
    <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto" />
    <div className="h-9 bg-gray-200 rounded mt-4" />
  </div>
);

const AdminCustomerProfile = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customers, setCustomers] = useState([]);

  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");

  /* FETCH CUSTOMERS FROM API */
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(
          `${API_BASE_URL}/api/customer-profile/all-profiles`
        );
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          setCustomers(data.data);
        } else {
          throw new Error("Invalid API response format");
        }
      } catch (err) {
        console.error("Error fetching customers:", err);
        setError(err.message || "Failed to fetch customers");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  /* FILTER LOGIC */
  const filteredCustomers = customers.filter((u) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      u.name.toLowerCase().includes(keyword) ||
      u.email.toLowerCase().includes(keyword) ||
      u.phone.includes(keyword);

    const matchesGender =
      genderFilter === "all" || 
      u.gender.toLowerCase() === genderFilter.toLowerCase();

    return matchesSearch && matchesGender;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className={`flex-1 flex flex-col ${sidebarOpen ? "lg:ml-60" : ""}`}>
        <TopBar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-6 overflow-auto">
          {/* HEADER */}
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Customer Profiles
          </h1>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-800 text-sm font-medium">Error: {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* SEARCH & FILTER */}
          <div className="bg-white p-4 rounded-xl shadow-sm border mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email or phone"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-red-500"
              />
            </div>

            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          {/* GRID */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              [...Array(8)].map((_, i) => <CustomerSkeleton key={i} />)
            ) : filteredCustomers.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <Users size={32} className="text-red-600" />
                </div>

                <p className="text-lg font-semibold text-gray-800">
                  No Customers Found
                </p>

                <p className="text-sm text-gray-500 mt-1 max-w-sm">
                  We couldn’t find any customers matching your search or filter criteria.
                  Try adjusting your filters or search keywords.
                </p>

                <button
                  onClick={() => {
                    setSearch("");
                    setGenderFilter("all");
                  }}
                  className="mt-5 px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700
               text-white text-sm font-medium transition"
                >
                  Clear Filters
                </button>
              </div>

            ) : (
              filteredCustomers.map((user) => (
                <div
                  key={user.userId}
                  className="bg-white rounded-2xl shadow-sm border p-5"
                >
                  <div className="flex justify-center">
                    <img
                      src={user.profileImage}
                      className="w-24 h-24 rounded-full object-cover border"
                      alt="profile"
                    />
                  </div>

                  <h3 className="text-center font-semibold text-gray-800 mt-3">
                    {user.name}
                  </h3>

                  <p className="text-center text-sm text-gray-500">
                    {user.email}
                  </p>

                  <button
                    onClick={() => setSelectedCustomer(user)}
                    className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium"
                  >
                    View Profile
                  </button>
                </div>
              ))
            )}
          </div>

          {/* ================= PROFILE MODAL ================= */}
          {selectedCustomer && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
              <div className="bg-white max-w-md w-full rounded-2xl shadow-xl relative overflow-hidden">
                <button
                  className="absolute top-4 right-4 text-gray-500 hover:text-red-600"
                  onClick={() => setSelectedCustomer(null)}
                >
                  <X />
                </button>

                <div className="p-6 text-center border-b">
                  <img
                    src={selectedCustomer.profileImage}
                    className="w-28 h-28 rounded-full mx-auto border"
                    alt="profile"
                  />
                  <h2 className="text-xl font-bold mt-3">
                    {selectedCustomer.name}
                  </h2>
                </div>

                <div className="p-6 space-y-5">
                  <Info label="Email" icon={Mail} value={selectedCustomer.email} />
                  <Info label="Mobile No." icon={Phone} value={selectedCustomer.phone} />
                  <Info label="Date of Birth" icon={Calendar} value={selectedCustomer.dob} />
                  <Info label="Gender" value={selectedCustomer.gender} />
                </div>

                <div className="p-4 border-t">
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

/* ================= REUSABLE ================= */

const Info = ({ label, value, icon: Icon }) => (
  <div>
    <label className="text-xs text-gray-500">{label}</label>
    <div className="flex items-center gap-2 border rounded-xl px-4 py-3">
      {Icon && <Icon size={16} className="text-gray-400" />}
      <span className="text-sm">{value}</span>
    </div>
  </div>
);

export default AdminCustomerProfile;
