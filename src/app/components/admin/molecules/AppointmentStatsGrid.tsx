/**
 * Appointments Stats Grid (Molecule)
 * Reusable component for displaying appointment statistics
 */

import { Card, CardContent } from "../../ui/card";

interface StatData {
  label: string;
  count: number;
  color: string;
  bg: string;
}

interface AppointmentStatsGridProps {
  appointments: any[];
}

export function AppointmentStatsGrid({
  appointments,
}: AppointmentStatsGridProps) {
  const statsData: StatData[] = [
    {
      label: "Total",
      count: appointments.length,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Pending",
      count: appointments.filter((a) => a.status === "pending")
        .length,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      label: "Confirmed",
      count: appointments.filter(
        (a) => a.status === "confirmed",
      ).length,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Completed",
      count: appointments.filter(
        (a) => a.status === "completed",
      ).length,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Cancelled",
      count: appointments.filter(
        (a) => a.status === "cancelled",
      ).length,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {statsData.map((stat) => (
        <Card
          key={stat.label}
          className="bg-white border-gray-100 shadow-sm"
        >
          <CardContent className="pt-6">
            <div className="text-center">
              <div
                className={`text-3xl font-bold ${stat.color}`}
              >
                {stat.count}
              </div>
              <div className="text-sm text-gray-500 mt-1 font-medium">
                {stat.label}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}