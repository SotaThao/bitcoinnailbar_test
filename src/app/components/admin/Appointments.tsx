import { useState } from "react";
import { format, isSameDay } from "date-fns";
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
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { cn } from "../ui/utils";
import { useAppointments } from "../../hooks/useAppointments";
import { useServices } from "../../hooks/useServices";
import { useStaff } from "../../hooks/useStaff";
import { LoadingSpinner } from "./atoms/LoadingSpinner";
import { EmptyState } from "./atoms/EmptyState";
import { AppointmentStatsGrid } from "./molecules/AppointmentStatsGrid";
import { AppointmentCard } from "./molecules/AppointmentCard";
import {
  resolveAppointmentServices,
  calculateTotalAmount,
} from "../../lib/service-price-resolver";

export default function AdminAppointments() {
  // ✅ ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const {
    appointments,
    loading: loadingAppointments,
    updateStatus,
    refetch,
  } = useAppointments();
  const { services, loading: loadingServices } = useServices();
  const { staff, loading: loadingStaff } = useStaff();

  const [filterStatus, setFilterStatus] = useState("all");
  const [date, setDate] = useState<Date | undefined>(undefined);

  const loading =
    loadingAppointments || loadingServices || loadingStaff;

  // Filter appointments
  const filteredAppointments = appointments.filter((appt) => {
    const matchesStatus =
      filterStatus === "all" || appt.status === filterStatus;
    const matchesDate =
      !date || isSameDay(new Date(appt.appointmentTime), date);
    return matchesStatus && matchesDate;
  });

  // Sort by status priority: pending → confirmed → completed → cancelled
  const statusOrder = {
    pending: 1,
    confirmed: 2,
    completed: 3,
    cancelled: 4,
  };
  const sortedAppointments = filteredAppointments.sort(
    (a, b) => {
      const orderA =
        statusOrder[a.status as keyof typeof statusOrder] ||
        999;
      const orderB =
        statusOrder[b.status as keyof typeof statusOrder] ||
        999;
      return orderA - orderB;
    },
  );

  // ✅ NOW IT'S SAFE TO DO CONDITIONAL RENDERING
  if (loading) {
    return (
      <AdminLayout>
        <LoadingSpinner text="Loading appointments..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Stats Grid */}
        <AppointmentStatsGrid appointments={appointments} />

        {/* Filter Card */}
        <Card className="bg-white border-gray-100 shadow-sm">
          <CardHeader className="px-[24px] py-[16px] pt-[16px] pr-[24px] pb-[8px] pl-[24px]">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-gray-900">
                  All Appointments
                </CardTitle>
                <CardDescription className="text-gray-500">
                  View and manage customer bookings
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full md:w-[240px] h-10 justify-start text-left font-normal bg-white border-gray-200 text-gray-900 rounded-full",
                        !date && "text-gray-500",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? (
                        format(date, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0"
                    align="end"
                  >
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Select
                  value={filterStatus}
                  onValueChange={setFilterStatus}
                >
                  <SelectTrigger className="w-full md:w-[200px] h-10 bg-white border-gray-200 text-gray-900 !rounded-full">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200 text-gray-900">
                    <SelectItem value="all">
                      All Appointments
                    </SelectItem>
                    <SelectItem value="pending">
                      Pending
                    </SelectItem>
                    <SelectItem value="confirmed">
                      Confirmed
                    </SelectItem>
                    <SelectItem value="completed">
                      Completed
                    </SelectItem>
                    <SelectItem value="cancelled">
                      Cancelled
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Appointments List */}
        {sortedAppointments.length === 0 ? (
          <Card className="bg-white border-gray-100 shadow-sm">
            <CardContent className="py-12">
              <EmptyState
                icon={CalendarIcon}
                title="No appointments found"
                description={
                  filterStatus !== "all" || date
                    ? "Try adjusting your filters"
                    : "Appointments will appear here once customers book services"
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sortedAppointments.map((appointment) => {
              const staffMember = staff.find(
                (s) => s.id === appointment.staffId,
              );

              // Resolve services and prices using utility
              const displayServices =
                resolveAppointmentServices(
                  appointment,
                  services,
                );
              const totalAmount =
                calculateTotalAmount(displayServices);

              return (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  services={displayServices}
                  staffName={staffMember?.name}
                  totalAmount={totalAmount}
                  onUpdateStatus={updateStatus}
                />
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}