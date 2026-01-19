  import { useNavigate, useLocation } from "react-router-dom";
  import {
    UserCircle,
    CreditCard,
    Search, // Documents
    LifeBuoy,
    Package,
    ImageIcon,
    MessageCircle,
  } from "lucide-react";


  const Sidebar = ({ isOpen, toggleSidebar }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const menu = [
      {
        section: "Main Menu",
        items: [
          { label: "User Profiles", icon: UserCircle, path: "/profile" },
          { label: "Referral Transaction", icon: CreditCard, path: "/referral" },
          { label: "Products", icon: Package, path: "/products" },
        ],
      },
      {
        section: "Management",
        items: [
          { label: "Add Banners", icon: ImageIcon, path: "/add-banner" },
          { label: "Chats", icon: MessageCircle, path: "/chats" },
          
        ],
      },
      {
        section: "Support",
        items: [
          { label: "Help Center", icon: LifeBuoy, path: "/help" },

          ],
      },
    ];

    const handleNavigation = (path) => {
      navigate(path);
      toggleSidebar();
    };

    return (
      <div
        className={`fixed top-0 left-0 h-full w-60 sm:w-64 lg:w-60 bg-white shadow-xl border-r border-gray-200 transform transition-all duration-300 z-50
        ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b">
          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <h1 className="text-md font-bold text-[#0A2742]">Swap Street</h1>
              <p className="text-[10px] text-gray-500 -mt-1">Admin Panel</p>
            </div>
          </div>
          <button 
            className="text-gray-600 text-lg hover:text-gray-900 hover:bg-gray-100 p-1 rounded transition-colors lg:hidden" 
            onClick={toggleSidebar}
          >
            ✕
          </button>
        </div>
        <div className="px-4 py-3 overflow-y-auto h-[calc(100%-70px)]">
          {menu.map((section, index) => (
            <div key={index} className="mb-5">
              <p className="uppercase text-[11px] text-gray-400 font-semibold mb-2">
                {section.section}
              </p>
              <div className="space-y-[2px]">
                {section.items.map((item, i) => {
                  const active = location.pathname === item.path;
                  return (
                    <button
                      key={i}
                      onClick={() => handleNavigation(item.path)}
                      className={`flex items-center gap-3 w-full px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm transition-all 
                        ${
                          active
                            ? "bg-[#0A2742] text-white font-medium shadow-sm"
                            : "text-gray-700 hover:bg-[#0A2742]/10 hover:text-[#0A2742]"
                        }
                      `}
                    >
                      <item.icon size={16} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  export default Sidebar;
