import { Badge } from "@/app/components/ui/badge";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { cn } from "@/app/components/ui/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase();

  const config = {
    pending: {
      label: "Pending",
      icon: Clock,
      className: "bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200",
    },
    used: {
      label: "Used",
      icon: CheckCircle,
      className: "bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-200",
    },
    expired: {
      label: "Expired",
      icon: XCircle,
      className: "bg-rose-50 text-rose-700 hover:bg-rose-50 border-rose-200",
    },
    pending_payment: {
      label: "Pending Payment",
      icon: Clock,
      className: "bg-slate-50 text-slate-700 hover:bg-slate-50 border-slate-200",
    },
  };

  const statusConfig = config[normalizedStatus as keyof typeof config];

  if (!statusConfig) {
    return (
      <Badge variant="outline" className={cn("bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200 rounded-full px-2.5 py-0.5", className)}>
        <span className="capitalize">{status}</span>
      </Badge>
    );
  }

  const Icon = statusConfig.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-2.5 py-0.5 gap-1.5",
        statusConfig.className,
        className
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{statusConfig.label}</span>
    </Badge>
  );
}