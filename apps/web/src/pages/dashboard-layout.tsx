import { Outlet, Link, useNavigate } from "react-router-dom";
import { authStore } from "../stores/auth.store";

/**
 * Dashboard layout component
 *
 * Wraps authenticated pages with navigation
 */
export function DashboardLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    authStore.logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-gray-900">无人机维保账本系统</h1>
              <nav className="flex space-x-4">
                <Link
                  to="/"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  首页
                </Link>
                <Link
                  to="/fleets"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  机队管理
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {authStore.user?.fullName || authStore.user?.username}
              </span>
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-gray-900 text-sm font-medium"
              >
                退出
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
