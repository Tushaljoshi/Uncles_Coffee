import { useState, useMemo, useEffect } from "react";
import { ChevronDown, ChevronUp, X, Search, Gift, TrendingUp, Users } from "lucide-react";
import TopBar from "../components/TopBar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import { db } from "../firebase.js";
import {
    collection,
    getDocs,
    query,
    orderBy,
    where,
} from "firebase/firestore";

const Referrals = () => {
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
    const [expandedUser, setExpandedUser] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);

    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("Latest");
    const [referralData, setReferralData] = useState([]);
    const [loading, setLoading] = useState(true);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    // Fetch all referral data
    const fetchReferralData = async () => {
        try {
            setLoading(true);

            // Fetch referrals collection
            const referralsSnapshot = await getDocs(
                query(collection(db, "referrals"), orderBy("createdAt", "desc"))
            );

            // Fetch all seller profiles
            const profilesSnapshot = await getDocs(collection(db, "seller_profiles"));
            const profilesMap = {};
            profilesSnapshot.docs.forEach((doc) => {
                const data = doc.data();
                profilesMap[doc.id] = {
                    id: doc.id,
                    username: data.profileInfo?.username || "N/A",
                    email: data.auth?.email || "N/A",
                    phone: data.auth?.phone || "N/A",
                    city: data.profileInfo?.city || data.address?.city || "N/A",
                    referrerId: data.referral?.referrerId || null,
                    referredByCode: data.referral?.referredByCode || null,
                };
            });

            // Fetch all points transactions
            const transactionsSnapshot = await getDocs(
                query(collection(db, "points_transactions"), orderBy("createdAt", "desc"))
            );

            // Create a map of transactions by userId
            const transactionsMap = {};
            transactionsSnapshot.docs.forEach((doc) => {
                const data = doc.data();
                const userId = data.userId;
                if (!transactionsMap[userId]) {
                    transactionsMap[userId] = [];
                }
                transactionsMap[userId].push({
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
                    expiryAt: data.expiryAt?.toDate ? data.expiryAt.toDate() : data.expiryAt,
                });
            });

            // Count referrals for each user (users who were referred by this user)
            const referralCountMap = {};
            Object.values(profilesMap).forEach((profile) => {
                if (profile.referrerId) {
                    if (!referralCountMap[profile.referrerId]) {
                        referralCountMap[profile.referrerId] = 0;
                    }
                    referralCountMap[profile.referrerId]++;
                }
            });

            // Combine all data
            const combinedData = referralsSnapshot.docs.map((doc) => {
                const referralData = doc.data();
                const userId = referralData.userId;
                const profile = profilesMap[userId] || {};
                const transactions = transactionsMap[userId] || [];
                const referralCount = referralCountMap[userId] || 0;

                // Get referrer info if exists
                let referrerInfo = null;
                if (profile.referrerId && profilesMap[profile.referrerId]) {
                    referrerInfo = {
                        username: profilesMap[profile.referrerId].username,
                        email: profilesMap[profile.referrerId].email,
                    };
                }

                return {
                    id: doc.id,
                    userId: userId,
                    referralCode: referralData.referralCode || "N/A",
                    totalEarned: referralData.totalEarned || 0,
                    totalRedeemed: referralData.totalRedeemed || 0,
                    availablePoints: referralData.availablePoints || 0,
                    signupRewardGiven: referralData.signupRewardGiven || false,
                    createdAt: referralData.createdAt?.toDate ? referralData.createdAt.toDate() : referralData.createdAt,
                    // User profile info
                    username: profile.username,
                    email: profile.email,
                    phone: profile.phone,
                    city: profile.city,
                    // Referral info
                    referralCount: referralCount,
                    referrerInfo: referrerInfo,
                    referredByCode: profile.referredByCode,
                    // Transactions
                    transactions: transactions,
                };
            });

            setReferralData(combinedData);
        } catch (error) {
            console.error("Error fetching referral data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReferralData();
    }, []);

    const filteredData = useMemo(() => {
        return referralData
            .filter((item) => {
                const searchLower = search.toLowerCase();
                return (
                    item.username.toLowerCase().includes(searchLower) ||
                    item.email.toLowerCase().includes(searchLower) ||
                    item.referralCode.toLowerCase().includes(searchLower) ||
                    item.phone.toLowerCase().includes(searchLower)
                );
            })
            .sort((a, b) => {
                if (sort === "Latest") {
                    return new Date(b.createdAt) - new Date(a.createdAt);
                } else {
                    return new Date(a.createdAt) - new Date(b.createdAt);
                }
            });
    }, [search, sort, referralData]);

    const formatDate = (date) => {
        if (!date) return "N/A";
        const d = new Date(date);
        return d.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="min-h-screen bg-[#F8F9FB] flex">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

            {/* Overlay for mobile when sidebar is open */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Main content area */}
            <div
                className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? "lg:ml-60" : "ml-0"}`}
            >
                <TopBar toggleSidebar={toggleSidebar} />

                <main className="flex-1 p-6 overflow-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-[#0A1E3A]">
                            Referral Management
                        </h2>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            <span className="ml-3 text-gray-600">Loading referrals...</span>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-wrap gap-4 mb-6">
                                <div className="relative flex-1 min-w-[200px]">
                                    <Search
                                        size={18}
                                        className="absolute left-3 top-3 text-gray-400"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Search by name, email, phone, or referral code..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg"
                                    />
                                </div>

                                <select
                                    className="p-2 border rounded-lg"
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value)}
                                >
                                    <option value="Latest">Latest First</option>
                                    <option value="Oldest">Oldest First</option>
                                </select>
                            </div>

                            {filteredData.length === 0 ? (
                                <div className="bg-white rounded-xl border p-12 text-center">
                                    <div className="text-gray-400 mb-4">
                                        <Gift className="w-16 h-16 mx-auto" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                        No Referrals Found
                                    </h3>
                                    <p className="text-gray-500">
                                        {search
                                            ? "No matching referrals found. Try a different search."
                                            : "No referral data available."}
                                    </p>
                                </div>
                            ) : (
                                filteredData.map((item) => (
                                    <div
                                        key={item.id}
                                        className="bg-white shadow rounded-xl border p-5 mb-6"
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold">
                                                        {item.username}
                                                    </h3>
                                                    {item.referralCount > 0 && (
                                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                                            {item.referralCount} Referral{item.referralCount !== 1 ? "s" : ""}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-gray-600 text-sm">{item.email}</p>
                                                <p className="text-gray-500 text-xs mt-1">
                                                    Phone: {item.phone} | City: {item.city}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => setSelectedUser(item)}
                                                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs sm:text-sm transition-colors hover:bg-blue-700"
                                                >
                                                    View Details
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        setExpandedUser(
                                                            expandedUser === item.id ? null : item.id
                                                        )
                                                    }
                                                    className="p-2 rounded-lg border"
                                                >
                                                    {expandedUser === item.id ? (
                                                        <ChevronUp size={18} />
                                                    ) : (
                                                        <ChevronDown size={18} />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Quick Stats */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Referral Code</p>
                                                <p className="font-semibold text-[#0A1E3A]">
                                                    {item.referralCode}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Total Earned</p>
                                                <p className="font-semibold text-green-600">
                                                    {item.totalEarned} pts
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Total Redeemed</p>
                                                <p className="font-semibold text-orange-600">
                                                    {item.totalRedeemed} pts
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Available Points</p>
                                                <p className="font-semibold text-blue-600">
                                                    {item.availablePoints} pts
                                                </p>
                                            </div>
                                        </div>

                                        {/* Referrer Info */}
                                        {item.referrerInfo && (
                                            <div className="mt-4 pt-4 border-t">
                                                <p className="text-xs text-gray-500 mb-1">Referred By</p>
                                                <p className="text-sm">
                                                    <span className="font-semibold">
                                                        {item.referrerInfo.username}
                                                    </span>{" "}
                                                    ({item.referrerInfo.email})
                                                </p>
                                                {item.referredByCode && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Code: {item.referredByCode}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {expandedUser === item.id && (
                                            <div className="mt-4 border-t pt-4">
                                                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                    <TrendingUp size={16} />
                                                    Points Transactions
                                                </h4>
                                                {item.transactions.length === 0 ? (
                                                    <p className="text-gray-500 italic">
                                                        No transactions found.
                                                    </p>
                                                ) : (
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-sm border-collapse">
                                                            <thead>
                                                                <tr className="bg-gray-100 text-gray-700">
                                                                    <th className="p-3 text-left">Date</th>
                                                                    <th className="p-3 text-left">Title</th>
                                                                    <th className="p-3 text-left">Category</th>
                                                                    <th className="p-3 text-left">Type</th>
                                                                    <th className="p-3 text-left">Points</th>
                                                                    <th className="p-3 text-left">Status</th>
                                                                </tr>
                                                            </thead>

                                                            <tbody>
                                                                {item.transactions.map((txn, i) => (
                                                                    <tr
                                                                        key={i}
                                                                        className="border-b hover:bg-gray-50 transition"
                                                                    >
                                                                        <td className="p-3 text-gray-600">
                                                                            {formatDate(txn.createdAt)}
                                                                        </td>
                                                                        <td className="p-3 text-gray-700">
                                                                            {txn.title || "N/A"}
                                                                        </td>
                                                                        <td className="p-3 text-gray-700">
                                                                            {txn.category || "N/A"}
                                                                        </td>
                                                                        <td className="p-3">
                                                                            <span
                                                                                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                                                    txn.type === "credit"
                                                                                        ? "bg-green-100 text-green-700"
                                                                                        : "bg-red-100 text-red-700"
                                                                                }`}
                                                                            >
                                                                                {txn.type || "N/A"}
                                                                            </span>
                                                                        </td>
                                                                        <td
                                                                            className={`p-3 font-semibold ${
                                                                                txn.type === "credit"
                                                                                    ? "text-green-600"
                                                                                    : "text-red-600"
                                                                            }`}
                                                                        >
                                                                            {txn.type === "credit" ? "+" : "-"}
                                                                            {txn.points || 0}
                                                                        </td>
                                                                        <td className="p-3">
                                                                            <span
                                                                                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                                                    txn.expired
                                                                                        ? "bg-red-100 text-red-700"
                                                                                        : "bg-green-100 text-green-700"
                                                                                }`}
                                                                            >
                                                                                {txn.expired ? "Expired" : "Active"}
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </>
                    )}

                    {/* Detailed View Modal */}
                    {selectedUser && (
                        <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
                            <div className="bg-white w-full max-w-2xl rounded-xl p-6 relative max-h-[90vh] overflow-y-auto">
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                                >
                                    <X size={20} />
                                </button>

                                <h2 className="text-xl font-semibold mb-4">Referral Details</h2>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold text-gray-700 mb-2">User Information</h3>
                                        <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                                            <p>
                                                <strong>Name:</strong> {selectedUser.username}
                                            </p>
                                            <p>
                                                <strong>Email:</strong> {selectedUser.email}
                                            </p>
                                            <p>
                                                <strong>Phone:</strong> {selectedUser.phone}
                                            </p>
                                            <p>
                                                <strong>City:</strong> {selectedUser.city}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-gray-700 mb-2">Referral Statistics</h3>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="bg-green-50 p-4 rounded-lg">
                                                <p className="text-xs text-gray-500 mb-1">Total Earned</p>
                                                <p className="text-xl font-bold text-green-600">
                                                    {selectedUser.totalEarned} pts
                                                </p>
                                            </div>
                                            <div className="bg-orange-50 p-4 rounded-lg">
                                                <p className="text-xs text-gray-500 mb-1">Total Redeemed</p>
                                                <p className="text-xl font-bold text-orange-600">
                                                    {selectedUser.totalRedeemed} pts
                                                </p>
                                            </div>
                                            <div className="bg-blue-50 p-4 rounded-lg">
                                                <p className="text-xs text-gray-500 mb-1">Available Points</p>
                                                <p className="text-xl font-bold text-blue-600">
                                                    {selectedUser.availablePoints} pts
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-gray-700 mb-2">Referral Code</h3>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="font-mono text-lg font-semibold">
                                                {selectedUser.referralCode}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Created: {formatDate(selectedUser.createdAt)}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Signup Reward:{" "}
                                                {selectedUser.signupRewardGiven ? "Given ✓" : "Not Given"}
                                            </p>
                                        </div>
                                    </div>

                                    {selectedUser.referrerInfo && (
                                        <div>
                                            <h3 className="font-semibold text-gray-700 mb-2">Referred By</h3>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <p>
                                                    <strong>Name:</strong> {selectedUser.referrerInfo.username}
                                                </p>
                                                <p>
                                                    <strong>Email:</strong> {selectedUser.referrerInfo.email}
                                                </p>
                                                {selectedUser.referredByCode && (
                                                    <p>
                                                        <strong>Code Used:</strong> {selectedUser.referredByCode}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                            <Users size={16} />
                                            Referrals Made ({selectedUser.referralCount})
                                        </h3>
                                        {selectedUser.referralCount > 0 ? (
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <p className="text-sm">
                                                    This user has referred{" "}
                                                    <strong>{selectedUser.referralCount}</strong> user
                                                    {selectedUser.referralCount !== 1 ? "s" : ""}.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <p className="text-sm text-gray-500">
                                                    This user hasn't referred anyone yet.
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-gray-700 mb-2">
                                            All Transactions ({selectedUser.transactions.length})
                                        </h3>
                                        {selectedUser.transactions.length > 0 ? (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm border-collapse">
                                                    <thead>
                                                        <tr className="bg-gray-100 text-gray-700">
                                                            <th className="p-2 text-left">Date</th>
                                                            <th className="p-2 text-left">Title</th>
                                                            <th className="p-2 text-left">Category</th>
                                                            <th className="p-2 text-left">Type</th>
                                                            <th className="p-2 text-left">Points</th>
                                                            <th className="p-2 text-left">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {selectedUser.transactions.map((txn, i) => (
                                                            <tr
                                                                key={i}
                                                                className="border-b hover:bg-gray-50 transition"
                                                            >
                                                                <td className="p-2 text-gray-600">
                                                                    {formatDate(txn.createdAt)}
                                                                </td>
                                                                <td className="p-2 text-gray-700">
                                                                    {txn.title || "N/A"}
                                                                </td>
                                                                <td className="p-2 text-gray-700">
                                                                    {txn.category || "N/A"}
                                                                </td>
                                                                <td className="p-2">
                                                                    <span
                                                                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                                            txn.type === "credit"
                                                                                ? "bg-green-100 text-green-700"
                                                                                : "bg-red-100 text-red-700"
                                                                        }`}
                                                                    >
                                                                        {txn.type || "N/A"}
                                                                    </span>
                                                                </td>
                                                                <td
                                                                    className={`p-2 font-semibold ${
                                                                        txn.type === "credit"
                                                                            ? "text-green-600"
                                                                            : "text-red-600"
                                                                    }`}
                                                                >
                                                                    {txn.type === "credit" ? "+" : "-"}
                                                                    {txn.points || 0}
                                                                </td>
                                                                <td className="p-2">
                                                                    <span
                                                                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                                            txn.expired
                                                                                ? "bg-red-100 text-red-700"
                                                                                : "bg-green-100 text-green-700"
                                                                        }`}
                                                                    >
                                                                        {txn.expired ? "Expired" : "Active"}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <p className="text-sm text-gray-500">No transactions found.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Referrals;
