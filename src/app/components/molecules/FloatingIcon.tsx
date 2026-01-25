import { motion } from "motion/react";
import { ReactNode } from "react";

interface FloatingIconProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  yOffset?: number;
  className?: string;
  glowColor?: string;
}

export function FloatingIcon({
  children,
  delay = 0,
  duration = 3,
  yOffset = 20,
  className = "",
  glowColor = "rgba(255, 152, 0, 0.4)",
}: FloatingIconProps) {
  return (
    <motion.div
      className={`absolute ${className}`}
      initial={{ y: 0 }}
      animate={{
        y: [0, -yOffset, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
      style={{
        filter: `drop-shadow(0 0 20px ${glowColor})`,
      }}
    >
      {children}
    </motion.div>
  );
}