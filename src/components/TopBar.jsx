import React, { useState, useEffect } from "react";
import {
  Menu,
  ChevronDown,
  Bell,
  X,
  CheckCircle,
  Megaphone,
  ShieldCheck,
  User,
  FileText,
  DollarSign,
  Award,
  Info,
  AlertTriangle,
  XCircle,
  Clock,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";


const TopBar = ({ toggleSidebar }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/notifications');
      if (response.success) {
        setNotifications(response.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/admin/notifications/unread-count');
      // Check if response is valid JSON and has success property
      if (response && typeof response === 'object' && response.success) {
        setUnreadCount(response.count || 0);
      } else {
        // If API doesn't exist or returns invalid response, set count to 0
        setUnreadCount(0);
      }
    } catch (error) {
      // Silently handle errors - notifications feature might not be implemented
      setUnreadCount(0);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/admin/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );
      fetchUnreadCount(); // Refresh unread count
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await api.put('/admin/notifications/read-all');
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Get notification icon based on category
  const getNotificationIcon = (type, category) => {
    const iconProps = { size: 18 };
    
    switch (category) {
      case 'new_user_registration':
        return <User {...iconProps} className="text-blue-500" />;
      case 'new_investment':
        return <DollarSign {...iconProps} className="text-green-500" />;
      case 'new_kyc_submission':
        return <Award {...iconProps} className="text-purple-500" />;
      case 'new_document_upload':
        return <FileText {...iconProps} className="text-orange-500" />;
      case 'deal_published':
        return <CheckCircle {...iconProps} className="text-green-600" />;
      default:
        switch (type) {
          case 'success':
            return <CheckCircle {...iconProps} className="text-green-500" />;
          case 'error':
            return <XCircle {...iconProps} className="text-red-500" />;
          case 'warning':
            return <AlertTriangle {...iconProps} className="text-yellow-500" />;
          default:
            return <Info {...iconProps} className="text-blue-500" />;
        }
    }
  };

  // Get time ago format
  const getTimeAgo = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInHours = Math.floor((now - notificationDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes} min ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hrs ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  // Fetch data on component mount and when notifications panel opens
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showNotifications) {
      fetchNotifications();
    }
  }, [showNotifications]);
  const pageInfo = {
    "/dashboard": {
      title: "Dashboard",
      subtitle: "Manage platform activity, users & performance",
    },
    "/profile": {
      title: "User Profiles",
      subtitle: "View complete user details & verification",
    },
    "/chats": {
      title: "Chats",
      subtitle: "Manage chat conversations with users",
    },
    "/referral": {
      title: "Referral System",
      subtitle: "Track invites & reward distribution",
    },
    "/products": {
      title: "Products",
      subtitle: "Manage all products",
    },
    "/help": {
      title: "Help Center",
      subtitle: "Manage help center",
    },
  };

  const currentPage = pageInfo[location.pathname] || {
    title: "Admin Panel",
    subtitle: "Manage system operations",
  };



  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    // Clear any other admin-related data
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="w-full bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors active:bg-gray-200"
          >
            <Menu size={22} className="text-gray-700" />
          </button>

          <div className="flex flex-col">
            <h1 className="text-lg lg:text-xl font-semibold text-[#0A2742] leading-tight">
              {currentPage.title}
            </h1>
            <p className="hidden sm:block text-gray-500 text-xs lg:text-sm leading-tight">
              {currentPage.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">

          {/* NOTIFICATIONS */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 border border-gray-200 rounded-full hover:bg-gray-50 relative"
            >
              <Bell size={18} className="text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-72 sm:w-80 lg:w-[400px] bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-[80vh]">
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-800">Notifications</h2>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="max-h-60 sm:max-h-72 overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center h-20">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-20 text-gray-500">
                      <Info size={24} className="mb-2 opacity-50" />
                      <p className="text-sm">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification._id}
                        className={`p-4 border-b last:border-0 flex gap-3 items-start cursor-pointer hover:bg-gray-50 ${
                          !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                        }`}
                        onClick={() => !notification.isRead && markAsRead(notification._id)}
                      >
                        {getNotificationIcon(notification.type, notification.category)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className={`font-semibold text-gray-800 ${
                              !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                            )}
                          </div>
                          <p className={`text-sm ${
                            !notification.isRead ? 'text-gray-700' : 'text-gray-600'
                          }`}>
                            {notification.message}
                          </p>
                          {notification.relatedUserId && (
                            <p className="text-xs text-gray-400 mt-1">
                              User: {notification.relatedUserId.name} ({notification.relatedUserId.email})
                            </p>
                          )}
                          <div className="flex items-center gap-1 mt-1">
                            <Clock size={12} className="text-gray-400" />
                            <p className="text-xs text-gray-400">{getTimeAgo(notification.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {notifications.some(n => !n.isRead) && (
                  <div className="p-3 border-t">
                    <button
                      onClick={markAllAsRead}
                      className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Mark all as read
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* PROFILE DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 border border-gray-200 rounded-full px-2 pr-3 py-1 hover:bg-gray-50 transition"
            >
              <img
                src="/admin.png"
                alt="Admin"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex flex-col text-left hidden sm:block">
                <p className="text-sm font-medium text-gray-900 leading-tight">
                  Swap Street
                </p>
                <p className="text-xs text-gray-500 leading-tight">Admin Panel</p>
              </div>
              <ChevronDown size={16} className="text-gray-500" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white border border-gray-100 rounded-lg shadow-lg py-2 z-50">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  Logout
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default TopBar;
