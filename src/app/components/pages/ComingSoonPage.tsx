import React from "react";
import PublicLayout from "../PublicLayout";
import { Button } from "../ui/button";
import { AnimatedButton } from "../ui/animated-button";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { Clock, Sparkles } from "lucide-react";
import bitcoinLogo from "figma:asset/2e1db8bc09ca3990d8353e1709360b43f3caa800.png";

export default function ComingSoonPage() {
  const { t } = useLanguage();

  return (
    <PublicLayout>
      <div className="relative min-h-screen flex items-center justify-center bg-[#0B0F19] overflow-hidden text-white pt-20">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-[#0B0F19] to-[#0B0F19]"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#FF9800]/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#FF9800]/20 to-transparent"></div>

        <div className="container px-4 relative z-10 text-center">
          {/* Icon/Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 rounded-full bg-black/50 border border-[#FF9800]/20 flex items-center justify-center shadow-[0_0_30px_rgba(255,152,0,0.15)] relative">
              <div className="absolute inset-0 rounded-full border border-[#FF9800]/20 animate-ping opacity-20"></div>
              <Sparkles className="w-10 h-10 text-[#FF9800]" />
            </div>
          </div>

          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF9800]/10 border border-[#FF9800]/20 text-[#FF9800] text-xs font-bold tracking-[0.2em] uppercase">
              <Clock className="w-3 h-3" />
              {t("coming_soon.status")}
            </div>

            <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-wide">
              {t("coming_soon.title_1")} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF9800] to-[#F57C00]">
                {t("coming_soon.title_2")}
              </span>
            </h1>

            <p className="text-gray-400 text-lg md:text-xl leading-relaxed font-light">
              {t("coming_soon.desc")}
            </p>

            <div className="pt-8 flex justify-center gap-4">
              <Button
                asChild
                className="bg-[#FF9800] hover:bg-[#F57C00] text-white rounded-full px-8 h-12 text-base font-bold shadow-lg shadow-[#FF9800]/20"
              >
                <Link
                  to="/"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  {t("coming_soon.return_home")}
                </Link>
              </Button>

              <AnimatedButton
                to="/booking"
                className="rounded-full px-8 h-12 text-base font-bold"
              >
                {t("coming_soon.book_now")}
              </AnimatedButton>
            </div>
          </div>

          {/* Footer decoration */}
          <div className="mt-20 flex items-center justify-center gap-8 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
            <img
              src={bitcoinLogo}
              alt="Bitcoin"
              className="h-12 w-12 opacity-50"
            />
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}