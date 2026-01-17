import React, { useState, useEffect } from "react";
import { Search, X, CheckCircle, XCircle, Eye } from "lucide-react";
import TopBar from "../components/TopBar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import { db, realtimeDb } from "../firebase.js";
import { get, ref } from "firebase/database";
import { collection, getDocs } from "firebase/firestore";

const Documents = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Fetch documents from database
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/documents');
      if (response.success && response.documents) {
        // Group documents by user
        const groupedByUser = {};
        response.documents.forEach(doc => {
          const userId = doc.userId?._id;
          if (!groupedByUser[userId]) {
            groupedByUser[userId] = {
              id: userId,
              name: doc.userId?.name || 'Unknown',
              email: doc.userId?.email || 'N/A',
              profile: doc.userId?.profileImage ? `data:image/jpeg;base64,${doc.userId.profileImage}` : "https://i.pravatar.cc/150?img=12",
              documents: []
            };
          }
          groupedByUser[userId].documents.push({
            id: doc._id,
            name: doc.documentType === 'aadhar' ? 'Aadhar Card' : 
                  doc.documentType === 'pan' ? 'Pan Card' : 
                  'Bank Passbook',
            date: new Date(doc.uploadedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            status: doc.status,
            file: `data:${doc.mimeType};base64,${doc.fileData}`,
            _id: doc._id
          });
        });
        setUsers(Object.values(groupedByUser));
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };



  const filteredUsers = users.filter((u) =>
    `${u.userId?.name || ''} ${u.userId?.email || ''}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const updateDocStatus = async (status) => {
    try {
      const response = await api.put(`/admin/documents/${selectedDoc._id}`, { status });
      if (response.success) {
        setSelectedDoc({ ...selectedDoc, status });
        fetchDocuments();
      }
    } catch (error) {
      console.error('Error updating document status:', error);
    }
  };

  const oldUpdateDocStatus = (status) => {
    setSelectedDoc((prev) => ({
      ...prev,
      status,
    }));
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
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:ml-60' : 'ml-0'}`}>
        <TopBar toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 p-6 overflow-auto">
        <h2 className="text-2xl font-bold mb-6">Admin Document Verification</h2>
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search user documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredUsers.map((u) => (
            <div className="bg-white rounded-xl border shadow-sm p-5" key={u.id} style={{minWidth: '265px'}}>
              <div className="flex flex-col items-center text-center gap-3">
                <img
                  src={u.profile}
                  alt="Profile"
                  className="w-20 h-20 rounded-full border object-cover"
                />
                <div className="w-full">
                  <h3 className="font-semibold text-lg">{u.name}</h3>
                  <p className="text-sm text-gray-500 break-words overflow-hidden">{u.email}</p>
                </div>
              </div>

              <div className="mt-4">
                {u.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex justify-between items-center bg-gray-50 p-3 rounded-lg mb-2"
                  >
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-xs text-gray-500">
                        Updated: {doc.date}
                      </p>

                      <span
                        className={`text-sm font-medium ${
                          doc.status === "approved"
                            ? "text-green-600"
                            : doc.status === "rejected"
                            ? "text-red-600"
                            : "text-orange-500"
                        }`}
                      >
                        {doc.status === "approved" ? "verified" : doc.status}
                      </span>
                    </div>

                    <button
                      className="border px-2 sm:px-3 py-1 rounded-lg text-[#0A1E3A] hover:bg-[#0A1E3A] hover:text-white transition flex items-center gap-1 text-xs sm:text-sm"
                      onClick={() =>
                        setSelectedDoc({ ...doc, userName: u.name, userEmail: u.email })
                      }
                    >
                      <Eye size={16} /> View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      {/* ------------------------------------------------------
              MODAL : VIEW DOCUMENT + VERIFY/REJECT
      ------------------------------------------------------ */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-xl shadow-xl relative">

            <button
              onClick={() => setSelectedDoc(null)}
              className="absolute top-4 right-4 text-gray-600 hover:text-black"
            >
              <X size={22} />
            </button>

            {/* User Info */}
            <h2 className="text-xl font-semibold mb-1">{selectedDoc.name}</h2>
            <p className="text-sm text-gray-500 mb-4 break-words">
              Uploaded by: {selectedDoc.userName} ({selectedDoc.userEmail})
            </p>

            {/* Image/PDF Preview */}
            <div className="bg-gray-100 h-80 rounded-lg flex justify-center items-center overflow-hidden mb-4">
              <img
                src={selectedDoc.file}
                alt="Document Preview"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Conditional Action Buttons or Status Display */}
            {selectedDoc.status === "approved" ? (
              /* Show only Completed status when document is approved */
              <div className="mb-4">
                <div className="inline-flex px-6 py-3 rounded-lg flex items-center gap-3 font-semibold bg-green-100 text-green-700 text-lg">
                  <CheckCircle size={24} />
                  Completed
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  This document has been verified and approved. No further action required.
                </p>
              </div>
            ) : (
              /* Show action buttons for pending/rejected documents */
              <>
                <div className="flex flex-wrap gap-3 mb-4">
                  <button
                    onClick={() => {/* Save notes functionality */}}
                    className="px-3 sm:px-4 py-2 bg-slate-700 text-white rounded-lg flex items-center gap-2 hover:bg-slate-800 hover:shadow-lg transition-all duration-200 text-sm"
                  >
                    Save Notes
                  </button>

                  <button
                    onClick={() => updateDocStatus("approved")}
                    className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700 hover:shadow-lg transition-all duration-200 text-sm"
                  >
                    <CheckCircle size={18} /> Mark Completed
                  </button>

                  <button
                    onClick={() => updateDocStatus("pending")}
                    className="px-3 sm:px-4 py-2 bg-yellow-500 text-white rounded-lg flex items-center gap-2 hover:bg-yellow-600 hover:shadow-lg transition-all duration-200 text-sm"
                  >
                    Mark Pending
                  </button>

                  <button
                    onClick={() => updateDocStatus("rejected")}
                    className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2 hover:bg-red-700 hover:shadow-lg transition-all duration-200 text-sm"
                  >
                    <XCircle size={18} /> Reject
                  </button>
                </div>

                {/* Current Status Display for non-completed documents */}
                {selectedDoc.status && (
                  <div className="mb-4">
                    <div className={`inline-flex px-4 py-2 rounded-lg flex items-center gap-2 font-semibold ${
                      selectedDoc.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : selectedDoc.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}>
                      {selectedDoc.status === "rejected" && <XCircle size={18} />}
                      Current Status: {selectedDoc.status === "rejected" ? "Rejected" : selectedDoc.status}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
        </main>
      </div>
    </div>
  );
};

export default Documents;
