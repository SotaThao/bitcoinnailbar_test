import { useEffect, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Link } from "react-router";
import { motion } from "motion/react";
import {
  Bitcoin,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Crown,
  Diamond,
  Gift,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { ASSETS } from "../../config/assets";
import { projectId, publicAnonKey } from "../../../../utils/supabase/info";

interface BannerTranslation {
  languageCode: string;
  webUrl: string;
  mobileUrl: string;
  tabletUrl: string;
}

interface NexoraBanner {
  id: string;
  title: string;
  webActionUrl: string;
  target: string;
  status: string;
  translations: BannerTranslation[];
}

const benefitItems = [
  {
    icon: Diamond,
    title: "Luxury experience",
    text: "Private suites, premium products, flawless results.",
  },
  {
    icon: Bitcoin,
    title: "Pay with crypto",
    text: "Bitcoin, USDT, and VLINKPAY accepted.",
  },
  {
    icon: Gift,
    title: "Earn rewards",
    text: "Cashback and member-only lounge perks.",
  },
  {
    icon: Sparkles,
    title: "Expert artists",
    text: "Detailed nail care, art, and finishing.",
  },
  {
    icon: Calendar,
    title: "Easy booking",
    text: "Online booking and walk-ins welcome.",
  },
];

const paymentMethods = [
  {
    name: "Bitcoin",
    label: "Bitcoin",
    logo: ASSETS.bitcoinProductLogo,
    logoWrapClassName: "grid h-6 w-6 place-items-center",
    logoClassName: "h-6 w-6 object-contain",
  },
  {
    name: "USDT",
    label: "USDT",
    logo: ASSETS.usdtLogo,
    logoWrapClassName: "grid h-6 w-6 place-items-center",
    logoClassName: "h-6 w-6 object-contain",
  },
  {
    name: "VLINKPAY",
    label: "VLINKPAY",
    logo: ASSETS.vlinkpayLogo,
    logoWrapClassName: "grid h-6 w-6 place-items-center",
    logoClassName: "h-6 w-6 object-contain",
  },
];

const BENEFIT_ROTATION_MS = 4000;

export function HeroSection() {
  const { t, language } = useLanguage();
  const [activeBenefitIndex, setActiveBenefitIndex] = useState(0);
  const [banners, setBanners] = useState<NexoraBanner[]>([]);
  
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });

  const copy = (path: string, fallback: string) => {
    const value = t(path);
    return value === path ? fallback : value;
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveBenefitIndex((current) => (current + 1) % benefitItems.length);
    }, BENEFIT_ROTATION_MS);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch(`https://api.nexoratouch.com/api/v1/banners/active`);
        const data = await response.json();
        if (data && data.Items) {
          setBanners(data.Items);
        }
      } catch (error) {
        console.error("Error fetching banners:", error);
      }
    };
    fetchBanners();
  }, []);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setActiveBannerIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setActiveBannerIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    
    const onReInit = () => setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('reInit', onReInit);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
      emblaApi.off('reInit', onReInit);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi) return;
    const autoplay = window.setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    }, 5000);
    return () => window.clearInterval(autoplay);
  }, [emblaApi]);

  const activeBenefit = benefitItems[activeBenefitIndex];
  const ActiveBenefitIcon = activeBenefit.icon;

  const showPreviousBenefit = () => {
    setActiveBenefitIndex(
      (current) => (current - 1 + benefitItems.length) % benefitItems.length,
    );
  };

  const showNextBenefit = () => {
    setActiveBenefitIndex((current) => (current + 1) % benefitItems.length);
  };

  return (
    <section className="relative max-w-[100vw] overflow-hidden bg-[#F6EFE4] text-[#080604]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(200,147,45,0.13),transparent_28%),radial-gradient(circle_at_82%_20%,rgba(255,255,255,0.76),transparent_32%),linear-gradient(180deg,#FBF7EF_0%,#F3E8D9_100%)]" />

      <div className="relative z-10 mx-auto max-w-[1440px] px-5 py-7 md:px-8 lg:px-14 lg:py-8">
        {/* Banner Frame Carousel */}
        <motion.div 
          className="mb-10 lg:mb-14 w-full"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex -ml-4 touch-pan-y">
              {banners.length > 0 ? banners.map((banner) => {
                const translation = banner.translations?.find(t => t.languageCode === language) || banner.translations?.find(t => t.languageCode === 'en');
                const bgImg = translation?.webUrl;
                return (
                  <div key={banner.id} className="pl-4 shrink-0 min-w-0 w-full md:w-1/2">
                    <div className="relative rounded-[1.25rem] overflow-hidden aspect-[3/1] shadow-[0_8px_30px_rgb(0,0,0,0.12)] bg-[#0A0B10]">
                      <a href={banner.webActionUrl || "#"} target={banner.target === 'OpenNewTab' ? '_blank' : '_self'} rel="noreferrer" className="block w-full h-full" draggable="false">
                        <img src={bgImg} alt={banner.title} className="w-full h-full object-cover" draggable="false" />
                      </a>
                    </div>
                  </div>
                );
              }) : (
                <>
                  <div className="pl-4 shrink-0 min-w-0 w-full md:w-1/2">
                    <div className="relative rounded-[1.25rem] overflow-hidden aspect-[3/1] shadow-[0_8px_30px_rgb(0,0,0,0.12)] bg-[#0A0B10]">
                      <img src="/assets/banners/vlinkpay_banner.jpg" alt="VLINKPAY Banner" className="w-full h-full object-cover" draggable="false" />
                    </div>
                  </div>
                  <div className="pl-4 shrink-0 min-w-0 w-full md:w-1/2">
                    <div className="relative rounded-[1.25rem] overflow-hidden aspect-[3/1] shadow-[0_8px_30px_rgb(0,0,0,0.12)] bg-[#0A0B10]">
                      <img src="/assets/banners/cryptomap360_banner.jpg" alt="CryptoMap360 Banner" className="w-full h-full object-cover" draggable="false" />
                    </div>
                  </div>
                  <div className="pl-4 shrink-0 min-w-0 w-full md:w-1/2">
                    <div className="relative rounded-[1.25rem] overflow-hidden aspect-[3/1] shadow-[0_8px_30px_rgb(0,0,0,0.12)] bg-[#0A0B10]">
                      <img src="/assets/banners/nailbar_banner.jpg" alt="Bitcoin Nail Bar Promotion" className="w-full h-full object-cover" draggable="false" />
                    </div>
                  </div>
                  <div className="pl-4 shrink-0 min-w-0 w-full md:w-1/2">
                    <div className="relative rounded-[1.25rem] overflow-hidden aspect-[3/1] shadow-[0_8px_30px_rgb(0,0,0,0.12)] bg-[#0A0B10]">
                      <img src="/assets/banners/membership_banner.jpg" alt="VIP Membership Banner" className="w-full h-full object-cover" draggable="false" />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex justify-center gap-2 mt-4">
            {scrollSnaps.map((_, i) => (
              <button 
                key={i} 
                onClick={() => emblaApi?.scrollTo(i)}
                className={`h-2 rounded-full transition-all duration-300 ${i === activeBannerIndex ? "w-6 bg-[#080604]/40" : "w-2 bg-[#080604]/15 hover:bg-[#080604]/30"}`}
                aria-label={`Go to banner ${i + 1}`}
              />
            ))}
          </div>
        </motion.div>

        <div className="grid min-w-0 items-start gap-8 lg:min-h-[600px] lg:grid-cols-12 lg:gap-10">
          <motion.div
            className="mx-auto w-full min-w-0 max-w-[calc(100vw_-_2.5rem)] space-y-6 pt-2 text-center lg:col-span-5 lg:mx-0 lg:max-w-[620px] lg:text-left"
            initial={{ opacity: 0, x: -28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.72 }}
          >
            <div className="mx-auto flex w-fit flex-col items-center gap-3 lg:mx-0 lg:items-start">
              <span className="font-mono text-xs font-bold uppercase tracking-[0.28em] text-[#C8932D] md:text-sm">
                Bitcoin Nail Bar
              </span>
              <span className="h-px w-20 bg-[#C8932D]" />
            </div>

            <div className="space-y-2">
              <h1 className="text-balance font-serif text-[clamp(4.45rem,7.35vw,8rem)] font-normal leading-[0.88] tracking-tight">
                Luxury
                <br />
                Nail Care
              </h1>
            </div>

            <p className="mx-auto w-full max-w-[21rem] text-base leading-relaxed text-[#3E3931] sm:max-w-[35rem] md:text-lg lg:mx-0">
              Elevated nail services in a private, refined setting. Pay with
              Bitcoin, earn rewards, and enjoy a quieter lounge experience.
            </p>

            <div className="mx-auto flex w-full max-w-[18.5rem] flex-col items-center gap-4 sm:max-w-none sm:flex-row lg:mx-0 lg:items-start">
              <Link to="/booking" className="w-full sm:w-auto">
                <motion.button
                  className="group inline-flex h-14 w-full items-center justify-center gap-3 whitespace-nowrap rounded-lg border border-[#C8932D]/50 bg-[#090807] px-5 font-mono text-[12px] font-bold uppercase tracking-[0.12em] text-[#F2B544] shadow-[0_24px_70px_rgba(57,39,18,0.18)] transition-colors hover:bg-[#17120E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C8932D] sm:w-auto sm:min-w-[220px] sm:px-8 sm:text-sm sm:tracking-[0.14em] md:h-16 md:text-base"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Calendar className="h-4 w-4" strokeWidth={1.8} />
                  {copy("nav.booking", "Book Now")}
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </motion.button>
              </Link>
              <Link to="#membership" className="w-full sm:w-auto">
                <motion.button
                  className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-lg border border-[#080604]/16 bg-white/45 px-7 font-mono text-sm font-bold uppercase tracking-[0.14em] text-[#080604] backdrop-blur-md transition-colors hover:border-[#C8932D] hover:text-[#9A7332] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C8932D] sm:w-auto sm:min-w-[220px] md:h-16"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Crown className="h-4 w-4" strokeWidth={1.8} />
                  Membership
                </motion.button>
              </Link>
            </div>

            <div className="mx-auto flex w-full max-w-[21rem] flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-[#6E6256] sm:max-w-none lg:mx-0 lg:justify-start">
              <span className="text-[#9A7332]">We accept</span>
              {paymentMethods.map((method) => (
                <span
                  key={method.name}
                  className="inline-flex items-center gap-2 text-[#080604]"
                >
                  <span className={method.logoWrapClassName}>
                    <img
                      src={method.logo}
                      alt={`${method.name} logo`}
                      className={method.logoClassName}
                      decoding="async"
                    />
                  </span>
                  {method.label && <span>{method.label}</span>}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="relative mx-auto w-full min-w-0 max-w-[calc(100vw_-_2.5rem)] lg:col-span-7 lg:max-w-none"
            initial={{ opacity: 0, x: 34 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.72, delay: 0.08 }}
          >
            <div className="relative min-h-[360px] overflow-hidden rounded-[1.6rem] border border-white/70 bg-[#090807] shadow-[0_34px_90px_rgba(57,39,18,0.22)] md:min-h-[520px] lg:min-h-[600px]">
              <img
                src={ASSETS.heroLacquerLounge}
                alt="Long black and gold acrylic nail art with champagne in the Bitcoin Nail Bar lounge"
                className="h-full min-h-[360px] w-full object-cover object-[57%_50%] md:min-h-[520px] lg:min-h-[600px]"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-[#090807]/25 via-transparent to-transparent" />

            </div>
          </motion.div>
        </div>


      </div>

      <div className="relative z-10 border-y border-[#C8932D]/20 bg-[#080706] text-[#F7F1E8]">
        <div className="mx-auto max-w-[1440px] px-5 py-4 md:px-8 lg:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Previous benefit"
              onClick={showPreviousBenefit}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#C8932D]/35 text-[#F2B544] transition-colors hover:bg-[#C8932D]/12 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C8932D]"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.8} />
            </button>

            <motion.article
              key={activeBenefit.title}
              className="flex min-h-[86px] min-w-0 flex-1 items-center gap-4 overflow-hidden"
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.28 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.08}
              onDragEnd={(_, info) => {
                if (info.offset.x < -36) showNextBenefit();
                if (info.offset.x > 36) showPreviousBenefit();
              }}
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-[#C8932D]/35 text-[#F2B544]">
                <ActiveBenefitIcon className="h-5 w-5" strokeWidth={1.6} />
              </span>
              <div className="min-w-0">
                <h3 className="break-words font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[#F2B544]">
                  {activeBenefit.title}
                </h3>
                <p className="mt-1 text-sm leading-snug text-[#F7F1E8]/76">
                  {activeBenefit.text}
                </p>
              </div>
            </motion.article>

            <button
              type="button"
              aria-label="Next benefit"
              onClick={showNextBenefit}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#C8932D]/35 text-[#F2B544] transition-colors hover:bg-[#C8932D]/12 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C8932D]"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={1.8} />
            </button>
          </div>

          <div className="mt-3 flex items-center justify-center gap-2">
            {benefitItems.map((item, index) => (
              <button
                key={item.title}
                type="button"
                aria-label={`Show ${item.title}`}
                aria-current={index === activeBenefitIndex ? "true" : undefined}
                onClick={() => setActiveBenefitIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === activeBenefitIndex
                    ? "w-6 bg-[#F2B544]"
                    : "w-2 bg-[#F2B544]/35 hover:bg-[#F2B544]/60"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="mx-auto hidden max-w-[1440px] px-5 md:px-8 lg:grid lg:grid-cols-5 lg:px-14">
          {benefitItems.map((item) => (
            <article
              key={item.title}
              className="flex min-w-[250px] snap-start items-center gap-4 border-r border-white/10 py-5 pr-7 last:border-r-0 lg:min-w-0 lg:px-7 lg:first:pl-0"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#C8932D]/35 text-[#F2B544]">
                <item.icon className="h-5 w-5" strokeWidth={1.6} />
              </span>
              <div>
                <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[#F2B544]">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm leading-snug text-[#F7F1E8]/76">
                  {item.text}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>

    </section>
  );
}
