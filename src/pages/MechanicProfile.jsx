import React, { useEffect, useState } from "react";
import {
    X,
    Mail,
    Phone,
    Calendar,
    Wrench,
    Car,
    CreditCard,
    FileText,
    Search,
    Users
} from "lucide-react";
import TopBar from "../components/TopBar.jsx";
import Sidebar from "../components/Sidebar.jsx";

/* ================= DUMMY MECHANIC DATA ================= */

const DUMMY_MECHANICS = [
    {
        id: 1,
        name: "Vivek Sharma",
        email: "vivek054@gmail.com",
        phone: "+91 9841626813",
        dob: "12/08/1996",
        gender: "Male",
        experience: "5+ Years",
        profileImage: "https://i.pravatar.cc/150?img=12",
        skills: ["General Service", "Brake & Suspension", "Tyre Service"],
        vehicles: ["Bike / Scooter", "Car", "3-Wheeler"],
        kyc: { type: "Aadhaar Card", number: "XXXX-XXXX-1234" },
        bank: { bankName: "HDFC Bank", account: "XXXX-4567", ifsc: "HDFC0001" },
    },
];

/* ================= SKELETON CARD ================= */

const MechanicSkeleton = () => (
    <div className="bg-white rounded-2xl border p-5 animate-pulse">
        <div className="flex justify-center mb-4">
            <div className="w-24 h-24 rounded-full bg-gray-200" />
        </div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
        <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto" />
        <div className="h-9 bg-gray-200 rounded mt-4" />
    </div>
);

const AdminMechanicProfile = () => {
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
    const [selectedMechanic, setSelectedMechanic] = useState(null);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [genderFilter, setGenderFilter] = useState("all");
    const [experienceFilter, setExperienceFilter] = useState("all");

    /* SIMULATE LOADING */
    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 1200);
        return () => clearTimeout(t);
    }, []);

    /* FILTER LOGIC */
    const filteredMechanics = DUMMY_MECHANICS.filter((m) => {
        const keyword = search.toLowerCase();

        const matchesSearch =
            m.name.toLowerCase().includes(keyword) ||
            m.email.toLowerCase().includes(keyword) ||
            m.phone.includes(keyword);

        const matchesGender =
            genderFilter === "all" || m.gender === genderFilter;

        const matchesExperience =
            experienceFilter === "all" || m.experience === experienceFilter;

        return matchesSearch && matchesGender && matchesExperience;
    });

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

            <div className={`flex-1 flex flex-col ${sidebarOpen ? "lg:ml-60" : ""}`}>
                <TopBar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

                <main className="flex-1 p-6 overflow-auto">
                    {/* HEADER */}
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">
                        Mechanic Profiles
                    </h1>

                    {/* SEARCH & FILTER */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
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

                        <select
                            value={experienceFilter}
                            onChange={(e) => setExperienceFilter(e.target.value)}
                            className="px-3 py-2 rounded-lg border focus:ring-2 focus:ring-red-500"
                        >
                            <option value="all">All Experience</option>
                            <option value="1-2 Years">1–2 Years</option>
                            <option value="3-5 Years">3–5 Years</option>
                            <option value="5+ Years">5+ Years</option>
                        </select>
                    </div>

                    {/* GRID */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {loading ? (
                            [...Array(6)].map((_, i) => <MechanicSkeleton key={i} />)
                        ) : filteredMechanics.length === 0 ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
                                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
                                    <Users size={32} className="text-red-600" />
                                </div>

                                <p className="text-lg font-semibold text-gray-800">
                                    No Mechanics Found
                                </p>

                                <p className="text-sm text-gray-500 mt-1 max-w-sm">
                                    We couldn’t find any mechanics matching your search or filter criteria.
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
                            filteredMechanics.map((m) => (
                                <div key={m.id} className="bg-white rounded-2xl shadow-sm border p-5">
                                    <div className="flex justify-center">
                                        <img
                                            src={m.profileImage}
                                            className="w-24 h-24 rounded-full border object-cover"
                                            alt="profile"
                                        />
                                    </div>

                                    <h3 className="text-center font-semibold text-gray-800 mt-3">
                                        {m.name}
                                    </h3>

                                    <p className="text-center text-sm text-gray-500">
                                        {m.email}
                                    </p>

                                    <button
                                        onClick={() => setSelectedMechanic(m)}
                                        className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium"
                                    >
                                        View Profile
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* ================= MODAL ================= */}
                    {selectedMechanic && (
                        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                            <div className="bg-white max-w-3xl w-full rounded-2xl shadow-xl overflow-y-auto max-h-[90vh] relative">
                                <button
                                    className="absolute top-4 right-4 text-gray-500 hover:text-red-600"
                                    onClick={() => setSelectedMechanic(null)}
                                >
                                    <X />
                                </button>

                                <div className="p-6 border-b text-center">
                                    <img
                                        src={selectedMechanic.profileImage}
                                        className="w-32 h-32 rounded-full border-4 border-red-600 mx-auto"
                                        alt="profile"
                                    />
                                    <h2 className="text-xl font-bold mt-3">{selectedMechanic.name}</h2>
                                </div>

                                <Section title="Personal Details">
                                    <Info label="Email" icon={Mail} value={selectedMechanic.email} />
                                    <Info label="Mobile" icon={Phone} value={selectedMechanic.phone} />
                                    <Info label="DOB" icon={Calendar} value={selectedMechanic.dob} />
                                    <Info label="Gender" value={selectedMechanic.gender} />
                                </Section>

                                <Section title="Skills & Expertise" icon={Wrench}>
                                    <TagList items={selectedMechanic.skills} />
                                </Section>

                                <Section title="Vehicles / Equipment" icon={Car}>
                                    <TagList items={selectedMechanic.vehicles} />
                                </Section>

                                <Section title="KYC & Bank" icon={FileText}>
                                    <p className="text-sm">{selectedMechanic.kyc.type}</p>
                                    <p className="text-sm">Bank: {selectedMechanic.bank.bankName}</p>
                                </Section>

                                <div className="p-4 border-t">
                                    <button
                                        onClick={() => setSelectedMechanic(null)}
                                        className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold"
                                    >
                                        Close Profile
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

const Section = ({ title, icon: Icon, children }) => (
    <div className="p-6 border-b">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            {Icon && <Icon size={18} className="text-red-600" />}
            {title}
        </h3>
        <div className="space-y-2">{children}</div>
    </div>
);

const Info = ({ label, value, icon: Icon }) => (
    <div>
        <label className="text-xs text-gray-500">{label}</label>
        <div className="flex items-center gap-2 border rounded-xl px-4 py-3">
            {Icon && <Icon size={16} className="text-gray-400" />}
            <span className="text-sm">{value}</span>
        </div>
    </div>
);

const TagList = ({ items }) => (
    <div className="flex flex-wrap gap-2">
        {items.map((i, idx) => (
            <span
                key={idx}
                className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-medium"
            >
                {i}
            </span>
        ))}
    </div>
);

export default AdminMechanicProfile;
