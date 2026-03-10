/**
 * Appointment Card Component (Molecule)
 * Displays a single appointment with all details and actions
 * 
 * ✅ UPDATED: Now supports Postgres snake_case fields
 * ✅ UPDATED: Added Technician Assignment UI
 */

import { useState } from "react";
import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import {
  Calendar as CalendarIcon,
  Clock,
  Phone,
  Mail,
  User,
  UserCog,
} from "lucide-react";
import { StatusBadge } from "../atoms/StatusBadge";
import { format } from "date-fns";
import { TechnicianAssignModal } from "../organisms/TechnicianAssignModal";

interface AppointmentCardProps {
  appointment: {
    id: string;
    // Support both camelCase (old) and snake_case (Postgres)
    customerName?: string;
    customer_name?: string;
    customerPhone?: string;
    customer_phone?: string;
    customerEmail?: string;
    customer_email?: string;
    appointmentTime?: string;
    appointment_time?: string;
    technician_id?: string;
    status: "pending" | "confirmed" | "completed" | "cancelled";
    notes?: string;
  };
  services: Array<{
    name: string;
    price: number;
    isUnknown?: boolean;
  }>;
  staffName?: string;
  totalAmount: number;
  onUpdateStatus: (
    appointmentId: string,
    status: string,
  ) => void;
  onAssignmentChanged?: () => void;
}

export function AppointmentCard({
  appointment,
  services,
  staffName,
  totalAmount,
  onUpdateStatus,
  onAssignmentChanged,
}: AppointmentCardProps) {
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Helper: Support both camelCase and snake_case
  const getCustomerName = () => appointment.customer_name || appointment.customerName || 'N/A';
  const getCustomerPhone = () => appointment.customer_phone || appointment.customerPhone || 'N/A';
  const getCustomerEmail = () => appointment.customer_email || appointment.customerEmail;
  const getAppointmentTime = () => appointment.appointment_time || appointment.appointmentTime || '';

  const isValidDate = (dateString: string) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  };

  const safeFormatDate = (
    dateString: string,
    formatStr: string,
  ) => {
    if (!isValidDate(dateString)) return "Invalid Date";
    return format(new Date(dateString), formatStr);
  };

  const handleAssignmentSuccess = () => {
    setShowAssignModal(false);
    if (onAssignmentChanged) {
      onAssignmentChanged();
    }
  };

  return (
    <>
      <Card className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Customer Info */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">
                    {getCustomerName()}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <Phone className="h-3 w-3" />
                    {getCustomerPhone()}
                  </div>
                  {getCustomerEmail() && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <Mail className="h-3 w-3" />
                      <a
                        href={`mailto:${getCustomerEmail()}`}
                        className="hover:underline text-blue-600"
                      >
                        {getCustomerEmail()}
                      </a>
                    </div>
                  )}
                </div>
                <StatusBadge status={appointment.status} />
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-orange-500" />
                  <span className="font-medium">
                    {safeFormatDate(
                      getAppointmentTime(),
                      "EEEE, MMMM d, yyyy",
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="font-medium">
                    {safeFormatDate(
                      getAppointmentTime(),
                      "h:mm a",
                    )}
                  </span>
                </div>
                {staffName && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-orange-500" />
                    <span className="font-medium">
                      {staffName}
                    </span>
                  </div>
                )}
                {appointment.technician_id && (
                  <div className="flex items-center gap-2">
                    <UserCog className="h-4 w-4 text-orange-500" />
                    <span className="font-medium">
                      Technician Assigned
                    </span>
                  </div>
                )}
              </div>

              {appointment.notes && (
                <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600 border border-gray-100">
                  <strong className="text-gray-900">
                    Notes:
                  </strong>{" "}
                  {appointment.notes}
                </div>
              )}

              {/* Assign Technician Button */}
              {!appointment.technician_id && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full text-blue-600 hover:bg-blue-50 justify-start px-0"
                  onClick={() => setShowAssignModal(true)}
                >
                  <UserCog className="h-4 w-4 mr-2" />
                  Assign Technician
                </Button>
              )}
            </div>

            {/* Right Column - Services & Actions */}
            <div className="space-y-4">
              <div>
                <h4 className="font-bold mb-2 text-gray-900">
                  Services
                </h4>
                <div className="space-y-2">
                  {services.length > 0 ? (
                    services.map((service, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-sm text-gray-600"
                      >
                        <span className="font-bold text-gray-900">
                          {service.name}
                        </span>
                        {service.isUnknown ? (
                          <span className="font-semibold text-gray-900 text-xs italic">
                            Price TBD
                          </span>
                        ) : (
                          <span className="font-semibold text-gray-900">
                            ${service.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-400 italic">
                      No services listed
                    </div>
                  )}
                </div>
                <div className="border-t border-gray-100 mt-2 pt-2 flex items-center justify-between font-bold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-orange-600">
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              {appointment.status === "pending" && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 shadow-none"
                    onClick={() =>
                      onUpdateStatus(appointment.id, "confirmed")
                    }
                  >
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                    onClick={() =>
                      onUpdateStatus(appointment.id, "cancelled")
                    }
                  >
                    Cancel
                  </Button>
                </div>
              )}
              {appointment.status === "confirmed" && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-orange-500 text-white hover:bg-orange-600"
                    onClick={() =>
                      onUpdateStatus(appointment.id, "completed")
                    }
                  >
                    Mark as Completed
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                    onClick={() =>
                      onUpdateStatus(appointment.id, "cancelled")
                    }
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technician Assignment Modal */}
      <TechnicianAssignModal
        open={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        appointmentId={appointment.id}
        currentTechnicianId={appointment.technician_id}
        onSuccess={handleAssignmentSuccess}
      />
    </>
  );
}