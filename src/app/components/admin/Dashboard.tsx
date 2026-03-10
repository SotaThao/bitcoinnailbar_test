import { Card, CardContent } from "../ui/card";
import {
  Calendar,
  DollarSign,
  Users,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  MoreHorizontal,
  Mail,
  Loader2,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Download,
  Filter,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "../ui/button";
import AdminLayout from "../AdminLayout";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "@utils/supabase/info";
import { useDashboard } from "../../hooks/useDashboard";
import { StatCard } from "./atoms/StatCard";
import { LoadingSpinner } from "./atoms/LoadingSpinner";
import { useState, useMemo, useEffect, useRef } from "react";

export default function AdminDashboard() {
  const { dashboardData, loading, refetch } = useDashboard();
  const [staffSearchQuery, setStaffSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isStaffMenuOpen, setIsStaffMenuOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "available" | "busy"
  >("all");
  const [sortBy, setSortBy] = useState<"name" | "status">(
    "name",
  );
  const menuRef = useRef<HTMLDivElement>(null);

  // ❌ REMOVED: Auto-refresh now handled by React Query
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     refetch();
  //   }, 30000);
  //   return () => clearInterval(interval);
  // }, [refetch]);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [staffSearchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsStaffMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
  }, []);

  // Handler functions
  const handleRefresh = async () => {
    setIsStaffMenuOpen(false);
    toast.loading("Refreshing staff data...", {
      id: "staff-refresh",
    });
    await refetch();
    toast.success("Staff data refreshed!", {
      id: "staff-refresh",
    });
  };

  const handleExport = () => {
    setIsStaffMenuOpen(false);

    // Create CSV content
    const headers = ["Name", "Status", "Busy Until"];
    const rows = filteredStaffStatus.map((staff) => [
      staff.name,
      staff.status,
      staff.busyUntil || "N/A",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `staff-status-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success("Staff list exported!");
  };

  const stats = [
    {
      title: "Total Revenue",
      value: dashboardData?.stats?.revenue?.value || "$0",
      subtext:
        dashboardData?.stats?.revenue?.subtext || "No data",
      icon: DollarSign,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "Active Tickets",
      value: dashboardData?.stats?.activeTickets?.value || "0",
      subtext:
        dashboardData?.stats?.activeTickets?.subtext ||
        "No active tickets",
      icon: Calendar,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Technicians",
      value: dashboardData?.stats?.staff?.value || "0/0",
      subtext:
        dashboardData?.stats?.staff?.subtext || "No staff data",
      icon: Users,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    {
      title: "Waitlist",
      value: dashboardData?.stats?.waitlist?.value || "0",
      subtext:
        dashboardData?.stats?.waitlist?.subtext ||
        "No waitlist",
      icon: Clock,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
  ];

  const recentActivity = dashboardData?.recentActivity || [];
  const staffStatus = dashboardData?.staffStatus || [];

  const filteredStaffStatus = useMemo(() => {
    let filtered = staffStatus;
    if (staffSearchQuery) {
      filtered = filtered.filter((staff) =>
        staff.name
          .toLowerCase()
          .includes(staffSearchQuery.toLowerCase()),
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (staff) => staff.status === statusFilter,
      );
    }
    if (sortBy === "name") {
      filtered = filtered.sort((a, b) =>
        a.name.localeCompare(b.name),
      );
    } else if (sortBy === "status") {
      filtered = filtered.sort((a, b) =>
        a.status.localeCompare(b.status),
      );
    }
    return filtered;
  }, [staffSearchQuery, staffStatus, statusFilter, sortBy]);

  const totalPages = Math.ceil(
    filteredStaffStatus.length / itemsPerPage,
  );
  const currentStaffStatus = filteredStaffStatus.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // ⚡ INSTANT UI: Show skeleton while loading
  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-3">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Activity Skeleton */}
            <div className="lg:col-span-2 space-y-4">
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-gray-200 rounded animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-full max-w-md bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Staff Status Skeleton */}
            <div className="space-y-4">
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              subtext={stat.subtext}
              icon={stat.icon}
              iconBg={stat.iconBg}
              iconColor={stat.iconColor}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                Recent Activity
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-gray-900"
              >
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
              {recentActivity.length > 0 ? (
                recentActivity.map((item, i) => (
                  <div
                    key={i}
                    className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold text-gray-400 w-12">
                        {item.id}
                      </span>
                      <div>
                        <h4 className="font-bold text-gray-900">
                          {item.client}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {item.service}{" "}
                          <span className="text-gray-300">
                            •
                          </span>{" "}
                          Staff: {item.staff}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">
                        {item.price}
                      </div>
                      <div
                        className={`text-xs font-medium ${
                          item.status === "completed"
                            ? "text-green-600"
                            : item.status === "confirmed"
                              ? "text-blue-600"
                              : "text-orange-500"
                        }`}
                      >
                        {item.status.charAt(0).toUpperCase() +
                          item.status.slice(1)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium">
                    No appointments yet
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Activity will appear here once appointments
                    are created
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Staff Status */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                Staff Status
              </h2>
              <div className="relative" ref={menuRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-gray-900"
                  onClick={() =>
                    setIsStaffMenuOpen(!isStaffMenuOpen)
                  }
                >
                  <MoreHorizontal className="h-5 w-5" />
                </Button>

                {/* Dropdown Menu */}
                {isStaffMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Refresh */}
                    <button
                      onClick={handleRefresh}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                    >
                      <RefreshCw className="h-4 w-4 text-gray-400" />
                      <span>Refresh Now</span>
                    </button>

                    {/* Export */}
                    <button
                      onClick={handleExport}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                    >
                      <Download className="h-4 w-4 text-gray-400" />
                      <span>Export Staff List</span>
                    </button>

                    {/* Divider */}
                    <div className="h-px bg-gray-200 my-2"></div>

                    {/* Filter */}
                    <div className="px-4 py-2">
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                        <Filter className="h-3 w-3" />
                        <span>Filter by Status</span>
                      </div>
                      <select
                        value={statusFilter}
                        onChange={(e) =>
                          setStatusFilter(
                            e.target.value as
                              | "all"
                              | "available"
                              | "busy",
                          )
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-[#FF9800] focus:border-transparent"
                      >
                        <option value="all">All Staff</option>
                        <option value="available">
                          Available Only
                        </option>
                        <option value="busy">Busy Only</option>
                      </select>
                    </div>

                    {/* Sort */}
                    <div className="px-4 py-2">
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                        <ArrowUpDown className="h-3 w-3" />
                        <span>Sort by</span>
                      </div>
                      <select
                        value={sortBy}
                        onChange={(e) =>
                          setSortBy(
                            e.target.value as "name" | "status",
                          )
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-[#FF9800] focus:border-transparent"
                      >
                        <option value="name">Name (A-Z)</option>
                        <option value="status">Status</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
              {/* Search Box */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search staff..."
                  value={staffSearchQuery}
                  onChange={(e) =>
                    setStaffSearchQuery(e.target.value)
                  }
                  className="w-full pl-10 pr-10 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9800] focus:border-transparent"
                />
                {staffSearchQuery && (
                  <button
                    onClick={() => setStaffSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Staff List */}
              <div className="space-y-4">
                {currentStaffStatus.length > 0 ? (
                  currentStaffStatus.map((staff, i) => (
                    <div
                      key={i}
                      className="flex items-start justify-between py-2"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2.5 h-2.5 rounded-full mt-1 ${staff.color}`}
                        />
                        <div>
                          <p className="font-semibold text-gray-900">
                            {staff.name}
                          </p>
                          {staff.busyUntil && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              Until {staff.busyUntil}
                            </p>
                          )}
                        </div>
                      </div>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          staff.isBusy
                            ? "bg-orange-100 text-orange-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {staff.status}
                      </span>
                    </div>
                  ))
                ) : staffSearchQuery ? (
                  <div className="text-center py-8">
                    <Search className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">
                      No staff found matching "
                      {staffSearchQuery}"
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">
                      No staff members yet
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Add staff to see their status here
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div className="text-xs text-gray-500 text-center">
                    Showing{" "}
                    {(currentPage - 1) * itemsPerPage + 1}-
                    {Math.min(
                      currentPage * itemsPerPage,
                      filteredStaffStatus.length,
                    )}{" "}
                    of {filteredStaffStatus.length} technicians
                  </div>
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-gray-900"
                      onClick={() =>
                        setCurrentPage(currentPage - 1)
                      }
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <span className="text-sm text-gray-500">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-gray-900"
                      onClick={() =>
                        setCurrentPage(currentPage + 1)
                      }
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}