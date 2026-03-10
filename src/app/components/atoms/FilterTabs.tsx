import { cn } from "@/app/components/ui/utils";

export type FilterOption = {
  id: string;
  label: string;
  count?: number;
};

interface FilterTabsProps {
  options: FilterOption[];
  selected: string;
  onSelect: (id: string) => void;
  variant?: "primary" | "secondary";
  className?: string;
}

export function FilterTabs({
  options,
  selected,
  onSelect,
  variant = "primary",
  className,
}: FilterTabsProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap justify-center gap-3",
        className
      )}
    >
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onSelect(option.id)}
          className={cn(
            "px-6 py-2 rounded-full font-medium transition-all capitalize whitespace-nowrap text-sm",
            variant === "primary" && selected === option.id
              ? "bg-[var(--color-primary,#FF9800)] text-black shadow-lg shadow-[var(--color-primary,#FF9800)]/30"
              : variant === "primary" && selected !== option.id
                ? "bg-white/10 text-gray-300 hover:bg-white/20"
                : variant === "secondary" && selected === option.id
                  ? "bg-white/20 text-white border border-white/30"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10"
          )}
        >
          {option.label}
          {option.count !== undefined && (
            <span
              className={cn(
                "ml-2 text-xs",
                selected === option.id
                  ? "text-black/70"
                  : "text-gray-500"
              )}
            >
              ({option.count})
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
