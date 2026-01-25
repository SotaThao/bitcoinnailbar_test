import { useLanguage } from "../context/LanguageContext";
import { Globe, Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  languageNames,
  Language,
} from "../../utils/translations";
import { cn } from "./ui/utils";

interface LanguageSwitcherProps {
  align?: "start" | "center" | "end";
}

export function LanguageSwitcher({
  align = "end",
}: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        className={cn(
          "group outline-none select-none",
          "flex items-center gap-[4px] h-6 transition-all duration-300",
          "cursor-pointer z-50",
        )}
      >
        {/* Language Indicator - Vertical Layout */}
        <div className="flex flex-col gap-[2px] items-center justify-center h-6">
          <Globe className="w-4 h-4 text-[#F7931A]" />
          <span className="font-bold text-[9px] leading-none text-[#F7931A] uppercase tracking-tight">
            {language}
          </span>
        </div>
        <ChevronDown className="w-4 h-4 text-[#F7931A] group-data-[state=open]:rotate-180 transition-transform duration-200" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="bottom"
        align={align}
        sideOffset={8}
        collisionPadding={16}
        className="bg-[#1A1A1A] border border-white/10 text-gray-200 min-w-[160px] z-[100] p-1.5 shadow-2xl rounded-xl"
      >
        {(Object.entries(languageNames) as [Language, string][])
          .filter(([code]) => code === "en" || code === "vi")
          .map(([code, name]) => (
            <DropdownMenuItem
              key={code}
              onClick={() => setLanguage(code)}
              className={cn(
                "flex items-center justify-between cursor-pointer py-2.5 px-3 rounded-lg mb-0.5 last:mb-0",
                "hover:bg-white/5 focus:bg-white/5",
                "transition-colors duration-200",
              )}
            >
              <span
                className={cn(
                  "text-sm font-bold tracking-wide uppercase",
                  language === code
                    ? "text-white"
                    : "text-gray-400",
                )}
              >
                {name}
              </span>
              {language === code && (
                <Check className="w-4 h-4 text-[#FF9800]" />
              )}
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}