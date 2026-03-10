import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import bitcoinLogo from "figma:asset/2e1db8bc09ca3990d8353e1709360b43f3caa800.png";
import {
  LayoutDashboard,
  Calendar,
  DollarSign,
  BarChart3,
  LogOut,
  Scissors,
  Star,
  Bitcoin,
  User,
  Bell,
  Settings,
  Scan,
  CreditCard,
  Users2,
  Shield,
  Image,
  Wallet,
  Gift,
  Database,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "./ui/avatar";
import {
  clearSession,
  getCurrentUser,
  getAuthToken,
} from "/utils/auth";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { GlobalRealtimeListener } from "./admin/GlobalRealtimeListener";
import { NotificationBell } from "./NotificationBell";
import { Toaster } from "sonner";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const handleLogout = async () => {
    try {
      const token = getAuthToken();

      // Call backend logout endpoint (fire and forget)
      if (token) {
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/auth/logout`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
              "X-Session-Token": token,
            },
          },
        ).catch((err) =>
          console.error("Logout API error:", err),
        );
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local session and redirect
      clearSession();
      navigate("/");
    }
  };

  // Main features
  const mainNavLinks = [
    {
      path: "/admin/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      path: "/admin/appointments",
      label: "Appointments",
      icon: Calendar,
    },
    {
      path: "/admin/services",
      label: "Services",
      icon: Scissors,
    },
    {
      path: "/admin/membership",
      label: "Loyalty Programs",
      icon: CreditCard,
    },
    {
      path: "/admin/staff",
      label: "Staff",
      icon: Users2,
    },
    {
      path: "/admin/payroll",
      label: "Payroll",
      icon: DollarSign,
    },
    { path: "/admin/reviews", label: "Reviews", icon: Star },
    { path: "/admin/gallery", label: "Gallery", icon: Image },
    {
      path: "/admin/analytics",
      label: "Analytics",
      icon: BarChart3,
    },
  ];

  // General section
  const generalNavLinks = [
    {
      path: "/admin/check-in",
      label: "Check-in Kiosk",
      icon: Scan,
    },
  ];

  // Owner section (Only visible to owner role)
  const ownerNavLinks = [
    {
      path: "/admin/redeem-codes",
      label: "Customers Data",
      icon: Database,
    },
    {
      path: "/admin/role-permissions",
      label: "Role & Permissions",
      icon: Shield,
    },
    {
      path: "/admin/vlinkpay-settings",
      label: "VLINKPAY Settings",
      icon: Wallet,
    },
    {
      path: "/admin/system-settings",
      label: "System Settings",
      icon: Settings,
    },
  ];

  // Combined for lookups
  const navLinks = [
    ...mainNavLinks,
    ...generalNavLinks,
    ...(currentUser?.role === "owner" ? ownerNavLinks : []),
  ];

  // Determine current page title
  const currentPage =
    navLinks.find((link) => link.path === location.pathname)
      ?.label || "Dashboard";

  return (
    <div className="min-h-screen flex bg-[#F9FAFB] text-gray-900 font-sans">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col fixed inset-y-0 z-50 border-r border-gray-100 bg-white shadow-sm">
        {/* Logo */}
        <div className="flex h-20 items-center gap-3 px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full shadow-[0_0_15px_rgba(255,152,0,0.5)]">
              <img
                src={bitcoinLogo}
                alt="Bitcoin"
                className="h-10 w-10 object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-xl tracking-tight text-gray-900 uppercase">
                BITCOIN
              </span>
              <span className="text-[10px] font-bold text-gray-500 tracking-[0.3em] uppercase">
                NAIL BAR
              </span>
            </div>
          </div>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {/* Main Features */}
          {mainNavLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;

            return (
              <Link key={link.path} to={link.path}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start gap-3 h-11 mb-1 font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-[#FFF7ED] text-[#F97316] hover:bg-[#FFF7ED] hover:text-[#F97316]"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${isActive ? "text-[#F97316]" : "text-gray-400"}`}
                  />
                  <div className="flex flex-1 items-center justify-between w-full">
                    <span>{link.label}</span>
                    {link.label === "Analytics" && (
                      <span className="text-[10px] italic text-gray-400 font-normal ml-2">
                        Coming soon
                      </span>
                    )}
                  </div>
                </Button>
              </Link>
            );
          })}

          {/* Divider */}
          <div className="py-3">
            <div className="border-t border-gray-200"></div>
          </div>

          {/* General Section */}
          {generalNavLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;

            return (
              <Link key={link.path} to={link.path}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start gap-3 h-11 mb-1 font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-[#FFF7ED] text-[#F97316] hover:bg-[#FFF7ED] hover:text-[#F97316]"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${isActive ? "text-[#F97316]" : "text-gray-400"}`}
                  />
                  <span>{link.label}</span>
                </Button>
              </Link>
            );
          })}

          {/* Owner Section Divider */}
          {currentUser?.role === "owner" && (
            <>
              <div className="py-3">
                <div className="border-t border-gray-200"></div>
              </div>
              <div className="px-3 mb-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Owner Account
                </p>
              </div>
            </>
          )}

          {/* Owner Section */}
          {currentUser?.role === "owner" &&
            ownerNavLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;

              return (
                <Link key={link.path} to={link.path}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start gap-3 h-11 mb-1 font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-[#FFF7ED] text-[#F97316] hover:bg-[#FFF7ED] hover:text-[#F97316]"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${isActive ? "text-[#F97316]" : "text-gray-400"}`}
                    />
                    <span>{link.label}</span>
                  </Button>
                </Link>
              );
            })}
        </nav>

        {/* Sign Out - Fixed at bottom */}
        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-gray-500 hover:text-red-600 hover:bg-red-50 group"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 group-hover:text-red-600 transition-colors" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        <GlobalRealtimeListener />
        {/* Desktop Header */}
        <header className="hidden md:flex h-20 items-center justify-between px-8 bg-white border-b border-gray-100 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              {/* Dynamic Icon based on page */}
              {navLinks.find(
                (l) => l.path === location.pathname,
              )?.icon ? (
                (() => {
                  const Icon = navLinks.find(
                    (l) => l.path === location.pathname,
                  )!.icon;
                  return (
                    <Icon className="h-5 w-5 text-gray-500" />
                  );
                })()
              ) : (
                <LayoutDashboard className="h-5 w-5 text-gray-500" />
              )}
            </div>
            <h1 className="text-xl font-serif font-bold text-gray-900">
              {currentPage}
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <NotificationBell />
            <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
              <div className="text-right hidden lg:block">
                <p className="text-sm font-bold text-gray-900">
                  {currentUser?.full_name || "Admin User"}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {currentUser?.role || "Administrator"}
                </p>
              </div>
              <Avatar className="h-10 w-10 border-2 border-white shadow-sm cursor-pointer">
                <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100" />
                <AvatarFallback className="bg-[#FFF7ED] text-[#F97316]">
                  {currentUser?.full_name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() || "AD"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Mobile Header */}
        <header className="sticky top-0 z-40 md:hidden flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4">
          <div className="flex items-center gap-2">
            <Bitcoin className="h-6 w-6 text-[#f7931a]" />
            <span className="font-serif font-bold text-gray-900 tracking-wider">
              ADMIN
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-[#FFF7ED] text-[#F97316]">
                {currentUser?.full_name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase() || "AD"}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Mobile Navigation */}
        <nav className="md:hidden border-b border-gray-200 bg-white px-4 py-2 overflow-x-auto">
          <div className="flex gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;

              return (
                <Link key={link.path} to={link.path}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`gap-2 whitespace-nowrap border ${
                      isActive
                        ? "bg-[#FFF7ED] text-[#F97316] border-[#F97316]/20"
                        : "text-gray-500 border-transparent hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <div className="flex items-center gap-1">
                      <span>{link.label}</span>
                      {link.label === "Analytics" && (
                        <span className="text-[10px] italic font-normal opacity-70">
                          Coming soon
                        </span>
                      )}
                    </div>
                  </Button>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>

        {/* Toast Notifications - Only in Admin Area */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: "bg-white border-gray-200 text-gray-900",
            duration: 5000,
          }}
        />
      </div>
    </div>
  );
}