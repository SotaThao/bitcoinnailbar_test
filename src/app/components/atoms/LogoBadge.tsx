import { motion } from "motion/react";
import { cn } from "@/app/components/ui/utils";

interface LogoBadgeProps {
  logoUrl: string;
  visible?: boolean;
  size?: "sm" | "md" | "lg";
}

/**
 * LogoBadge Component - Minimalist Watermark
 * 
 * Clean logo watermark badge - no background, no interactions
 * - Position: Bottom-right corner
 * - Sizes: sm (120px), md (160px), lg (200px)
 * - Static display only (no hover preview)
 */
export function LogoBadge({ 
  logoUrl, 
  visible = true, 
  size = "md" 
}: LogoBadgeProps) {
  if (!visible || !logoUrl) return null;

  const sizeClasses = {
    sm: "w-[120px] bottom-3 right-3",
    md: "w-[160px] bottom-4 right-4", 
    lg: "w-[200px] bottom-6 right-6",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "absolute z-[5] pointer-events-none",
        sizeClasses[size]
      )}
    >
      <img
        src={logoUrl}
        alt="Logo"
        className="w-full h-auto object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
      />
    </motion.div>
  );
}