// 







// jully 11 


import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Home, User, Settings, BookOpen, LogOut, BarChart3 } from "lucide-react";
import { useAuth } from "../hooks/useAuth"; // Add this import

interface LayoutProps {
  onLogout: () => void;
}

const Layout = ({ onLogout }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // Add this to get current user

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  // Check if user has admin privileges
  const isAdmin = currentUser?.role === "Head Nurse" || currentUser?.role === "Nursing Supervisor";

  // Base navigation items for all users
  const baseNavItems = [
    { path: "/dashboard", icon: Home, label: "Dashboard" },
    { path: "/modules", icon: BookOpen, label: "Modules" },
    { path: "/profile", icon: User, label: "Profile" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  // Add admin item if user has admin privileges
  const navItems = isAdmin 
    ? [
        ...baseNavItems.slice(0, 1), // Dashboard
        { path: "/admin", icon: BarChart3, label: "Admin" }, // Insert Admin after Dashboard
        ...baseNavItems.slice(1), // Rest of the items
      ]
    : baseNavItems;

  return (
    <div className="min-h-screen bg-[#E5EDF8]">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1
                className="text-2xl font-bold text-gray-900"
                onClick={() => navigate("/dashboard")}
                style={{ cursor: "pointer" }}
              >
                PaceSim
              </h1>

              {/* Navigation Links */}
              <nav className="ml-10 flex space-x-8">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname.startsWith(item.path);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                        isActive
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}                      
                    </Link>
                  );
                })}
                {process.env.NODE_ENV === "development" && (
                  <Link
                    to="/debug"
                    className="text-xs text-red-600 hover:text-red-800"
                    title="Developer Debug Panel"
                  >
                    🐛 Debug
                  </Link>
                )}
              </nav>
            </div>

            {/* User Info & Logout */}
            <div className="flex items-center space-x-4">
              {/* Current User Display */}
              {currentUser && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{currentUser.name}</span>
                  {isAdmin && (
                    <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                      Admin
                    </span>
                  )}
                </div>
              )}

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;