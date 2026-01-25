import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "./ui/utils";

interface PrimaryButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  size?: "xs" | "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

export function PrimaryButton({
  children,
  size = "md",
  fullWidth = false,
  loading = false,
  startIcon,
  endIcon,
  className,
  disabled,
  ...props
}: PrimaryButtonProps) {
  const sizeClasses = {
    xs: "h-6 px-3 text-xs", // H: 24px
    sm: "h-8 px-4 text-sm", // H: 32px
    md: "h-10 px-5 text-sm", // H: 40px
    lg: "h-12 px-8 text-base", // H: 48px
  };

  return (
    <button
      className={cn(
        // Base styles
        "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-300",
        // Primary colors - Orange background with white text
        "bg-primary text-white shadow-lg shadow-[#FF9800]/20",
        // Hover & Active states
        "hover:shadow-[#FF9800]/40 hover:scale-105 hover:brightness-90",
        "active:scale-95 active:brightness-90",
        // Focus states
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        // Disabled state
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary",
        // Size
        sizeClasses[size],
        // Full width
        fullWidth && "w-full",
        // Custom className
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : null}

      {children}

      {!loading && endIcon && (
        <span className="flex-shrink-0">{endIcon}</span>
      )}
    </button>
  );
}