/**
 * Reusable Empty State Component (Atom)
 * Used when there's no data to display
 */

import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Icon className="h-12 w-12 text-gray-300 mb-3" />
      <p className="text-gray-500 font-medium text-center">
        {title}
      </p>
      {description && (
        <p className="text-sm text-gray-400 mt-1 text-center max-w-md">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}