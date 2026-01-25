import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Gem,
  Crown,
  CreditCard,
  Calendar,
} from "lucide-react";
import imgPattern from "figma:asset/f84ad6d75c01f5865641dba32416e817dee06ff5.png";
import bitcoinIcon from "figma:asset/8504cf526757125a74c4095fde998e4033127268.png";
import { useLanguage } from "../../context/LanguageContext";

export function PromotionsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t } = useLanguage();

  const slides = [
    { id: "crypto", component: <CryptoSlide /> },
    { id: "golden", component: <GoldenHourSlide /> },
    { id: "vip", component: <VipRoyaltySlide /> },
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + slides.length) % slides.length,
    );
  };

  return (
    <section className="py-10 bg-[#0B0F19] text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_50%_50%,rgba(255,152,0,0.03),transparent_70%)] pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10 flex flex-col items-center gap-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center gap-2 text-center"
        >
          <h4 className="text-[#f7931a] text-sm tracking-[0.2em] uppercase font-serif">
            {t("promotions.header.badge")}
          </h4>
          <h2 className="text-4xl md:text-5xl font-bold text-white font-serif">
            {t("promotions.header.title")}
          </h2>
          <div className="h-1 w-24 bg-[#f7931a] rounded-full mt-2" />
        </motion.div>

        {/* Carousel Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative w-full max-w-5xl aspect-[2.5/1] min-h-[400px] rounded-2xl overflow-hidden shadow-2xl border border-gray-800 bg-gray-900 group"
        >
          {/* Slides */}
          <div className="absolute inset-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full"
              >
                {slides[currentIndex].component}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors z-20"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors z-20"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-4 bg-white"
                    : "w-3 bg-gray-600 hover:bg-gray-500"
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Slide 1: Pay With Crypto
function CryptoSlide() {
  const { t } = useLanguage();

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-r from-[#111827] to-black overflow-hidden">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-20 bg-repeat"
        style={{
          backgroundImage: `url('${imgPattern}')`,
          backgroundSize: "24px 24px",
        }}
      />
      {/* Orange Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#f7931a]/20 blur-[100px] rounded-full" />

      <div className="relative z-10 flex items-center justify-between w-full px-8 md:px-16 max-w-4xl">
        {/* Left Content */}
        <div className="flex flex-col items-start gap-6 max-w-lg">
          {/* Badge */}
          <div className="px-3 py-1 rounded border border-[#f7931a] bg-[#f7931a]/20 text-[#f7931a] text-xs font-bold tracking-widest uppercase">
            {t("promotions.crypto_slide.badge")}
          </div>

          {/* Heading */}
          <div className="flex flex-col font-serif font-bold text-4xl md:text-6xl leading-tight text-white">
            <span>
              {t("promotions.crypto_slide.title_line1")}
            </span>
            <span className="text-[#f7931a]">
              {t("promotions.crypto_slide.title_line2")}
            </span>
          </div>

          {/* Description */}
          <div className="text-lg md:text-xl text-gray-300 leading-snug">
            {t("promotions.crypto_slide.description")}{" "}
            <span className="text-white font-bold text-2xl">
              {t("promotions.crypto_slide.discount")}
            </span>{" "}
            {t("promotions.crypto_slide.description_part2")}
          </div>

          {/* Button */}
          <a
            href="https://bitcoinnailbarnew1.tiiny.site/#contact"
            target="_blank"
            rel="noreferrer"
            className="group relative px-8 py-3 rounded-full bg-gradient-to-r from-[#f7931a] to-[#ffab2e] text-black font-bold flex items-center gap-3 overflow-hidden shadow-lg shadow-orange-500/20 mt-4"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <CreditCard className="w-5 h-5" />
            <span className="relative">
              {t("promotions.crypto_slide.button")}
            </span>
          </a>
        </div>

        {/* Right Content - Bitcoin Icon */}
        <div className="hidden md:block transform rotate-12 relative z-10">
          {/* Glowing Shadow */}
          <div className="absolute inset-0 bg-[#f7931a] blur-[60px] opacity-40 rounded-full" />
          <motion.img
            src={bitcoinIcon}
            alt="Bitcoin"
            animate={{ y: [0, -20, 0] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-[75px] h-[75px] md:w-[100px] md:h-[100px] object-contain drop-shadow-[0_0_15px_rgba(247,147,26,0.5)] relative z-20"
          />
        </div>
      </div>
    </div>
  );
}

// Slide 2: Golden Hour
function GoldenHourSlide() {
  const { t } = useLanguage();

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Background Gradient */}
      <div
        className="absolute inset-0 opacity-100"
        style={{
          backgroundImage:
            "linear-gradient(158deg, rgb(153, 101, 21) 0%, rgb(212, 175, 55) 50%, rgb(249, 230, 170) 100%)",
        }}
      >
        <div className="absolute inset-0 bg-black/10" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center text-center gap-3 md:gap-4 w-full max-w-xl border-2 border-white/50 rounded-xl py-6 md:py-8 px-6 backdrop-blur-sm bg-white/10">
        {/* Heading */}
        <h2 className="font-serif font-bold text-3xl md:text-5xl text-white tracking-wide drop-shadow-md">
          {t("promotions.golden_hour_slide.title")}
        </h2>

        {/* Divider */}
        <div className="w-16 h-1 bg-white rounded-full" />

        {/* Days */}
        <div className="text-lg md:text-xl font-bold text-white tracking-wide">
          {t("promotions.golden_hour_slide.days")}
        </div>

        {/* Time */}
        <div className="flex items-center gap-2 text-white/90 text-base md:text-lg">
          <Clock className="w-4 h-4 md:w-5 md:h-5" />
          <span>{t("promotions.golden_hour_slide.time")}</span>
        </div>

        {/* Discount */}
        <div className="text-3xl md:text-4xl font-bold text-white drop-shadow-md mt-1">
          {t("promotions.golden_hour_slide.discount")}
        </div>

        {/* Button */}
        <a
          href="https://bitcoinnailbarnew1.tiiny.site/#contact"
          target="_blank"
          rel="noreferrer"
          className="mt-2 px-6 py-2.5 rounded-full bg-white text-[#996515] font-bold shadow-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm md:text-base"
        >
          <Calendar className="w-4 h-4 md:w-5 md:h-5" />
          {t("promotions.golden_hour_slide.button")}
        </a>
      </div>
    </div>
  );
}

// Slide 3: VIP Royalty
function VipRoyaltySlide() {
  const { t } = useLanguage();

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-r from-[#1e3a8a] to-black overflow-hidden">
      {/* Blue Glow */}
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#3b82f6]/20 blur-[100px] rounded-full" />

      <div className="relative z-10 flex items-center justify-between w-full px-8 md:px-16 max-w-4xl">
        {/* Left Content - Gem Icon */}
        <div className="hidden md:block opacity-80 text-[#60a5fa] transform -rotate-12">
          <Gem
            className="w-[150px] h-[150px] md:w-[200px] md:h-[200px]"
            strokeWidth={1}
          />
        </div>

        {/* Right Content */}
        <div className="flex flex-col items-end gap-6 max-w-lg text-right w-full md:w-auto">
          {/* Badge */}
          <div className="px-3 py-1 rounded border border-[#3b82f6] bg-[#3b82f6]/20 text-[#93c5fd] text-xs font-bold tracking-widest uppercase">
            {t("promotions.vip_royalty_slide.badge")}
          </div>

          {/* Heading */}
          <div className="flex flex-col font-serif font-bold text-4xl md:text-6xl leading-tight text-white">
            <div className="flex items-baseline justify-end gap-3 flex-wrap">
              <span className="text-4xl">
                {t("promotions.vip_royalty_slide.title_vip")}
              </span>
              <span className="text-[#60a5fa]">
                {t(
                  "promotions.vip_royalty_slide.title_royalty",
                )}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="text-lg md:text-xl text-gray-300 leading-snug">
            {t("promotions.vip_royalty_slide.description")}{" "}
            <span className="text-white font-bold">
              {t("promotions.vip_royalty_slide.credit")}
            </span>{" "}
            {t(
              "promotions.vip_royalty_slide.description_part2",
            )}
          </div>

          {/* Button */}
          <a
            href="#membership"
            className="group mt-4 px-8 py-3 rounded-full bg-transparent border-2 border-[#60a5fa] text-[#60a5fa] font-bold flex items-center gap-3 shadow-[0_0_20px_rgba(96,165,250,0.3)] hover:bg-[#60a5fa] hover:text-white transition-all duration-300"
          >
            <Crown className="w-5 h-5" />
            <span>
              {t("promotions.vip_royalty_slide.button")}
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}