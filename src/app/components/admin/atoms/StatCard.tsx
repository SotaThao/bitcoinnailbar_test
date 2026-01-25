/**
 * Reusable Stat Card Component (Atom)
 * Used in Dashboard and Appointments pages for displaying statistics
 */

import { Card, CardContent } from "../../ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtext: string;
  icon: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  valueColor?: string;
}

export function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  iconBg = "bg-gray-50",
  iconColor = "text-gray-600",
  valueColor = "text-gray-900",
}: StatCardProps) {
  return (
    <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <span className="font-semibold text-gray-700 text-sm">
            {title}
          </span>
          <div className={`p-2 rounded-lg ${iconBg}`}>
            <Icon className={`h-4 w-4 ${iconColor}`} />
          </div>
        </div>
        <div className="space-y-1">
          <h3 className={`text-3xl font-bold ${valueColor}`}>
            {value}
          </h3>
          <p className="text-xs text-gray-500 font-medium">
            {subtext}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}