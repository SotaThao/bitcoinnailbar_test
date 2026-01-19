import { useLanguage } from '../../context/LanguageContext';
import { Globe, Check, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../atoms/dropdown-menu";
import { languageNames, Language } from '../../../utils/translations';
import { cn } from '../atoms/utils';

interface LanguageSwitcherProps {
  align?: "start" | "center" | "end";
}

export function LanguageSwitcher({ align = "end" }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className={cn(
        "group outline-none select-none",
        "rounded-full border border-white/10 bg-black/40 backdrop-blur-md",
        "text-[#FF9800] hover:text-[#FF9800] hover:bg-black/60 hover:border-[#FF9800]/50",
        "flex items-center gap-2 h-9 px-4 transition-all duration-300",
        "data-[state=open]:bg-black/80 data-[state=open]:border-[#FF9800]",
        "cursor-pointer z-50"
      )}>
        <Globe className="w-3.5 h-3.5 group-hover:animate-pulse" />
        <span className="font-bold text-xs uppercase tracking-wider min-w-[20px] text-center">
          {language}
        </span>
        <ChevronDown className="w-3 h-3 opacity-50 group-data-[state=open]:rotate-180 transition-transform duration-200" />
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        side="bottom"
        align={align}
        sideOffset={8}
        collisionPadding={16}
        className="bg-[#1A1A1A] border border-white/10 text-gray-200 min-w-[160px] z-[100] p-1.5 shadow-2xl rounded-xl"
      >
        {(Object.entries(languageNames) as [Language, string][])
          .map(([code, name]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => setLanguage(code)}
            className={cn(
              "flex items-center justify-between cursor-pointer py-2.5 px-3 rounded-lg mb-0.5 last:mb-0",
              "hover:bg-white/5 focus:bg-white/5",
              "transition-colors duration-200"
            )}
          >
            <span className={cn(
              "text-sm font-bold tracking-wide uppercase",
              language === code ? "text-white" : "text-gray-400"
            )}>
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
