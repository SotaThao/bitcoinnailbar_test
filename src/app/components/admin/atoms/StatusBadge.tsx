/**
 * Reusable Status Badge Component (Atom)
 * Used for appointment and order status indicators
 */

import { Badge } from "../../ui/badge";
import {
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface StatusBadgeProps {
  status: "pending" | "confirmed" | "completed" | "cancelled";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variants = {
    pending: {
      icon: AlertCircle,
      className:
        "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-transparent",
    },
    confirmed: {
      icon: CheckCircle,
      className:
        "bg-blue-100 text-blue-800 hover:bg-blue-100 border-transparent",
    },
    completed: {
      icon: CheckCircle,
      className:
        "bg-green-100 text-green-800 hover:bg-green-100 border-transparent",
    },
    cancelled: {
      icon: XCircle,
      className:
        "bg-red-100 text-red-800 hover:bg-red-100 border-transparent",
    },
  };

  const config = variants[status] || variants.pending;
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`gap-1 ${config.className}`}
    >
      <Icon className="h-3 w-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}