import { Link } from "react-router";
import { motion } from "motion/react";
import {
  Bitcoin,
  Calendar,
  Crown,
  Diamond,
  Gift,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { ASSETS } from "../../config/assets";

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

const serviceTeasers = [
  {
    title: "Manicure",
    image: ASSETS.hygieneLuxuryTreatments,
  },
  {
    title: "Private lounge",
    image: ASSETS.heroLacquerLounge,
  },
  {
    title: "Pedicure",
    image: ASSETS.hygieneStandards,
  },
];

export function HeroSection() {
  const { t } = useLanguage();

  const copy = (path: string, fallback: string) => {
    const value = t(path);
    return value === path ? fallback : value;
  };

  return (
    <section className="relative max-w-[100vw] overflow-hidden bg-[#F6EFE4] text-[#080604]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(200,147,45,0.13),transparent_28%),radial-gradient(circle_at_82%_20%,rgba(255,255,255,0.76),transparent_32%),linear-gradient(180deg,#FBF7EF_0%,#F3E8D9_100%)]" />

      <div className="relative z-10 mx-auto max-w-[1680px] px-5 py-7 md:px-8 lg:px-14 lg:py-8">
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
                  className="group inline-flex h-14 w-full items-center justify-center gap-3 whitespace-nowrap rounded-lg border border-[#C8932D]/50 bg-[#090807] px-5 font-mono text-[12px] font-bold uppercase tracking-[0.12em] text-[#F2B544] shadow-[0_24px_70px_rgba(57,39,18,0.18)] transition-colors hover:bg-[#17120E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C8932D] sm:w-auto sm:min-w-[340px] sm:px-8 sm:text-sm sm:tracking-[0.14em] md:h-16 md:px-10 md:text-base"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Calendar className="h-4 w-4" strokeWidth={1.8} />
                  {copy("nav.booking", "Book Appointment")}
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </motion.button>
              </Link>
              <Link to="#membership" className="w-full sm:w-auto">
                <motion.button
                  className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-lg border border-[#080604]/16 bg-white/45 px-7 font-mono text-sm font-bold uppercase tracking-[0.14em] text-[#080604] backdrop-blur-md transition-colors hover:border-[#C8932D] hover:text-[#9A7332] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C8932D] sm:w-auto md:h-16"
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
              <span className="inline-flex items-center gap-2 text-[#080604]">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-[#F2B544] text-[#090807]">
                  <Bitcoin className="h-3.5 w-3.5" />
                </span>
                Bitcoin
              </span>
              <span className="inline-flex items-center gap-2 text-[#080604]">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-[#21B779] text-white">
                  $
                </span>
                USDT
              </span>
              <span className="inline-flex items-center gap-2 text-[#080604]">
                <span className="text-lg font-black text-[#5B4BD9]">V</span>
                VLINKPAY
              </span>
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
                alt="Manicured hands and champagne in the Bitcoin Nail Bar lounge"
                className="h-full min-h-[360px] w-full object-cover object-[57%_50%] md:min-h-[520px] lg:min-h-[600px]"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-[#090807]/25 via-transparent to-transparent" />

              <motion.aside
                className="absolute left-4 top-4 w-[72%] max-w-[320px] rounded-2xl border border-[#C8932D]/22 bg-[#12100D]/88 p-4 text-[#F7F1E8] shadow-[0_28px_80px_rgba(0,0,0,0.32)] backdrop-blur-xl sm:w-[300px] lg:left-auto lg:right-6 lg:top-auto lg:bottom-6 lg:w-[430px] lg:max-w-none lg:p-6"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 }}
              >
                <div className="mb-6 flex items-start justify-between gap-4 lg:mb-8">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full border border-[#C8932D]/35 bg-[#C8932D]/12 text-[#F2B544]">
                      <Crown className="h-4 w-4" strokeWidth={1.6} />
                    </span>
                    <div>
                      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#F2B544]">
                        VIP membership
                      </p>
                      <p className="mt-1 text-sm text-[#F7F1E8]/86">
                        Exclusive benefits. Extraordinary you.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="font-serif text-5xl leading-none text-[#F2B544] lg:text-6xl">
                      20%
                    </div>
                    <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[#F2B544]">
                      Cashback
                    </div>
                  </div>
                  <div className="hidden rotate-[-7deg] rounded-xl border border-[#C8932D]/30 bg-[#090807]/88 px-8 py-5 text-center shadow-[0_20px_50px_rgba(0,0,0,0.28)] sm:block">
                    <div className="font-serif text-3xl text-[#C8932D]">
                      B
                    </div>
                    <div className="mt-2 font-mono text-[9px] uppercase tracking-[0.24em] text-[#F2B544]">
                      VIP member
                    </div>
                  </div>
                </div>
              </motion.aside>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="relative z-10 border-y border-[#C8932D]/20 bg-[#080706] text-[#F7F1E8]">
        <div className="mx-auto flex max-w-[1680px] snap-x overflow-x-auto px-5 md:px-8 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-14">
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

      <div className="relative z-10 bg-[#080706] px-5 py-8 text-[#F7F1E8] md:px-8 lg:px-14">
        <div className="mx-auto grid max-w-[1680px] gap-6 lg:grid-cols-[0.34fr_0.66fr] lg:items-start">
          <div className="flex items-center justify-between gap-5 lg:block">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-[#C8932D]">
                Signature services
              </p>
              <h2 className="mt-2 font-serif text-4xl font-normal leading-tight md:text-5xl">
                Crafted for you
              </h2>
            </div>
            <Link
              to="/services"
              className="hidden rounded-lg border border-[#C8932D]/50 px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.16em] text-[#F2B544] transition-colors hover:bg-[#C8932D] hover:text-[#080706] md:inline-flex"
            >
              View full menu →
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {serviceTeasers.map((service) => (
              <Link
                key={service.title}
                to="/services"
                className="group relative min-h-[150px] overflow-hidden rounded-xl border border-white/10 bg-white/5"
              >
                <img
                  src={service.image}
                  alt={`${service.title} service preview`}
                  className="h-full min-h-[150px] w-full object-cover opacity-78 transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080706]/76 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-4">
                  <span className="font-serif text-xl">
                    {service.title}
                  </span>
                  <span className="font-mono text-xl text-[#F2B544]">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
