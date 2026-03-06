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

/* ================= DUMMY CUSTOMER DATA ================= */

const DUMMY_CUSTOMERS = [
  {
    id: 1,
    name: "Vivek Sharma",
    email: "vivek054@gmail.com",
    phone: "+91 9841626813",
    dob: "12/08/1996",
    gender: "Male",
    profileImage: "https://i.pravatar.cc/150?img=12",
  },
  {
    id: 2,
    name: "Ananya Verma",
    email: "ananya@gmail.com",
    phone: "+91 9876543210",
    dob: "05/04/1998",
    gender: "Female",
    profileImage: "https://i.pravatar.cc/150?img=32",
  },
  {
    id: 3,
    name: "Rahul Mehta",
    email: "rahul.mehta@gmail.com",
    phone: "+91 9988776655",
    dob: "21/01/1994",
    gender: "Male",
    profileImage: "https://i.pravatar.cc/150?img=45",
  },
];

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

  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");

  /* SIMULATE LOADING */
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  /* FILTER LOGIC */
  const filteredCustomers = DUMMY_CUSTOMERS.filter((u) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      u.name.toLowerCase().includes(keyword) ||
      u.email.toLowerCase().includes(keyword) ||
      u.phone.includes(keyword);

    const matchesGender =
      genderFilter === "all" || u.gender === genderFilter;

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
              <option value="Male">Male</option>
              <option value="Female">Female</option>
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
                  key={user.id}
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
