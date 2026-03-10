import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  format,
  startOfWeek,
  endOfWeek,
  subWeeks,
} from "date-fns";
import { projectId, publicAnonKey } from "@utils/supabase/info";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import AdminLayout from "../AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  UserPlus,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Edit,
  Trash2,
  Rocket,
} from "lucide-react";
import { Input } from "../ui/input";
import { SearchInput } from "../ui/search-input";
import { SelectField } from "../ui/select-field";
import { Label } from "../ui/label";
import {
  PillTabs,
  PillTabsContent,
  PillTabsList,
  PillTabsTrigger,
} from "../ui/pill-tabs";
import { Skeleton } from "../ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import StaffDetail from "./StaffDetail";

interface StaffPayrollProps {
  defaultTab?: "staff" | "payroll";
}

export default function StaffPayroll({ defaultTab = "staff" }: StaffPayrollProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const [staff, setStaff] = useState<any[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("name-asc");
  const [selectedStaff, setSelectedStaff] = useState("");
  const [payrollData, setPayrollData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isLoadingStaff, setIsLoadingStaff] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [showComingSoonDialog, setShowComingSoonDialog] =
    useState(false);

  // View State (List vs Detail)
  const [viewMode, setViewMode] = useState<
    "list" | "detail" | "create"
  >("list");
  const [detailStaff, setDetailStaff] = useState<any>(null);

  useEffect(() => {
    const cachedStaff = localStorage.getItem(
      "bitcoin_staff_data",
    );
    if (cachedStaff) {
      try {
        const parsedStaff = JSON.parse(cachedStaff);
        setStaff(parsedStaff);
        setFilteredStaff(parsedStaff);
        if (parsedStaff.length > 0)
          setSelectedStaff(parsedStaff[0].id);
        setIsLoadingStaff(false);
      } catch (e) {
        console.error("Error parsing cached staff:", e);
      }
      loadStaff();
    } else {
      loadStaff();
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    let result = staff;

    // Filter by Search Query (Name)
    if (searchQuery.trim() !== "") {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (member) =>
          member.name.toLowerCase().includes(lowerQuery) ||
          member.phone.includes(lowerQuery),
      );
    }

    // Filter by Role
    if (roleFilter !== "all") {
      result = result.filter(
        (member) => member.role === roleFilter,
      );
    }

    // Sort Results
    result.sort((a, b) => {
      switch (sortOrder) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "role-asc":
          return a.role.localeCompare(b.role);
        case "role-desc":
          return b.role.localeCompare(a.role);
        case "commission-asc":
          return a.commissionRate - b.commissionRate;
        case "commission-desc":
          return b.commissionRate - a.commissionRate;
        default:
          return 0;
      }
    });

    setFilteredStaff(result);
  }, [searchQuery, roleFilter, sortOrder, staff]);

  // Derived unique values for filters
  const uniqueRoles = Array.from(
    new Set(staff.map((s) => s.role)),
  )
    .filter(Boolean)
    .sort();

  const loadStaff = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/staff`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        },
      );
      const data = await response.json();
      if (data.success && data.data.length > 0) {
        setStaff(data.data);
        localStorage.setItem(
          "bitcoin_staff_data",
          JSON.stringify(data.data),
        );
        if (!selectedStaff) setSelectedStaff(data.data[0].id);
      }
    } catch (error) {
      console.error("Error loading staff:", error);
      toast.error("Failed to load staff data");
    } finally {
      setIsLoadingStaff(false);
    }
  };

  const handleOpenCreate = () => {
    setDetailStaff({
      name: "",
      nickname: "",
      phone: "",
      email: "",
      role: "Nail Technician",
      hireDate: new Date().toISOString().split("T")[0],
      employmentType: "W2",
      licenseNumber: "",
      baseHourlyRate: "15.00",
      commissionRate: 0.6,
      tipSplit: "100",
      specialties: [],
      workingDays: [],
      emergencyContactName: "",
      emergencyContactPhone: "",
    });
    setViewMode("create");
  };

  const handleOpenDetail = (member: any) => {
    setDetailStaff(member);
    setViewMode("detail");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setDetailStaff(null);
  };

  const handleSaveStaff = async (staffData: any) => {
    try {
      // Normalize commission rate: Input "60" -> 0.60
      const normalizedData = {
        ...staffData,
        commissionRate:
          parseFloat(staffData.commissionRate) / 100,
      };

      const url = staffData.id
        ? `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/staff/${staffData.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/staff`;

      const method = staffData.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(normalizedData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          `Staff member ${staffData.id ? "updated" : "added"} successfully`,
        );
        loadStaff();
        handleBackToList();
      } else {
        toast.error(
          `Failed to ${staffData.id ? "update" : "add"} staff member`,
        );
      }
    } catch (error) {
      console.error("Error saving staff:", error);
      toast.error(
        "An error occurred while saving staff member",
      );
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this staff member? This action cannot be undone.",
      )
    )
      return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/staff/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        },
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Staff member deleted successfully");
        loadStaff();
        if (selectedStaff === id) setSelectedStaff("");
        handleBackToList();
      } else {
        toast.error("Failed to delete staff member");
      }
    } catch (error) {
      console.error("Error deleting staff:", error);
      toast.error("An error occurred");
    }
  };

  const calculatePayroll = async () => {
    if (!selectedStaff) {
      toast.error("Please select a staff member");
      return;
    }

    setLoading(true);

    try {
      const now = new Date();
      const targetWeek = subWeeks(now, weekOffset);
      const startDate = startOfWeek(targetWeek, {
        weekStartsOn: 1,
      }); // Monday
      const endDate = endOfWeek(targetWeek, {
        weekStartsOn: 1,
      }); // Sunday

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/payroll/calculate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            staffId: selectedStaff,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        setPayrollData(data.data);
        toast.success("Payroll calculated successfully");
      } else {
        toast.error("Failed to calculate payroll");
      }
    } catch (error) {
      console.error("Error calculating payroll:", error);
      toast.error(
        "An error occurred while calculating payroll",
      );
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const targetWeek = subWeeks(now, weekOffset);
  const startDate = startOfWeek(targetWeek, {
    weekStartsOn: 1,
  });
  const endDate = endOfWeek(targetWeek, { weekStartsOn: 1 });

  return (
    <AdminLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <PillTabs
          defaultValue={defaultTab}
          className="w-full space-y-6"
          onValueChange={(value) => {
            if (value === "payroll") {
              setShowComingSoonDialog(true);
            }
          }}
        >
          {viewMode === "list" && (
            <PillTabsList className="mt-[0px] mr-[0px] mb-[16px] ml-[0px]">
              <PillTabsTrigger value="staff">
                Staff Management
              </PillTabsTrigger>
              <PillTabsTrigger value="payroll">
                Payroll Calculator
              </PillTabsTrigger>
            </PillTabsList>
          )}

          <PillTabsContent value="staff" className="space-y-6">
            {viewMode === "list" && (
              <>
                {/* Search and Filters */}
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto flex-1">
                      {/* Name Search */}
                      <div className="w-full md:w-64">
                        <SearchInput
                          placeholder="Search by name or phone..."
                          value={searchQuery}
                          onChange={(e) =>
                            setSearchQuery(e.target.value)
                          }
                        />
                      </div>

                      {/* Role Filter */}
                      <div className="w-full md:w-48">
                        <SelectField
                          value={roleFilter}
                          onValueChange={setRoleFilter}
                          placeholder="All Roles"
                        >
                          <SelectItem value="all">
                            All Roles
                          </SelectItem>
                          {uniqueRoles.map((role: any) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectField>
                      </div>

                      {/* Sort Order */}
                      <div className="w-full md:w-48">
                        <SelectField
                          value={sortOrder}
                          onValueChange={setSortOrder}
                          placeholder="Sort By"
                        >
                          <SelectItem value="name-asc">
                            Name (A-Z)
                          </SelectItem>
                          <SelectItem value="name-desc">
                            Name (Z-A)
                          </SelectItem>
                          <SelectItem value="role-asc">
                            Role (A-Z)
                          </SelectItem>
                          <SelectItem value="role-desc">
                            Role (Z-A)
                          </SelectItem>
                          <SelectItem value="commission-asc">
                            Commission (Low-High)
                          </SelectItem>
                          <SelectItem value="commission-desc">
                            Commission (High-Low)
                          </SelectItem>
                        </SelectField>
                      </div>
                    </div>

                    <Button
                      onClick={handleOpenCreate}
                      className="bg-orange-500 text-white hover:bg-orange-600 font-bold shadow-sm whitespace-nowrap w-full md:w-auto"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Staff
                    </Button>
                  </div>
                </div>

                {/* Staff Overview */}
                {isLoadingStaff ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Card
                        key={i}
                        className="bg-white border border-gray-200 shadow-sm"
                      >
                        <CardHeader>
                          <Skeleton className="h-6 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {filteredStaff.length > 0 ? (
                        filteredStaff
                          .slice(
                            (currentPage - 1) * itemsPerPage,
                            currentPage * itemsPerPage,
                          )
                          .map((member) => (
                            <Card
                              key={member.id}
                              className={`bg-white border backdrop-blur-sm cursor-pointer transition-all relative ${selectedStaff === member.id ? "border-orange-500 shadow-md" : "border-gray-200 hover:border-orange-300"}`}
                              onClick={() =>
                                handleOpenDetail(member)
                              }
                            >
                              <div className="absolute top-2 right-2 z-10">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                                      onClick={(e) =>
                                        e.stopPropagation()
                                      }
                                    >
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align="end"
                                    className="bg-white border-gray-100 shadow-lg"
                                  >
                                    <DropdownMenuItem
                                      className="cursor-pointer text-gray-700 focus:bg-gray-50"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenDetail(
                                          member,
                                        );
                                      }}
                                    >
                                      <Edit className="w-4 h-4 mr-2" />{" "}
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-gray-100" />
                                    <DropdownMenuItem
                                      className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteStaff(
                                          member.id,
                                        );
                                      }}
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />{" "}
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>

                              <CardHeader>
                                <CardTitle className="text-gray-900 pr-6">
                                  {member.name}
                                </CardTitle>
                                <CardDescription className="text-gray-500">
                                  {member.role}
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-2 text-sm text-gray-600">
                                  <p>
                                    <strong>
                                      Commission Rate:
                                    </strong>{" "}
                                    {(
                                      member.commissionRate *
                                      100
                                    ).toFixed(0)}
                                    %
                                  </p>
                                  <p>
                                    <strong>Phone:</strong>{" "}
                                    {member.phone}
                                  </p>
                                  <p>
                                    <strong>Email:</strong>{" "}
                                    {member.email}
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                      ) : (
                        <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
                          <Search className="w-12 h-12 text-gray-300 mb-4" />
                          <p className="text-lg font-medium text-gray-900">
                            No staff found
                          </p>
                          <p>Try adjusting your search query</p>
                        </div>
                      )}
                    </div>

                    {/* Pagination Controls */}
                    {filteredStaff.length > itemsPerPage && (
                      <div className="flex items-center justify-center space-x-4 pt-4">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            setCurrentPage((p) =>
                              Math.max(1, p - 1),
                            )
                          }
                          disabled={currentPage === 1}
                          className="h-8 w-8"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="text-sm font-medium text-gray-600">
                          Page {currentPage} of{" "}
                          {Math.ceil(
                            filteredStaff.length / itemsPerPage,
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            setCurrentPage((p) =>
                              Math.min(
                                Math.ceil(
                                  filteredStaff.length /
                                    itemsPerPage,
                                ),
                                p + 1,
                              ),
                            )
                          }
                          disabled={
                            currentPage ===
                            Math.ceil(
                              filteredStaff.length /
                                itemsPerPage,
                            )
                          }
                          className="h-8 w-8"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Detail View */}
            {(viewMode === "detail" || viewMode === "create") &&
              detailStaff && (
                <StaffDetail
                  staff={detailStaff}
                  isCreating={viewMode === "create"}
                  onBack={handleBackToList}
                  onSave={handleSaveStaff}
                  onDelete={handleDeleteStaff}
                />
              )}
          </PillTabsContent>

          <PillTabsContent
            value="payroll"
            className="space-y-8"
          >
            {/* Payroll Calculator */}
            <Card className="bg-white border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900">
                  Calculate Payroll
                </CardTitle>
                <CardDescription className="text-gray-500">
                  Select staff member and week to calculate
                  earnings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="w-full md:w-1/3 space-y-2">
                    <Label
                      htmlFor="staffSelect"
                      className="text-gray-700"
                    >
                      Select Staff
                    </Label>
                    <Select
                      value={selectedStaff}
                      onValueChange={setSelectedStaff}
                    >
                      <SelectTrigger
                        id="staffSelect"
                        className="bg-white border-gray-200 text-gray-900"
                      >
                        <SelectValue placeholder="Select staff member" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-100 text-gray-900">
                        {staff.map((member) => (
                          <SelectItem
                            key={member.id}
                            value={member.id}
                          >
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-full md:w-1/3 space-y-2">
                    <Label className="text-gray-700">
                      Pay Period
                    </Label>
                    <div className="flex items-center justify-between border border-gray-200 rounded-md px-3 py-2 bg-white">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setWeekOffset((prev) => prev + 1)
                        }
                        className="h-6 w-6 p-0"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-medium">
                        {format(startDate, "MMM d")} -{" "}
                        {format(endDate, "MMM d, yyyy")}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setWeekOffset((prev) => prev - 1)
                        }
                        className="h-6 w-6 p-0"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="w-full md:w-1/3">
                    <Button
                      onClick={calculatePayroll}
                      disabled={loading || !selectedStaff}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold"
                    >
                      {loading
                        ? "Calculating..."
                        : "Calculate Payroll"}
                    </Button>
                  </div>
                </div>

                {/* Payroll Results */}
                {payrollData && (
                  <div className="mt-8 space-y-6 border-t pt-6 border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card className="bg-green-50 border-green-100">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-green-700">
                            Total Earnings
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-green-800">
                            $
                            {payrollData.totalEarnings.toFixed(
                              2,
                            )}
                          </div>
                          <p className="text-xs text-green-600 mt-1">
                            Gross Pay
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="bg-blue-50 border-blue-100">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-blue-700">
                            Commission
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-blue-800">
                            $
                            {payrollData.commissionAmount.toFixed(
                              2,
                            )}
                          </div>
                          <p className="text-xs text-blue-600 mt-1">
                            Based on{" "}
                            {payrollData.commissionableSales.toFixed(
                              2,
                            )}{" "}
                            sales
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="bg-purple-50 border-purple-100">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-purple-700">
                            Hourly Pay
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-purple-800">
                            ${payrollData.hourlyPay.toFixed(2)}
                          </div>
                          <p className="text-xs text-purple-600 mt-1">
                            {payrollData.hoursWorked} hours @ $
                            {payrollData.hourlyRate}/hr
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="bg-yellow-50 border-yellow-100">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-yellow-700">
                            Tips
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-yellow-800">
                            ${payrollData.tipsAmount.toFixed(2)}
                          </div>
                          <p className="text-xs text-yellow-600 mt-1">
                            {payrollData.tipSplit}% of total
                            tips
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Breakdown Chart */}
                    <div className="bg-white p-4 rounded-xl border border-gray-100">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Earnings Breakdown
                      </h3>
                      <div className="h-[300px]">
                        <ResponsiveContainer
                          width="100%"
                          height="100%"
                        >
                          <BarChart
                            data={[
                              {
                                name: "Commission",
                                amount:
                                  payrollData.commissionAmount,
                              },
                              {
                                name: "Hourly",
                                amount: payrollData.hourlyPay,
                              },
                              {
                                name: "Tips",
                                amount: payrollData.tipsAmount,
                              },
                            ]}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                              stroke="#E5E7EB"
                            />
                            <XAxis
                              dataKey="name"
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis
                              prefix="$"
                              axisLine={false}
                              tickLine={false}
                            />
                            <Tooltip
                              formatter={(value: any) => [
                                `$${value.toFixed(2)}`,
                                "Amount",
                              ]}
                              cursor={{ fill: "#F9FAFB" }}
                              contentStyle={{
                                borderRadius: "8px",
                                border: "none",
                                boxShadow:
                                  "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                              }}
                            />
                            <Bar
                              dataKey="amount"
                              fill="#F97316"
                              radius={[4, 4, 0, 0]}
                              barSize={50}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </PillTabsContent>
        </PillTabs>
      </div>

      {/* Coming Soon Dialog */}
      <Dialog
        open={showComingSoonDialog}
        onOpenChange={setShowComingSoonDialog}
      >
        <DialogContent className="sm:max-w-md bg-white p-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
          {/* Decorative top bar */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500" />

          <div className="p-8 flex flex-col items-center text-center space-y-4 pt-12">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-2 animate-pulse ring-8 ring-orange-50/50">
              <Rocket className="w-10 h-10 text-orange-500 fill-orange-500/20" />
            </div>

            <div className="space-y-2">
              <DialogTitle className="text-2xl font-bold text-gray-900 tracking-tight">
                Payroll Calculator is Coming!
              </DialogTitle>

              <DialogDescription className="text-gray-500 text-base max-w-[300px] mx-auto leading-relaxed">
                We're building a powerful tool to automate
                commissions, tips, and hourly pay. Check back
                soon for the launch!
              </DialogDescription>
            </div>
          </div>

          <div className="bg-gray-50/50 p-6 flex justify-center border-t border-gray-100">
            <Button
              onClick={() => setShowComingSoonDialog(false)}
              className="bg-gray-900 hover:bg-gray-800 text-white font-semibold px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}