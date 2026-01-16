import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { Plane, LayoutDashboard, Wrench, ClipboardList, Package, BarChart3, Settings, LogOut, User, Menu, X, Warehouse } from "lucide-react";
import { Button } from "../components/ui/button";
import { authStore } from "../stores/auth.store";
import { useState } from "react";

/**
 * Dashboard layout component with navigation
 */
export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    authStore.logout();
    navigate("/login");
  };

  const navItems = [
    { path: "/", label: "首页", icon: LayoutDashboard },
    { type: "divider", label: "资产配置" },
    { path: "/fleets", label: "机队管理", icon: Plane },
    { path: "/aircraft", label: "飞机管理", icon: Plane },
    { path: "/components", label: "零部件管理", icon: Package },
    { path: "/inventory", label: "库存管理", icon: Warehouse },
    { type: "divider", label: "维保管理" },
    { path: "/maintenance/schedules", label: "维保计划", icon: ClipboardList },
    { path: "/work-orders", label: "工单管理", icon: Wrench },
    { type: "divider", label: "其他" },
    { path: "/flight-logs", label: "飞行记录", icon: ClipboardList },
    { path: "/reports", label: "数据看板", icon: BarChart3 },
    { path: "/settings", label: "系统设置", icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div className="flex items-center space-x-2">
              <Plane className="w-5 h-5 text-primary" />
              <span className="font-semibold">维保账本</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              {authStore.user?.fullName || authStore.user?.username}
            </span>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative top-0 left-0 z-40 h-screen w-64 bg-white border-r flex-shrink-0
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b">
          <Plane className="w-6 h-6 text-primary mr-2" />
          <div>
            <h1 className="font-bold text-slate-900">维保账本</h1>
            <p className="text-xs text-muted-foreground">Drone Maintenance</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item, index) => {
            if (item.type === "divider") {
              return (
                <div key={`divider-${index}`} className="pt-4 pb-2">
                  <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {item.label}
                  </p>
                </div>
              );
            }

            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium
                  transition-colors
                  ${isActive(item.path)
                    ? "bg-primary text-primary-foreground"
                    : "text-slate-700 hover:bg-slate-100"
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t">
          <div className="flex items-center space-x-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {authStore.user?.fullName || authStore.user?.username}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {typeof authStore.user?.role === "string" ? authStore.user.role : "User"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start px-3 mt-2"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-3" />
            退出登录
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Header */}
        <header className="hidden lg:flex h-16 items-center justify-between px-8 bg-white border-b">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-slate-900">
              {navItems.find(item => item.path === location.pathname)?.label || "首页"}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              帮助
            </Button>
            <div className="h-8 w-px bg-border" />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm text-slate-700">
                {authStore.user?.fullName || authStore.user?.username}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
