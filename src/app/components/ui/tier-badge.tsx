import { Award } from "lucide-react";

interface TierBadgeProps {
  tier: string;
  className?: string;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

// Map tier names to normalized values
const normalizeTier = (tier: string): string => {
  const normalized = tier.toLowerCase().trim();
  
  // Handle VIP/Crypto variations
  if (normalized.includes("vip") || normalized.includes("crypto")) {
    return "vip-crypto";
  }
  
  // Standard tiers
  if (normalized.includes("silver")) return "silver";
  if (normalized.includes("platinum")) return "platinum";
  if (normalized.includes("gold")) return "gold";
  if (normalized.includes("diamond")) return "diamond";
  
  return normalized;
};

// Tier styling configuration
const tierStyles = {
  silver: {
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-gray-200",
  },
  platinum: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  gold: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  diamond: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  "vip-crypto": {
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    border: "border-cyan-200",
  },
};

// Size configuration
const sizeStyles = {
  sm: {
    container: "px-2 py-0.5 text-xs gap-1",
    icon: "w-2.5 h-2.5",
  },
  md: {
    container: "px-3 py-1 text-xs gap-1",
    icon: "w-3 h-3",
  },
  lg: {
    container: "px-4 py-1.5 text-sm gap-1.5",
    icon: "w-3.5 h-3.5",
  },
};

export function TierBadge({
  tier,
  className = "",
  showIcon = true,
  size = "md",
}: TierBadgeProps) {
  const normalizedTier = normalizeTier(tier);
  const style = tierStyles[normalizedTier as keyof typeof tierStyles] || tierStyles.silver;
  const sizeStyle = sizeStyles[size];

  // Display text (capitalize first letter of each word)
  const displayText = tier
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <span
      className={`inline-flex items-center ${sizeStyle.container} rounded-full font-semibold border ${style.bg} ${style.text} ${style.border} ${className}`}
    >
      {showIcon && <Award className={sizeStyle.icon} />}
      {displayText}
    </span>
  );
}
