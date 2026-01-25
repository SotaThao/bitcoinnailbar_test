import { Link } from "react-router-dom";

interface PromotionCardProps {
  title: string;
  subtitle: string;
  desc: string;
  btnText: string;
  link: string;
  badge?: string;
}

export function PromotionCard({
  title,
  subtitle,
  desc,
  btnText,
  link,
  badge,
}: PromotionCardProps) {
  return (
    <div
      className={`bg-[#11141D] rounded-xl p-8 border border-white/5 hover:border-[#FF9800]/50 transition-all duration-300 group text-center flex flex-col items-center ${badge ? "relative overflow-hidden" : ""}`}
    >
      {badge && (
        <div className="absolute top-0 right-0 bg-[#FF9800] text-black text-[10px] font-bold px-3 py-1 rounded-bl-lg">
          {badge}
        </div>
      )}
      <h3 className="text-4xl md:text-5xl font-bold text-[#FF9800] mb-2">
        {title}
      </h3>
      <p className="text-white font-bold tracking-wider uppercase mb-4 text-sm">
        {subtitle}
      </p>
      <p className="text-gray-400 text-sm mb-8 leading-relaxed max-w-xs">
        {desc}
      </p>
      <Link
        to={link}
        className="mt-auto inline-flex items-center text-[#FF9800] font-bold text-xs tracking-wider uppercase hover:text-[#FFB74D] transition-colors"
      >
        {btnText} <span className="ml-2">→</span>
      </Link>
    </div>
  );
}