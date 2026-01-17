import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar.jsx";
import Sidebar from "../components/Sidebar.jsx";

import {
  Users,
  CreditCard,
  FileText,
  HelpCircle,
  BadgeCheck,
  ArrowDownCircle,
  Gift,
} from "lucide-react";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDeals: 0,
    activeDeals: 0,
    totalInvestments: 0,
    approvedInvestments: 0,
    totalInvestedAmount: 0,
    pendingKYC: 0,
    pendingDocs: 0,
    totalPayoutsAmount: 0,
    totalPayoutsCount: 0,
    totalReferrals: 0,
    totalTickets: 0,
    pendingTickets: 0,
  });

  const [recentUsers, setRecentUsers] = useState([]);
  const [recentInvestments, setRecentInvestments] = useState([]);
  const [recentPayouts, setRecentPayouts] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);

  const navigate = useNavigate();
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Load all admin-overview data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [
          usersRes,
          dealsRes,
          investmentsRes,
          kycRes,
          docsRes,
          payoutsRes,
          referralsRes,
          supportStatsRes,
          supportTicketsRes,
        ] = await Promise.all([
          api.get("/admin/users"),
          api.get("/admin/deals"),
          api.get("/admin/investments"),
          api.get("/admin/kyc"),
          api.get("/admin/documents"),
          api.get("/admin/all-user-payouts"),
          api.get("/admin/referrals"),
          api.get("/admin/support/stats"),
          api.get("/admin/support/tickets"),
        ]);

        const users = usersRes.success && usersRes.users ? usersRes.users : [];
        const deals = dealsRes.success && dealsRes.deals ? dealsRes.deals : [];
        const investments =
          investmentsRes.success && investmentsRes.investments
            ? investmentsRes.investments
            : [];
        const kycs = kycRes.success && kycRes.kycs ? kycRes.kycs : [];
        const docs =
          docsRes.success && docsRes.documents ? docsRes.documents : [];
        const payouts =
          payoutsRes.success && payoutsRes.payouts ? payoutsRes.payouts : [];
        const referrals =
          referralsRes.success && referralsRes.referrals
            ? referralsRes.referrals
            : [];
        const supportStats =
          supportStatsRes.success && supportStatsRes.stats
            ? supportStatsRes.stats
            : {};
        const tickets =
          supportTicketsRes.success && supportTicketsRes.tickets
            ? supportTicketsRes.tickets
            : [];

        // Users
        const totalUsers = users.length;
        const recentUsersSorted = [...users]
          .sort(
            (a, b) =>
              new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
          )
          .slice(0, 5);

        // Deals
        const totalDeals = deals.length;
        const activeDeals = deals.filter(
          (d) => d.status === "active" || d.status === "Available"
        ).length;

        // Investments
        const totalInvestments = investments.length;
        const approvedInvestments = investments.filter(
          (inv) =>
            inv.status === "Approved" || inv.displayStatus === "Approved"
        );
        const approvedInvestmentsCount = approvedInvestments.length;
        const totalInvestedAmount = approvedInvestments.reduce(
          (sum, inv) =>
            sum +
            (inv.displayAmount ||
              inv.investmentAmount ||
              inv.amount ||
              0),
          0
        );
        const recentInvestmentsSorted = [...investments]
          .sort(
            (a, b) =>
              new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
          )
          .slice(0, 5);

        // KYC
        const pendingKYC = kycs.filter(
          (k) =>
            (k.personalKYC?.status || "pending") === "pending" ||
            (k.bankKYC?.status || "pending") === "pending"
        ).length;

        // Documents
        const pendingDocs = docs.filter(
          (d) => (d.status || "pending") === "pending"
        ).length;

        // Payouts
        const totalPayoutsAmount = payouts.reduce(
          (sum, p) => sum + (p.amount || 0),
          0
        );
        const totalPayoutsCount = payouts.length;
        const recentPayoutsSorted = [...payouts]
          .sort(
            (a, b) =>
              new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
          )
          .slice(0, 5);

        // Referrals – flatten referredUsers
        const allReferredUsers = [];
        referrals.forEach((ref) => {
          (ref.referredUsers || []).forEach((ru) => {
            allReferredUsers.push({
              referrerName: ref.userName,
              referrerEmail: ref.email,
              code: ref.referralCode,
              joinedAt: ru.joinedAt,
              name: ru.name,
              email: ru.email,
              bonus: ru.actualBonus || 0,
            });
          });
        });
        const totalReferrals = allReferredUsers.length;

        // Support
        const totalTickets = supportStats.total || tickets.length || 0;
        const pendingTickets =
          (supportStats.new || 0) + (supportStats.inProgress || 0);
        const recentTicketsSorted = [...tickets]
          .sort(
            (a, b) =>
              new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
          )
          .slice(0, 5);

        setStats({
          totalUsers,
          totalDeals,
          activeDeals,
          totalInvestments,
          approvedInvestments: approvedInvestmentsCount,
          totalInvestedAmount,
          pendingKYC,
          pendingDocs,
          totalPayoutsAmount,
          totalPayoutsCount,
          totalReferrals,
          totalTickets,
          pendingTickets,
        });

        setRecentUsers(recentUsersSorted);
        setRecentInvestments(recentInvestmentsSorted);
        setRecentPayouts(recentPayoutsSorted);
        setRecentTickets(recentTicketsSorted);
      } catch (error) {
        console.error("Error loading admin dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return "₹0";
    return `₹${amount.toLocaleString("en-IN")}`;
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
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarOpen ? "lg:ml-60" : "ml-0"
        }`}
      >
        <TopBar toggleSidebar={toggleSidebar} />

        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 space-y-6 lg:space-y-8 overflow-auto">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-[#0A1E3A]">
                Admin Overview
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                High level summary of users, deals, investments, KYC, payouts &
                support.
              </p>
            </div>
            {loading && (
              <span className="text-xs sm:text-sm text-gray-500">
                Syncing latest data...
              </span>
            )}
          </div>

          {/* Top Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
            {/* Users */}
            <div className="bg-white rounded-xl border shadow-sm p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                <Users size={22} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Total Users
                </p>
                <p className="text-2xl font-semibold text-[#0A1E3A]">
                  {stats.totalUsers}
                </p>
              </div>
            </div>

            {/* Investments */}
            <div className="bg-white rounded-xl border shadow-sm p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
                <CreditCard size={22} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Approved Investments
                </p>
                <p className="text-2xl font-semibold text-[#0A1E3A]">
                  {stats.approvedInvestments}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatCurrency(stats.totalInvestedAmount)} invested
                </p>
              </div>
            </div>

            {/* Deals */}
            <div className="bg-white rounded-xl border shadow-sm p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
                <FileText size={22} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Deals
                </p>
                <p className="text-2xl font-semibold text-[#0A1E3A]">
                  {stats.totalDeals}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.activeDeals} active
                </p>
              </div>
            </div>

            {/* Support */}
            <div className="bg-white rounded-xl border shadow-sm p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
                <HelpCircle size={22} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Support Tickets
                </p>
                <p className="text-2xl font-semibold text-[#0A1E3A]">
                  {stats.totalTickets}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.pendingTickets} pending
                </p>
              </div>
            </div>
          </div>

          {/* Second row stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
            {/* KYC / Docs */}
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
                  <BadgeCheck size={20} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    KYC & Documents
                  </p>
                  <p className="text-sm text-gray-600">
                    {stats.pendingKYC} KYC pending • {stats.pendingDocs} docs
                    pending
                  </p>
                </div>
              </div>
            </div>

            {/* Payouts */}
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-green-50 text-green-600">
                  <ArrowDownCircle size={20} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Payouts
                  </p>
                  <p className="text-sm text-gray-600">
                    {stats.totalPayoutsCount} total •{" "}
                    {formatCurrency(stats.totalPayoutsAmount)}
                  </p>
                </div>
              </div>
            </div>

            {/* Referrals */}
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-pink-50 text-pink-600">
                  <Gift size={20} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Referrals
                  </p>
                  <p className="text-sm text-gray-600">
                    {stats.totalReferrals} successful referrals
                  </p>
                </div>
              </div>
            </div>

            {/* Raw counts */}
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                Quick Stats
              </p>
              <ul className="text-xs text-gray-700 space-y-1">
                <li>
                  • Total Investments:{" "}
                  <span className="font-semibold">
                    {stats.totalInvestments}
                  </span>
                </li>
                <li>
                  • Approved Investments:{" "}
                  <span className="font-semibold">
                    {stats.approvedInvestments}
                  </span>
                </li>
                <li>
                  • Total Payouts:{" "}
                  <span className="font-semibold">
                    {stats.totalPayoutsCount}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Tables section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Users */}
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm sm:text-base font-semibold text-[#0A1E3A]">
                  Latest Users
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate("/users")}
                    className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 underline underline-offset-2"
                  >
                    View all
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr className="text-left text-gray-600">
                      <th className="py-2 px-2">Name</th>
                      <th className="py-2 px-2">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.length === 0 ? (
                      <tr>
                        <td
                          colSpan="3"
                          className="py-4 text-center text-gray-500"
                        >
                          No users found.
                        </td>
                      </tr>
                    ) : (
                      recentUsers.map((u) => (
                        <tr
                          key={u._id}
                          className="border-b last:border-0 hover:bg-gray-50"
                        >
                          <td className="py-2 px-2 whitespace-nowrap">
                            {u.name || "N/A"}
                          </td>
                          <td className="py-2 px-2 break-all">
                            {u.email || "N/A"}
                          </td>
                          <td className="py-2 px-2 whitespace-nowrap">
                            {u.phoneNumber || "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Investments */}
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm sm:text-base font-semibold text-[#0A1E3A]">
                  Latest Investments
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate("/investment")}
                    className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 underline underline-offset-2"
                  >
                    View all
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr className="text-left text-gray-600">
                      <th className="py-2 px-2">User</th>
                      <th className="py-2 px-2">Deal</th>
                      <th className="py-2 px-2">Amount</th>
                      <th className="py-2 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentInvestments.length === 0 ? (
                      <tr>
                        <td
                          colSpan="4"
                          className="py-4 text-center text-gray-500"
                        >
                          No investments found.
                        </td>
                      </tr>
                    ) : (
                      recentInvestments.map((inv) => (
                        <tr
                          key={inv._id}
                          className="border-b last:border-0 hover:bg-gray-50"
                        >
                          <td className="py-2 px-2 whitespace-nowrap">
                            {inv.userId?.name ||
                              inv.userId?.email ||
                              "Unknown"}
                          </td>
                          <td className="py-2 px-2 whitespace-nowrap">
                            {inv.machineName || inv.dealName || "N/A"}
                          </td>
                          <td className="py-2 px-2 whitespace-nowrap">
                            {formatCurrency(
                              inv.displayAmount ||
                                inv.investmentAmount ||
                                inv.amount
                            )}
                            
                          </td>
                          <td className="py-2 px-2 whitespace-nowrap">
                            {inv.displayStatus || inv.status || "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Payouts */}
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm sm:text-base font-semibold text-[#0A1E3A]">
                  Recent Payouts
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate("/payout")}
                    className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 underline underline-offset-2"
                  >
                    View all
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr className="text-left text-gray-600">
                      <th className="py-2 px-2">User</th>
                      <th className="py-2 px-2">Amount</th>
                      <th className="py-2 px-2">Deal</th>
                      <th className="py-2 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPayouts.length === 0 ? (
                      <tr>
                        <td
                          colSpan="4"
                          className="py-4 text-center text-gray-500"
                        >
                          No payouts found.
                        </td>
                      </tr>
                    ) : (
                      recentPayouts.map((p) => (
                        <tr
                          key={p._id}
                          className="border-b last:border-0 hover:bg-gray-50"
                        >
                          <td className="py-2 px-2 whitespace-nowrap">
                            {p.userId?.name ||
                              p.userId?.email ||
                              "Unknown"}
                          </td>
                          <td className="py-2 px-2 whitespace-nowrap">
                            {formatCurrency(p.amount)}
                          </td>
                          <td className="py-2 px-2 whitespace-nowrap">
                            {p.dealName || "Manual Entry"}
                          </td>
                          <td className="py-2 px-2 whitespace-nowrap">
                            {p.status || "Completed"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Tickets */}
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm sm:text-base font-semibold text-[#0A1E3A]">
                  Latest Support Tickets
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate("/help")}
                    className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 underline underline-offset-2"
                  >
                    View all
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr className="text-left text-gray-600">
                      <th className="py-2 px-2">User</th>
                      <th className="py-2 px-2">Category</th>
                      <th className="py-2 px-2">Priority</th>
                      <th className="py-2 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTickets.length === 0 ? (
                      <tr>
                        <td
                          colSpan="4"
                          className="py-4 text-center text-gray-500"
                        >
                          No tickets found.
                        </td>
                      </tr>
                    ) : (
                      recentTickets.map((t) => (
                        <tr
                          key={t.id}
                          className="border-b last:border-0 hover:bg-gray-50"
                        >
                          <td className="py-2 px-2 whitespace-nowrap">
                            {t.user?.name || "N/A"}
                          </td>
                          <td className="py-2 px-2 whitespace-nowrap">
                            {t.category || "-"}
                          </td>
                          <td className="py-2 px-2 whitespace-nowrap capitalize">
                            {t.priority || "-"}
                          </td>
                          <td className="py-2 px-2 whitespace-nowrap capitalize">
                            {t.status || "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;