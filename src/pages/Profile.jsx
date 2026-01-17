import React, { useEffect, useState } from "react";
import TopBar from "../components/TopBar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import { X } from "lucide-react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";

const UserProfile = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);

      const q = query(
        collection(db, "seller_profiles"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(Boolean);

      console.log("SELLER DATA:", data);
      setUsers(data);
    } catch (error) {
      console.error("Firestore fetch error:", error);
    } finally {
      setLoading(false);
    }
  }
  const filteredUsers = users.filter((user) => {
    if (!user) return false;

    const profile = user.profileInfo || {};
    const auth = user.auth || {};

    const keyword = search.toLowerCase();

    const matchesSearch =
      (profile.username || "").toLowerCase().includes(keyword) ||
      (auth.email || "").toLowerCase().includes(keyword);

    const matchesGender =
      genderFilter === "all" || profile.gender === genderFilter;

    return matchesSearch && matchesGender;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <div className={`flex-1 flex flex-col ${sidebarOpen ? "lg:ml-60" : ""}`}>
        <TopBar toggleSidebar={toggleSidebar} />

        <main className="flex-1 p-6 overflow-auto">
          <h2 className="text-2xl font-bold mb-4">Seller Profiles</h2>
          <div className="bg-white p-4 rounded-xl mb-6 grid sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Search by username or email"
              className="border px-4 py-2 rounded-lg"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="border px-4 py-2 rounded-lg"
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
            >
              <option value="all">All Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {loading ? (
              <p className="col-span-full text-center">Loading...</p>
            ) : filteredUsers.length === 0 ? (
              <p className="col-span-full text-center">No sellers found</p>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-white p-5 rounded-xl shadow"
                >
                  <div className="flex justify-center">
                    <img
                      src={
                        user?.images?.profileImage
                          ? user.images.profileImage
                          : "https://via.placeholder.com/150"
                      }
                      className="w-24 h-24 rounded-full object-cover border"
                      alt="profile"
                    />
                  </div>

                  <h3 className="text-center font-semibold mt-3">
                    {user?.profileInfo?.username || "N/A"}
                  </h3>

                  <p className="text-center text-sm text-gray-600">
                    {user?.auth?.email || "N/A"}
                  </p>

                  <button
                    onClick={() => setSelectedUser(user)}
                    className="mt-4 w-full bg-[#0A1E3A] text-white py-2 rounded-lg"
                  >
                    View Details
                  </button>
                </div>
              ))
            )}
          </div>
          {selectedUser && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
              <div className="bg-white max-w-5xl w-full rounded-xl shadow-lg relative overflow-y-auto max-h-[90vh]">

                {/* CLOSE */}
                <button
                  className="absolute top-4 right-4 text-gray-600 hover:text-black"
                  onClick={() => setSelectedUser(null)}
                >
                  <X />
                </button>
                <div className="border-b px-6 py-4">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {selectedUser?.profileInfo?.username || "N/A"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Seller Details Overview
                  </p>
                </div>
                <div className="p-6 space-y-6">
                  <section className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 mb-3">Seller Status</h3>
                    <div className="grid md:grid-cols-3 gap-3 text-sm">
                      <p>
                        <strong>Seller Type:</strong>{" "}
                        <span className="capitalize">
                          {selectedUser?.sellerType || "N/A"}
                        </span>
                      </p>

                      <p>
                        <strong>Referral Used:</strong>{" "}
                        {selectedUser?.referral?.referredByCode ? (
                          <span className="text-green-600 font-semibold">Yes</span>
                        ) : (
                          <span className="text-red-500 font-semibold">No</span>
                        )}
                      </p>

                      <p>
                        <strong>Referral Code:</strong>{" "}
                        {selectedUser?.referral?.referredByCode || "N/A"}
                      </p>
                    </div>
                  </section>

                  {/* AUTH */}
                  <section className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-3">Authentication</h3>
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <p><strong>Email:</strong> {selectedUser?.auth?.email || "N/A"}</p>
                      <p><strong>Login Method:</strong> {selectedUser?.auth?.loginMethod || "N/A"}</p>
                      <p><strong>Phone:</strong> {selectedUser?.auth?.phone || "N/A"}</p>
                      <p><strong>UID:</strong> {selectedUser?.uid || "N/A"}</p>
                    </div>
                  </section>
                  <section className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-3">Profile Information</h3>
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <p><strong>Gender:</strong> {selectedUser?.profileInfo?.gender || "N/A"}</p>
                      <p><strong>Language:</strong> {selectedUser?.profileInfo?.language || "N/A"}</p>
                      <p><strong>City:</strong> {selectedUser?.profileInfo?.city || "N/A"}</p>
                      <p className="md:col-span-2">
                        <strong>Bio:</strong> {selectedUser?.profileInfo?.bio || "N/A"}
                      </p>
                    </div>
                  </section>
                  <section className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-3">Address</h3>
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <p><strong>City:</strong> {selectedUser?.address?.city || "N/A"}</p>
                      <p><strong>Country:</strong> {selectedUser?.address?.country || "N/A"}</p>
                      <p><strong>Zip Code:</strong> {selectedUser?.address?.zipCode || "N/A"}</p>
                      <p className="md:col-span-2">
                        <strong>Full Address:</strong> {selectedUser?.address?.fullAddress || "N/A"}
                      </p>
                    </div>
                  </section>

                  {/* PAYMENT */}
                  <section className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-3">Payment Details</h3>
                    <div className="grid md:grid-cols-2 gap-3 text-sm mb-4">
                      <p><strong>Bank Name:</strong> {selectedUser?.payment?.bankName || "N/A"}</p>
                      <p><strong>Account / IBAN:</strong> {selectedUser?.payment?.accountNumberOrIban || "N/A"}</p>
                      <p><strong>Swift Code:</strong> {selectedUser?.payment?.swiftCode || "N/A"}</p>
                      <p><strong>Account Holder:</strong> {selectedUser?.payment?.accountHolderName || "N/A"}</p>
                    </div>

                    {/* BANK PROOF IMAGE */}
                    <div>
                      <strong className="text-sm">Bank Proof:</strong>
                      <div className="mt-2">
                        {selectedUser?.payment?.bankProof ? (
                          <img
                            src={selectedUser.payment.bankProof}
                            alt="Bank Proof"
                            className="w-48 h-auto rounded border shadow"
                          />
                        ) : (
                          <p className="text-sm text-gray-500">Not uploaded</p>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* CATEGORIES */}
                  <section className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-3">Product Categories</h3>
                    {selectedUser?.productCategories?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.productCategories.map((cat, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No categories available</p>
                    )}
                  </section>

                </div>

              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default UserProfile;
