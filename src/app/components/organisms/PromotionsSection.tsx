import { useState, useEffect } from "react";
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
import { projectId, publicAnonKey } from "/utils/supabase/info";

interface PromotionLanguageData {
  badge?: string;
  title: string;
  subtitle?: string;
  discount: string;
  description: string;
  days?: string;
  time?: string;
  buttonText: string;
  buttonLink: string;
  backgroundImage?: string;
  iconImage?: string;
  videoUrl?: string;
}

interface Promotion {
  id: string;
  type: "crypto" | "golden-hour" | "vip-royalty";
  enabled: boolean;
  featured: boolean;
  vi: PromotionLanguageData;
  en: PromotionLanguageData;
}

export function PromotionsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  // Fetch promotions from admin settings
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/settings/promotions`,
          { headers: { Authorization: `Bearer ${publicAnonKey}` } }
        );

        const result = await response.json();

        if (result.success && result.data) {
          const promotionsData = result.data.promotions || [];
          
          // Sort newest first
          const sortedPromotions = [...promotionsData].sort((a: Promotion, b: Promotion) => {
            const aNum = Number(a.id);
            const bNum = Number(b.id);
            const aIsNumeric = !isNaN(aNum);
            const bIsNumeric = !isNaN(bNum);
            if (aIsNumeric && bIsNumeric) return bNum - aNum;
            if (aIsNumeric && !bIsNumeric) return -1;
            if (!aIsNumeric && bIsNumeric) return 1;
            return 0;
          });

          setPromotions(sortedPromotions);
        }
      } catch (error) {
        console.error("❌ Failed to fetch promotions for PromotionsSection:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + slides.length) % slides.length,
    );
  };

  // Filter featured and enabled promotions
  const featuredPromotions = promotions.filter(p => p.enabled && p.featured);

  // Fallback to hardcoded slides if no promotions from admin
  const slides = featuredPromotions.length > 0 
    ? featuredPromotions.map((promo, index) => ({
        id: promo.id,
        component: <DynamicPromotionSlide key={promo.id} promotion={promo} />
      }))
    : [
        { id: "crypto", component: <CryptoSlide /> },
        { id: "golden", component: <GoldenHourSlide /> },
        { id: "vip", component: <VipRoyaltySlide /> },
      ];

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
          className="relative w-full max-w-5xl aspect-[2.5/1] min-h-[400px] rounded-2xl overflow-hidden shadow-2xl bg-transparent group"
        >
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-[#f7931a] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
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

              {/* Navigation Arrows (only if multiple slides) */}
              {slides.length > 1 && (
                <>
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
                </>
              )}

              {/* Dots Indicator (only if multiple slides) */}
              {slides.length > 1 && (
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
              )}
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}

// Helper function to convert video URLs to embed format
function getVideoEmbedUrl(url: string): string | null {
  if (!url) return null;

  // YouTube watch URL
  const ytMatch = url.match(/^(?:(https?):\/\/)?(?:(?:www|m)\.)?youtube\.com\/watch.*v=([a-zA-Z0-9_-]+)/);
  if (ytMatch) {
    return `${ytMatch[1] || "https"}://www.youtube.com/embed/${ytMatch[2]}?autoplay=1&mute=1&loop=1&playlist=${ytMatch[2]}&showinfo=0&controls=0`;
  }

  // YouTube short URL
  const ytShortMatch = url.match(/^(?:(https?):\/\/)?(?:(?:www|m)\.)?youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (ytShortMatch) {
    return `${ytShortMatch[1] || "https"}://www.youtube.com/embed/${ytShortMatch[2]}?autoplay=1&mute=1&loop=1&playlist=${ytShortMatch[2]}&showinfo=0&controls=0`;
  }

  // Vimeo URL
  const vimeoMatch = url.match(/^(?:(https?):\/\/)?(?:www\.)?vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `${vimeoMatch[1] || "https"}://player.vimeo.com/video/${vimeoMatch[2]}?autoplay=1&mute=1&loop=1&background=1`;
  }

  // Direct video URL (.mp4, .webm)
  if (url.match(/\.(mp4|webm)(\?.*)?$/i)) {
    return url;
  }

  // Already an embed URL
  if (url.includes('/embed/') || url.includes('/video/')) {
    // Add autoplay/mute/loop parameters if not present
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}autoplay=1&mute=1&loop=1&controls=0`;
  }

  return null;
}

// Dynamic Promotion Slide Component - renders promotion from admin settings
function DynamicPromotionSlide({ promotion }: { promotion: Promotion }) {
  const { t } = useLanguage();
  const currentLang = (localStorage.getItem("language") as "vi" | "en") || "en";
  const data = promotion[currentLang] || promotion.en;

  const videoEmbedUrl = data.videoUrl ? getVideoEmbedUrl(data.videoUrl) : null;
  const hasVideo = Boolean(videoEmbedUrl);
  const isDirectVideo = data.videoUrl?.match(/\.(mp4|webm)(\?.*)?$/i);

  const hasBackgroundImage = Boolean(
    data.backgroundImage &&
    data.backgroundImage.trim() !== '' &&
    data.backgroundImage !== 'null' &&
    data.backgroundImage !== 'undefined'
  );

  const hasBackground = hasBackgroundImage || hasVideo;

  const handleButtonClick = (link: string) => {
    if (!link || link === "#") return;

    if (link.startsWith("#")) {
      const element = document.querySelector(link);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      window.open(link, "_blank", "noopener,noreferrer");
    }
  };

  // WITH Background Image or Video - Only show media, no text overlay (like PromotionModal)
  if (hasBackground) {
    return (
      <div
        className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-pointer bg-transparent"
        onClick={() => handleButtonClick(data.buttonLink)}
      >
        {hasVideo ? (
          isDirectVideo ? (
            <video
              src={videoEmbedUrl!}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-contain"
            />
          ) : (
            <iframe
              src={videoEmbedUrl!}
              className="w-full h-full pointer-events-none"
              allow="autoplay; encrypted-media"
              allowFullScreen={false}
              tabIndex={-1}
            />
          )
        ) : (
          <img
            src={data.backgroundImage}
            alt="Promotion"
            className="w-full h-full object-contain"
            onError={(e) => {
              console.error('Failed to load background image:', data.backgroundImage);
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
      </div>
    );
  }

  // WITHOUT Background - Show themed content layout
  // Render based on promotion type
  if (promotion.type === "crypto") {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-r from-[#111827] to-black overflow-hidden">
        <div
          className="absolute inset-0 opacity-20 bg-repeat"
          style={{
            backgroundImage: `url('${imgPattern}')`,
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#f7931a]/20 blur-[100px] rounded-full" />

        <div className="relative z-10 flex items-center justify-between w-full px-8 md:px-16 max-w-4xl">
          <div className="flex flex-col items-start gap-6 max-w-lg">
            {data.badge && (
              <div className="px-3 py-1 rounded border border-[#f7931a] bg-[#f7931a]/20 text-[#f7931a] text-xs font-bold tracking-widest uppercase">
                {data.badge}
              </div>
            )}

            <div className="flex flex-col font-serif font-bold text-4xl md:text-6xl leading-tight text-white">
              <span>{data.title}</span>
              {data.subtitle && (
                <span className="text-[#f7931a]">{data.subtitle}</span>
              )}
            </div>

            <div className="text-lg md:text-xl text-gray-300 leading-snug">
              {data.description}{" "}
              {data.discount && (
                <span className="text-white font-bold text-2xl">
                  {data.discount}
                </span>
              )}
            </div>

            {data.buttonText && (
              <button
                onClick={() => handleButtonClick(data.buttonLink)}
                className="group relative px-8 py-3 rounded-full bg-gradient-to-r from-[#f7931a] to-[#ffab2e] text-black font-bold flex items-center gap-3 overflow-hidden shadow-lg shadow-orange-500/20 mt-4 cursor-pointer"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <CreditCard className="w-5 h-5" />
                <span className="relative">{data.buttonText}</span>
              </button>
            )}
          </div>

          <div className="hidden md:block transform rotate-12 relative z-10">
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

  if (promotion.type === "golden-hour") {
    return (
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
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
          <h2 className="font-serif font-bold text-3xl md:text-5xl text-white tracking-wide drop-shadow-md">
            {data.title}
          </h2>

          <div className="w-16 h-1 bg-white rounded-full" />

          {data.days && (
            <div className="text-lg md:text-xl font-bold text-white tracking-wide">
              {data.days}
            </div>
          )}

          {data.time && (
            <div className="flex items-center gap-2 text-white/90 text-base md:text-lg">
              <Clock className="w-4 h-4 md:w-5 md:h-5" />
              <span>{data.time}</span>
            </div>
          )}

          {data.discount && (
            <div className="text-3xl md:text-4xl font-bold text-white drop-shadow-md mt-1">
              {data.discount}
            </div>
          )}

          {data.buttonText && (
            <button
              onClick={() => handleButtonClick(data.buttonLink)}
              className="mt-2 px-6 py-2.5 rounded-full bg-white text-[#996515] font-bold shadow-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm md:text-base cursor-pointer"
            >
              <Calendar className="w-4 h-4 md:w-5 md:h-5" />
              {data.buttonText}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (promotion.type === "vip-royalty") {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-r from-[#1e3a8a] to-black overflow-hidden">
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#3b82f6]/20 blur-[100px] rounded-full" />

        <div className="relative z-10 flex items-center justify-between w-full px-8 md:px-16 max-w-4xl">
          <div className="hidden md:block opacity-80 text-[#60a5fa] transform -rotate-12">
            <Gem
              className="w-[150px] h-[150px] md:w-[200px] md:h-[200px]"
              strokeWidth={1}
            />
          </div>

          <div className="flex flex-col items-end gap-6 max-w-lg text-right w-full md:w-auto">
            {data.badge && (
              <div className="px-3 py-1 rounded border border-[#3b82f6] bg-[#3b82f6]/20 text-[#93c5fd] text-xs font-bold tracking-widest uppercase">
                {data.badge}
              </div>
            )}

            <div className="flex flex-col font-serif font-bold text-4xl md:text-6xl leading-tight text-white">
              <div className="flex items-baseline justify-end gap-3 flex-wrap">
                <span className="text-4xl">{data.title}</span>
                {data.subtitle && (
                  <span className="text-[#60a5fa]">{data.subtitle}</span>
                )}
              </div>
            </div>

            <div className="text-lg md:text-xl text-gray-300 leading-snug">
              {data.description}{" "}
              {data.discount && (
                <span className="text-white font-bold">
                  {data.discount}
                </span>
              )}
            </div>

            {data.buttonText && (
              <button
                onClick={() => handleButtonClick(data.buttonLink)}
                className="group mt-4 px-8 py-3 rounded-full bg-transparent border-2 border-[#60a5fa] text-[#60a5fa] font-bold flex items-center gap-3 shadow-[0_0_20px_rgba(96,165,250,0.3)] hover:bg-[#60a5fa] hover:text-white transition-all duration-300 cursor-pointer"
              >
                <Crown className="w-5 h-5" />
                <span>{data.buttonText}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default fallback
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-r from-[#111827] to-black overflow-hidden">
      <div className="text-center text-white">
        <h2 className="text-4xl font-bold mb-4">{data.title}</h2>
        <p className="text-xl">{data.description}</p>
      </div>
    </div>
  );
}

// Fallback hardcoded slides (used when no promotions from admin)
function CryptoSlide() {
  const { t } = useLanguage();

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-r from-[#111827] to-black overflow-hidden">
      <div
        className="absolute inset-0 opacity-20 bg-repeat"
        style={{
          backgroundImage: `url('${imgPattern}')`,
          backgroundSize: "24px 24px",
        }}
      />
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#f7931a]/20 blur-[100px] rounded-full" />

      <div className="relative z-10 flex items-center justify-between w-full px-8 md:px-16 max-w-4xl">
        <div className="flex flex-col items-start gap-6 max-w-lg">
          <div className="px-3 py-1 rounded border border-[#f7931a] bg-[#f7931a]/20 text-[#f7931a] text-xs font-bold tracking-widest uppercase">
            {t("promotions.crypto_slide.badge")}
          </div>

          <div className="flex flex-col font-serif font-bold text-4xl md:text-6xl leading-tight text-white">
            <span>{t("promotions.crypto_slide.title_line1")}</span>
            <span className="text-[#f7931a]">
              {t("promotions.crypto_slide.title_line2")}
            </span>
          </div>

          <div className="text-lg md:text-xl text-gray-300 leading-snug">
            {t("promotions.crypto_slide.description")}{" "}
            <span className="text-white font-bold text-2xl">
              {t("promotions.crypto_slide.discount")}
            </span>{" "}
            {t("promotions.crypto_slide.description_part2")}
          </div>

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

        <div className="hidden md:block transform rotate-12 relative z-10">
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

function GoldenHourSlide() {
  const { t } = useLanguage();

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
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
        <h2 className="font-serif font-bold text-3xl md:text-5xl text-white tracking-wide drop-shadow-md">
          {t("promotions.golden_hour_slide.title")}
        </h2>

        <div className="w-16 h-1 bg-white rounded-full" />

        <div className="text-lg md:text-xl font-bold text-white tracking-wide">
          {t("promotions.golden_hour_slide.days")}
        </div>

        <div className="flex items-center gap-2 text-white/90 text-base md:text-lg">
          <Clock className="w-4 h-4 md:w-5 md:h-5" />
          <span>{t("promotions.golden_hour_slide.time")}</span>
        </div>

        <div className="text-3xl md:text-4xl font-bold text-white drop-shadow-md mt-1">
          {t("promotions.golden_hour_slide.discount")}
        </div>

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

function VipRoyaltySlide() {
  const { t } = useLanguage();

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-r from-[#1e3a8a] to-black overflow-hidden">
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#3b82f6]/20 blur-[100px] rounded-full" />

      <div className="relative z-10 flex items-center justify-between w-full px-8 md:px-16 max-w-4xl">
        <div className="hidden md:block opacity-80 text-[#60a5fa] transform -rotate-12">
          <Gem
            className="w-[150px] h-[150px] md:w-[200px] md:h-[200px]"
            strokeWidth={1}
          />
        </div>

        <div className="flex flex-col items-end gap-6 max-w-lg text-right w-full md:w-auto">
          <div className="px-3 py-1 rounded border border-[#3b82f6] bg-[#3b82f6]/20 text-[#93c5fd] text-xs font-bold tracking-widest uppercase">
            {t("promotions.vip_royalty_slide.badge")}
          </div>

          <div className="flex flex-col font-serif font-bold text-4xl md:text-6xl leading-tight text-white">
            <div className="flex items-baseline justify-end gap-3 flex-wrap">
              <span className="text-4xl">
                {t("promotions.vip_royalty_slide.title_vip")}
              </span>
              <span className="text-[#60a5fa]">
                {t("promotions.vip_royalty_slide.title_royalty")}
              </span>
            </div>
          </div>

          <div className="text-lg md:text-xl text-gray-300 leading-snug">
            {t("promotions.vip_royalty_slide.description")}{" "}
            <span className="text-white font-bold">
              {t("promotions.vip_royalty_slide.credit")}
            </span>{" "}
            {t("promotions.vip_royalty_slide.description_part2")}
          </div>

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