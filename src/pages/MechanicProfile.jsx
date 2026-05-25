import React, { useEffect, useState } from "react";
import {
  X, Mail, Phone, Wrench, Car, FileText, Search,
  Users, Briefcase, MapPin, ShieldCheck,
  Landmark, Smartphone
} from "lucide-react";
import TopBar from "../components/TopBar.jsx";
import Sidebar from "../components/Sidebar.jsx";

/* ================= SKELETON ================= */
const MechanicSkeleton = () => (
  <div className="bg-white rounded-2xl border p-5 animate-pulse">
    <div className="flex justify-center mb-4">
      <div className="w-24 h-24 rounded-full bg-gray-200" />
    </div>
    <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
    <div className="h-10 bg-gray-200 rounded-lg mt-4" />
  </div>
);

const AdminMechanicProfile = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [selectedMechanic, setSelectedMechanic] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [mechanics, setMechanics] = useState([]);

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => { fetchMechanics(); }, []);

  const fetchMechanics = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/admin/mechanics`);
      const data = await res.json();
      if (data.success) {
        setMechanics(data.data.map(m => ({
          ...m,
          name: m.fullName,
          experience: m.skills?.experience || "N/A",
          profileImage: m.profilePhoto,
        })));
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchSingleMechanic = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/mechanics/${id}`);
      const data = await res.json();
      if (data.success) {
        setSelectedMechanic({ ...data.data, name: data.data.fullName });
        setActiveTab("overview");
      }
    } catch (err) { console.error(err); }
  };

  const updateMechanicStatus = async (id, status) => {
    const remark = window.prompt(`Enter remark for ${status}:`, "Verified by Admin");
    if (remark === null) return;

    try {
      await fetch(`${API_BASE}/api/admin/mechanics/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, remark }),
      });
      setSelectedMechanic(null);
      fetchMechanics();
    } catch (err) { console.error(err); }
  };

  const suspendMechanic = async (id) => {
    const reason = window.prompt("Enter suspension reason:", "Fake documents submitted");
    if (reason === null) return;

    try {
      const res = await fetch(`${API_BASE}/api/master/suspend/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedMechanic(null);
        fetchMechanics();
      } else {
        alert("Failed to suspend mechanic");
      }
    } catch (err) { 
      console.error(err);
      alert("Error suspending mechanic");
    }
  };

  const filteredMechanics = mechanics.filter(m => {
    const mechanicId = (m.mechanicId || m.kyc?.mechanicId || m.id || "").toString().toLowerCase();
    const keyword = search.toLowerCase();
    const name = (m.name || m.fullName || "").toString().toLowerCase();
    const phone = (m.phone || "").toString();

    return (
      name.includes(keyword) ||
      phone.includes(keyword) ||
      mechanicId.includes(keyword)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? "lg:ml-60" : ""}`}>
        <TopBar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="p-4 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Mechanic Management</h1>
              <p className="text-slate-500 text-sm">Review and manage professional mechanics</p>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by name, phone, or mechanic ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading ? (
              [...Array(8)].map((_, i) => <MechanicSkeleton key={i} />)
            ) : filteredMechanics.map((m) => (
              <div key={m.id} className="group bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                <div className={`absolute top-0 right-0 h-1.5 w-full ${m.status === 'suspended' ? 'bg-red-500' : m.status === 'approved' ? 'bg-green-500' : 'bg-amber-500'}`} />

                <div className="flex flex-col items-center">
                  <div className="relative mt-2">
                    <img src={m.profilePhoto || 'https://via.placeholder.com/150'} className="w-20 h-20 rounded-full object-cover border-4 border-slate-50 shadow-sm" alt={m.name} />
                    <span className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white ${m.status === 'suspended' ? 'bg-red-500' : m.status === 'approved' ? 'bg-green-500' : 'bg-amber-500'}`} />
                  </div>
                  <h3 className="mt-4 font-bold text-slate-800 text-lg line-clamp-1">{m.name}</h3>
                  <div className="flex items-center text-slate-500 text-sm gap-1 mb-4">
                    <MapPin size={14} /> {m.garage?.city || "Unknown"}
                  </div>
                  <p className="text-slate-400 text-xs mb-4">Mechanic ID: {m.mechanicId || m.kyc?.mechanicId || m.id || 'N/A'}</p>

                  <button
                    onClick={() => fetchSingleMechanic(m.id)}
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {selectedMechanic && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">

                {/* Modal Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-4">
                    <img src={selectedMechanic.profilePhoto} className="w-14 h-14 rounded-2xl object-cover border border-slate-200" />
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">{selectedMechanic.name}</h2>
                      <p className="text-sm text-slate-500 mt-1">Mechanic ID: {selectedMechanic.mechanicId || selectedMechanic.kyc?.mechanicId || selectedMechanic.id || 'N/A'}</p>
                      <div className="flex gap-2 items-center mt-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${selectedMechanic.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {selectedMechanic.status}
                        </span>
                        <span className="text-slate-400 text-xs">• Joined {new Date(selectedMechanic.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedMechanic(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                    <X size={20} />
                  </button>
                </div>

                {/* Tabs Navigation */}
                <div className="flex border-b border-slate-100 px-6 overflow-x-auto no-scrollbar bg-white">
                  {['overview', 'garage', 'skills', 'documents', 'payout'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-4 px-4 text-sm font-bold border-b-2 transition-all capitalize whitespace-nowrap ${activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"
                        }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Modal Body */}
                <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-white">
                  {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <SectionTitle icon={<Users size={18} />} title="Basic Details" />
                        <div className="grid gap-4">
                            <InfoCard label="Email Address" value={selectedMechanic.email || "No Email Provided"} icon={<Mail size={16} />} />
                          <InfoCard label="Phone Number" value={selectedMechanic.phone} icon={<Phone size={16} />} />
                          <InfoCard label="Mechanic ID" value={selectedMechanic.mechanicId || selectedMechanic.kyc?.mechanicId || selectedMechanic.id || "N/A"} icon={<ShieldCheck size={16} />} />
                          <InfoCard label="User ID" value={selectedMechanic.id || "N/A"} icon={<FileText size={16} />} />
                        </div>
                      </div>
                      <div className="space-y-6">
                        <SectionTitle icon={<ShieldCheck size={18} />} title={selectedMechanic.status === 'suspended' ? 'Suspension Status' : selectedMechanic.status === 'rejected' ? 'Rejection Status' : 'Verification Logs'} />
                        {selectedMechanic.status === 'suspended' ? (
                          <div className="p-5 bg-red-50 rounded-2xl border border-red-100 border-l-4 border-l-red-500">
                            <p className="text-[10px] font-bold text-red-400 uppercase mb-2">Status</p>
                            <p className="text-red-700 font-semibold text-sm">Suspended</p>
                            <p className="text-[10px] text-red-400 mt-4">Suspended On: {selectedMechanic.updatedAt ? new Date(selectedMechanic.updatedAt).toLocaleString() : 'N/A'}</p>
                          </div>
                        ) : selectedMechanic.status === 'rejected' ? (
                          <div className="p-5 bg-red-50 rounded-2xl border border-red-100 border-l-4 border-l-red-500">
                            <p className="text-[10px] font-bold text-red-400 uppercase mb-2">Status</p>
                            <p className="text-red-700 font-semibold text-sm">Rejected</p>
                            <p className="text-[10px] text-red-400 mt-4">Last Reviewed: {selectedMechanic.reviewedAt ? new Date(selectedMechanic.reviewedAt).toLocaleString() : 'N/A'}</p>
                          </div>
                        ) : (
                          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 border-l-4 border-l-blue-500">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Last Admin Remark</p>
                            <p className="text-slate-700 italic text-sm">"{selectedMechanic.adminRemark || (selectedMechanic.status === 'approved' ? 'Verified by Admin' : 'No remarks provided yet.')}"</p>
                            <p className="text-[10px] text-slate-400 mt-4">Last Reviewed: {selectedMechanic.reviewedAt ? new Date(selectedMechanic.reviewedAt).toLocaleString() : 'N/A'}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'garage' && (
                    <div className="space-y-6">
                      <SectionTitle icon={<MapPin size={18} />} title="Garage Location & Access" />
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <InfoCard label="Garage Name" value={selectedMechanic.garage?.name} />
                        <InfoCard label="City" value={selectedMechanic.garage?.city} />
                        <InfoCard label="State" value={selectedMechanic.garage?.state} />
                        <InfoCard label="Pin Code" value={selectedMechanic.garage?.pin} />
                        <div className="md:col-span-2">
                          <InfoCard label="Full Address" value={selectedMechanic.garage?.address} />
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className={`px-4 py-2 rounded-lg text-xs font-bold ${selectedMechanic.hasGarage ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600'}`}>
                          {selectedMechanic.hasGarage ? "✓ Has Physical Garage" : "✗ No Garage"}
                        </div>
                        <div className={`px-4 py-2 rounded-lg text-xs font-bold ${selectedMechanic.hasVehicle ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600'}`}>
                          {selectedMechanic.hasVehicle ? "✓ Owns Recovery Vehicle" : "✗ No Vehicle"}
                        </div>
                        <div className={`px-4 py-2 rounded-lg text-xs font-bold ${selectedMechanic.hasToolKit ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600'}`}>
                          {selectedMechanic.hasToolKit ? "✓ Has Tool Kit" : "✗ No Tool Kit"}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'skills' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <SectionTitle icon={<Wrench size={18} />} title="Service Capabilities" />
                        <div>
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-3">General Services</h4>
                          <TagList items={selectedMechanic.skills?.services} color="blue" />
                        </div>
                        <div>
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-3">Area of Expertise</h4>
                          <TagList items={selectedMechanic.skills?.expertise} color="green" />
                        </div>
                      </div>
                      <div className="space-y-6">
                        <SectionTitle icon={<Car size={18} />} title="Vehicles & Tools" />
                        <div>
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-3">Vehicles Handled</h4>
                          <TagList items={selectedMechanic.skills?.vehicles} color="purple" />
                        </div>
                        <div>
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-3">Equipment Available</h4>
                          <TagList items={selectedMechanic.skills?.equipment} color="amber" />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'documents' && (
                    <div className="space-y-8">
                      <SectionTitle icon={<FileText size={18} />} title="KYC Documents" />

                      {/* Document Numbers */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <InfoCard
                          label="Aadhaar Number"
                          value={selectedMechanic.kyc?.aadhaarNumber || "N/A"}
                        />

                        <InfoCard
                          label="PAN Number"
                          value={selectedMechanic.kyc?.panNumber || "N/A"}
                        />

                        <InfoCard
                          label="Driving License Number"
                          value={selectedMechanic.kyc?.drivingLicenseNumber || "N/A"}
                        />
                      </div>

                      {/* Status badges */}
                      <div className="flex flex-wrap gap-3">
                        <DocBadge
                          label="AADHAAR"
                          exists={!!selectedMechanic.kyc?.aadhaarImage}
                        />

                        <DocBadge
                          label="PAN"
                          exists={!!selectedMechanic.kyc?.panImage}
                        />

                        <DocBadge
                          label="LICENSE"
                          exists={!!selectedMechanic.kyc?.licenseImage}
                        />
                      </div>

                      {/* Document previews */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Aadhaar */}
                        {selectedMechanic.kyc?.aadhaarImage && (
                          <div className="space-y-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">
                              Aadhaar Card Preview
                            </p>

                            <a
                              href={selectedMechanic.kyc.aadhaarImage}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <img
                                src={selectedMechanic.kyc.aadhaarImage}
                                alt="Aadhaar"
                                className="w-full rounded-xl border-4 border-slate-50 shadow-lg hover:brightness-90 transition-all cursor-zoom-in"
                              />
                            </a>
                          </div>
                        )}

                        {/* PAN */}
                        {selectedMechanic.kyc?.panImage && (
                          <div className="space-y-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">
                              PAN Card Preview
                            </p>

                            <a
                              href={selectedMechanic.kyc.panImage}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <img
                                src={selectedMechanic.kyc.panImage}
                                alt="PAN"
                                className="w-full rounded-xl border-4 border-slate-50 shadow-lg hover:brightness-90 transition-all cursor-zoom-in"
                              />
                            </a>
                          </div>
                        )}

                        {/* Driving License */}
                        {selectedMechanic.kyc?.licenseImage && (
                          <div className="space-y-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">
                              Driving License Preview
                            </p>

                            <a
                              href={selectedMechanic.kyc.licenseImage}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <img
                                src={selectedMechanic.kyc.licenseImage}
                                alt="License"
                                className="w-full rounded-xl border-4 border-slate-50 shadow-lg hover:brightness-90 transition-all cursor-zoom-in"
                              />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'payout' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <SectionTitle icon={<Landmark size={18} />} title="Bank Account" />
                        {selectedMechanic.bank ? (
                          <div className="grid gap-4">
                            <InfoCard label="Bank Name" value={selectedMechanic.bank.bankName} />
                            <InfoCard label="Account Number" value={selectedMechanic.bank.accountNumber} />
                            <InfoCard label="IFSC Code" value={selectedMechanic.bank.ifsc} />
                          </div>
                        ) : <p className="text-slate-400 text-sm italic">Bank details not provided</p>}
                      </div>
                      <div className="space-y-6">
                        <SectionTitle icon={<Smartphone size={18} />} title="Digital Payments" />
                        <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100 flex flex-col items-center justify-center text-center">
                          <p className="text-indigo-600 text-[10px] font-bold uppercase mb-2">Primary UPI ID</p>
                          <p className="text-indigo-900 font-mono font-bold text-xl">{selectedMechanic.upi?.upiId || 'Not Setup'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 flex gap-3 justify-end bg-slate-50/50">
                  <button
                    onClick={() => suspendMechanic(selectedMechanic.id)}
                    className="px-6 py-2.5 rounded-xl border border-orange-200 text-orange-600 font-bold hover:bg-orange-50 transition-colors"
                  >
                    Suspend
                  </button>
                  <button
                    onClick={() => updateMechanicStatus(selectedMechanic.id, "rejected")}
                    className="px-6 py-2.5 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => updateMechanicStatus(selectedMechanic.id, "approved")}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-blue-600 transition-all shadow-lg"
                  >
                    Approve Mechanic
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

/* ================= HELPER COMPONENTS ================= */

const SectionTitle = ({ icon, title }) => (
  <div className="flex items-center gap-2.5 mb-2">
    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">{icon}</div>
    <h3 className="font-bold text-slate-800 text-sm uppercase tracking-tight">{title}</h3>
  </div>
);

const InfoCard = ({ label, value, icon }) => (
  <div className="p-3 bg-white border border-slate-100 rounded-xl">
    <div className="flex items-center gap-1.5 mb-0.5">
      {icon && <span className="text-slate-400">{icon}</span>}
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
    </div>
    <div className="text-slate-700 font-semibold text-sm break-all">{value || "—"}</div>
  </div>
);

const DocBadge = ({ label, exists }) => (
  <div className={`px-3 py-1 rounded-full text-[10px] font-bold border ${exists ? 'bg-green-50 text-green-600 border-green-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
    {label}: {exists ? 'PROVIDED' : 'MISSING'}
  </div>
);

const TagList = ({ items, color }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    purple: "bg-purple-50 text-purple-700 border-purple-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100"
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {items?.length > 0 ? items.map((i, idx) => (
        <span key={idx} className={`px-2.5 py-1 ${colors[color]} rounded-md text-[11px] font-bold border`}>
          {i}
        </span>
      )) : <span className="text-slate-400 italic text-xs">No data</span>}
    </div>
  );
};

export default AdminMechanicProfile;