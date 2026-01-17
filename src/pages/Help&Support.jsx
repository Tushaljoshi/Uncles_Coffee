import React, { useState, useEffect } from "react";
import { Search, X, FileText, Loader, RefreshCw, AlertCircle, Clock, CheckCircle, Mail, Image as ImageIcon } from "lucide-react";
import TopBar from "../components/TopBar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import { db } from "../firebase.js";
import {
    collection,
    getDocs,
    query,
    orderBy,
    doc,
    updateDoc,
    Timestamp,
} from "firebase/firestore";

const Reports = () => {
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterCategory, setFilterCategory] = useState("all");
    const [selectedReport, setSelectedReport] = useState(null);
    const [reports, setReports] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const COMPANY_EMAIL = "rabab.jayed25@gmail.com";
    const fetchReports = async () => {
        try {
            setLoading(true);
            const reportsSnapshot = await getDocs(
                query(collection(db, "reports"), orderBy("createdAt", "desc"))
            );
            const profilesSnapshot = await getDocs(collection(db, "seller_profiles"));
            const profilesMap = {};
            profilesSnapshot.docs.forEach((doc) => {
                const data = doc.data();
                profilesMap[doc.id] = {
                    username: data.profileInfo?.username || "Unknown User",
                    email: data.auth?.email || "N/A",
                    phone: data.auth?.phone || "N/A",
                };
            });
            const reportsData = reportsSnapshot.docs.map((doc) => {
                const data = doc.data();
                const userId = data.userId;
                const userProfile = profilesMap[userId] || {
                    username: "Unknown User",
                    email: data.contactEmail || "N/A",
                    phone: "N/A",
                };

                return {
                    id: doc.id,
                    reportId: data.reportId || doc.id,
                    userId: userId,
                    contactEmail: data.contactEmail || userProfile.email,
                    description: data.description || "",
                    issueCategory: data.issueCategory || "Other",
                    proofImage: data.proofImage || null,
                    status: data.status || "pending",
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
                    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
                    username: userProfile.username,
                    userEmail: userProfile.email,
                    userPhone: userProfile.phone,
                };
            });

            setReports(reportsData);
            const statsData = {
                total: reportsData.length,
                pending: reportsData.filter((r) => r.status === "pending").length,
                inProgress: reportsData.filter((r) => r.status === "in-progress").length,
                resolved: reportsData.filter((r) => r.status === "resolved").length,
                closed: reportsData.filter((r) => r.status === "closed").length,
            };
            setStats(statsData);
        } catch (error) {
            console.error("Error fetching reports:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const filteredReports = reports.filter((r) => {
        const matchSearch =
            r.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.contactEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.reportId.toLowerCase().includes(searchQuery.toLowerCase());

        const matchStatus = filterStatus === "all" || r.status === filterStatus;

        const matchCategory =
            filterCategory === "all" || r.issueCategory === filterCategory;

        return matchSearch && matchStatus && matchCategory;
    });

    const updateReportStatus = async (id, newStatus) => {
        try {
            setUpdating(true);
            const reportRef = doc(db, "reports", id);
            await updateDoc(reportRef, {
                status: newStatus,
                updatedAt: Timestamp.now(),
            });

            setReports((prev) =>
                prev.map((r) =>
                    r.id === id
                        ? {
                              ...r,
                              status: newStatus,
                              updatedAt: new Date(),
                          }
                        : r
                )
            );

            if (selectedReport && selectedReport.id === id) {
                setSelectedReport({
                    ...selectedReport,
                    status: newStatus,
                    updatedAt: new Date(),
                });
            }

            alert("Report status updated successfully!");
        } catch (error) {
            console.error("Error updating report status:", error);
            alert("Failed to update report status. Please try again.");
        } finally {
            setUpdating(false);
        }
    };

    const handleEmailReply = (report) => {
        const subject = encodeURIComponent(`Re: ${report.issueCategory}`);
        const body = encodeURIComponent(
            `Dear ${report.username},\n\n` +
            `Thank you for reporting this issue. We have reviewed your report regarding:\n\n` +
            `${report.description}\n\n` +
            `Please find our response below:\n\n` +
            `[Your response here]\n\n` +
            `Best regards,\n` +
            `Swap Street Support Team\n` +
            `Support Email: ${COMPANY_EMAIL}\n\n` +
            `Note: Please reply to this email if you have any further questions.`
        );
        const mailtoLink = `mailto:${report.contactEmail}?subject=${subject}&body=${body}`;
        window.open(mailtoLink, '_blank');
        setSelectedReport(null);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "pending":
                return "bg-blue-100 text-blue-800";
            case "in-progress":
                return "bg-yellow-100 text-yellow-800";
            case "resolved":
                return "bg-green-100 text-green-800";
            case "closed":
                return "bg-gray-100 text-gray-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getPriority = (category) => {
        const highPriorityCategories = [
            "Account & Login Issues",
            "Payment Issues",
            "Security Concerns",
        ];
        return highPriorityCategories.includes(category) ? "high" : "medium";
    };

    return (
        <div className="min-h-screen bg-[#F8F9FB] flex">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            <div
                className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? "lg:ml-60" : "ml-0"}`}
            >
                <TopBar toggleSidebar={toggleSidebar} />

                <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-semibold text-[#0A1E3A]">
                                Reports Management
                            </h1>
                            <p className="text-gray-600 text-sm mt-1">
                                Manage user reports and issues
                            </p>
                        </div>
                        <button
                            onClick={fetchReports}
                            disabled={loading}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                            Refresh
                        </button>
                    </div>

                    {!loading && stats && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                            <div className="bg-white p-4 rounded-lg border shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <FileText size={20} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-semibold text-gray-900">
                                            {stats.total || 0}
                                        </p>
                                        <p className="text-sm text-gray-600">Total Reports</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg border shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Clock size={20} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-semibold text-gray-900">
                                            {stats.pending || 0}
                                        </p>
                                        <p className="text-sm text-gray-600">Pending</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg border shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-yellow-100 rounded-lg">
                                        <AlertCircle size={20} className="text-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-semibold text-gray-900">
                                            {stats.inProgress || 0}
                                        </p>
                                        <p className="text-sm text-gray-600">In Progress</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg border shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <CheckCircle size={20} className="text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-semibold text-gray-900">
                                            {stats.resolved || 0}
                                        </p>
                                        <p className="text-sm text-gray-600">Resolved</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg border shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <FileText size={20} className="text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-semibold text-gray-900">
                                            {stats.closed || 0}
                                        </p>
                                        <p className="text-sm text-gray-600">Closed</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search
                                size={18}
                                className="absolute left-3 top-3 text-gray-400"
                            />
                            <input
                                type="text"
                                placeholder="Search by name, email, description, or report ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 w-full py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="border rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-700 focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                        </select>

                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="border rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-700 focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Categories</option>
                            <option value="Account & Login Issues">Account & Login Issues</option>
                            <option value="Payment Issues">Payment Issues</option>
                            <option value="Product Issues">Product Issues</option>
                            <option value="Order Issues">Order Issues</option>
                            <option value="Technical Issues">Technical Issues</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {/* Reports List */}
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <Loader className="animate-spin mx-auto mb-4" size={32} />
                                <p className="text-gray-500">Loading reports...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border shadow overflow-x-auto">
                            <table className="w-full text-xs sm:text-sm min-w-[1000px]">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="p-2 sm:p-4 text-left font-semibold text-gray-700">
                                            User
                                        </th>
                                        <th className="p-2 sm:p-4 text-left font-semibold text-gray-700">
                                            Category
                                        </th>
                                        <th className="p-2 sm:p-4 text-left font-semibold text-gray-700">
                                            Description
                                        </th>
                                        <th className="p-2 sm:p-4 text-center font-semibold text-gray-700">
                                            Priority
                                        </th>
                                        <th className="p-2 sm:p-4 text-center font-semibold text-gray-700">
                                            Status
                                        </th>
                                        <th className="p-2 sm:p-4 text-center font-semibold text-gray-700">
                                            Date
                                        </th>
                                        <th className="p-2 sm:p-4 text-center font-semibold text-gray-700">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredReports.length > 0 ? (
                                        filteredReports.map((report) => (
                                            <tr
                                                key={report.id}
                                                className="border-b hover:bg-gray-50 transition-colors"
                                            >

                                                <td className="p-2 sm:p-4">
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {report.username}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {report.contactEmail}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="p-2 sm:p-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {report.issueCategory}
                                                    </span>
                                                </td>
                                                <td className="p-2 sm:p-4">
                                                    <p
                                                        className="text-gray-900 max-w-xs truncate"
                                                        title={report.description}
                                                    >
                                                        {report.description.length > 50
                                                            ? `${report.description.slice(0, 50)}...`
                                                            : report.description}
                                                    </p>
                                                    {report.proofImage && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                                                            <ImageIcon size={12} />
                                                            Has Image
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-2 sm:p-4 text-center">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            getPriority(report.issueCategory) === "high"
                                                                ? "bg-red-100 text-red-800"
                                                                : "bg-yellow-100 text-yellow-800"
                                                        }`}
                                                    >
                                                        {getPriority(report.issueCategory)}
                                                    </span>
                                                </td>
                                                <td className="p-2 sm:p-4 text-center">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                                            report.status
                                                        )}`}
                                                    >
                                                        {report.status === "in-progress"
                                                            ? "In Progress"
                                                            : report.status.charAt(0).toUpperCase() +
                                                              report.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="p-2 sm:p-4 text-center text-gray-500">
                                                    {formatDate(report.createdAt)}
                                                </td>
                                                <td className="p-2 sm:p-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => setSelectedReport(report)}
                                                            className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                                                        >
                                                            View
                                                        </button>
                                                        <button
                                                            onClick={() => handleEmailReply(report)}
                                                            className="text-green-600 hover:text-green-800 font-medium text-xs flex items-center gap-1"
                                                            title="Reply via Email"
                                                        >
                                                            <Mail size={14} />
                                                            Reply
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="p-12 text-center">
                                                <FileText
                                                    size={48}
                                                    className="mx-auto mb-4 text-gray-300"
                                                />
                                                <p className="text-gray-500 text-lg">No reports found</p>
                                                <p className="text-gray-400 text-sm">
                                                    User reports will appear here
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>

                {selectedReport && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50">
                        <div className="bg-white w-full max-w-xs sm:max-w-lg md:max-w-2xl rounded-xl shadow-xl relative max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b p-4 sm:p-6 rounded-t-xl">
                                <button
                                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                                    onClick={() => setSelectedReport(null)}
                                >
                                    <X size={22} />
                                </button>

                                <h2 className="text-xl font-semibold text-[#0A1E3A] pr-8">
                                    Report Details
                                </h2>
                            </div>

                            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-800 mb-2">Report ID</h3>
                                    <p className="font-mono text-sm">{selectedReport.reportId}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-800 mb-3">User Information</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                                        <div>
                                            <strong className="text-gray-700">Name:</strong>
                                            <p className="mt-1">{selectedReport.username}</p>
                                        </div>
                                        <div>
                                            <strong className="text-gray-700">Email:</strong>
                                            <p className="mt-1">{selectedReport.contactEmail}</p>
                                        </div>
                                        {selectedReport.userPhone && (
                                            <div>
                                                <strong className="text-gray-700">Phone:</strong>
                                                <p className="mt-1">{selectedReport.userPhone}</p>
                                            </div>
                                        )}
                                        <div>
                                            <strong className="text-gray-700">User ID:</strong>
                                            <p className="mt-1 font-mono text-xs">
                                                {selectedReport.userId}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-2">Issue Category</h3>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                        {selectedReport.issueCategory}
                                    </span>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
                                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                                        <p className="text-gray-800 whitespace-pre-wrap">
                                            {selectedReport.description}
                                        </p>
                                    </div>
                                </div>

                                {selectedReport.proofImage && (
                                    <div>
                                        <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                            <ImageIcon size={16} />
                                            Proof Image
                                        </h3>
                                        <div className="mt-2">
                                            <img
                                                src={selectedReport.proofImage}
                                                alt="Report proof"
                                                className="max-w-full h-auto max-h-64 rounded-lg border shadow-sm cursor-pointer"
                                                onClick={() =>
                                                    window.open(selectedReport.proofImage, "_blank")
                                                }
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Click to view full size
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Report Metadata */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 text-sm">
                                    <div>
                                        <strong className="text-gray-700">Priority:</strong>
                                        <p className="mt-1 capitalize">
                                            {getPriority(selectedReport.issueCategory)}
                                        </p>
                                    </div>
                                    <div>
                                        <strong className="text-gray-700">Status:</strong>
                                        <p className="mt-1">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                                    selectedReport.status
                                                )}`}
                                            >
                                                {selectedReport.status === "in-progress"
                                                    ? "In Progress"
                                                    : selectedReport.status.charAt(0).toUpperCase() +
                                                      selectedReport.status.slice(1)}
                                            </span>
                                        </p>
                                    </div>
                                    <div>
                                        <strong className="text-gray-700">Created:</strong>
                                        <p className="mt-1">{formatDate(selectedReport.createdAt)}</p>
                                    </div>
                                    {selectedReport.updatedAt && (
                                        <div>
                                            <strong className="text-gray-700">Last Updated:</strong>
                                            <p className="mt-1">{formatDate(selectedReport.updatedAt)}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t pt-6">
                                    <h3 className="font-semibold text-gray-800 mb-4">Admin Actions</h3>

                                    <div className="mb-4">
                                        <label className="block font-medium text-gray-700 mb-2">
                                            Update Status:
                                        </label>
                                        <select
                                            value={selectedReport.status}
                                            onChange={(e) =>
                                                updateReportStatus(selectedReport.id, e.target.value)
                                            }
                                            disabled={updating}
                                            className="border rounded-lg px-4 py-2 w-full disabled:opacity-50 focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="in-progress">In Progress</option>
                                            <option value="resolved">Resolved</option>
                                            <option value="closed">Closed</option>
                                        </select>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                        <button
                                            onClick={() => handleEmailReply(selectedReport)}
                                            className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-green-700 text-sm"
                                        >
                                            <Mail size={16} />
                                            Reply via Email
                                        </button>

                                        <button
                                            onClick={() =>
                                                updateReportStatus(selectedReport.id, "resolved")
                                            }
                                            disabled={updating}
                                            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {updating ? (
                                                <Loader className="animate-spin" size={16} />
                                            ) : (
                                                <CheckCircle size={16} />
                                            )}
                                            Mark as Resolved
                                        </button>

                                        <button
                                            onClick={() =>
                                                updateReportStatus(selectedReport.id, "in-progress")
                                            }
                                            disabled={updating}
                                            className="flex items-center justify-center gap-2 bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                                        >
                                            {updating ? (
                                                <Loader className="animate-spin" size={16} />
                                            ) : (
                                                <Clock size={16} />
                                            )}
                                            Mark In Progress
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="sticky bottom-0 bg-gray-50 border-t p-4 rounded-b-xl">
                                <button
                                    onClick={() => setSelectedReport(null)}
                                    className="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports;
