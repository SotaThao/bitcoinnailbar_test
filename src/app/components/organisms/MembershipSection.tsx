import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Bitcoin, Crown, Gift, Loader2 } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useMembershipTiers } from "../../hooks/useMembershipTiers";
import { MembershipCard } from "../molecules/MembershipCard";
import { TIER_VISUALS } from "../../lib/membership-visuals";
import { RedeemSection } from "../membership/RedeemSection";

interface MembershipSectionProps {
  showRedeemSection?: boolean; // Show full redeem section or just button
}

export function MembershipSection({
  showRedeemSection = false,
}: MembershipSectionProps) {
  const { t } = useLanguage();
  const { tiers, loading, error } = useMembershipTiers();
  const navigate = useNavigate();

  return (
    <>
      <section
        className="relative overflow-hidden bg-[#070708] px-4 py-16 text-white md:py-24"
        id="membership"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(200,147,45,0.18),transparent_30%),radial-gradient(circle_at_88%_18%,rgba(197,191,165,0.12),transparent_28%),linear-gradient(180deg,#070708,#15120E)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-white/10" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="mx-auto mb-12 max-w-4xl text-center md:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center gap-4"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-[#C8932D]/30 bg-[#C8932D]/10 px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[#F2B544]">
                <Crown className="h-3.5 w-3.5" />
                VIP members club
              </span>
              <h2 className="text-balance font-serif text-4xl font-normal leading-tight text-[#F0EDE4] md:text-6xl">
                Nail care rewards in a private Bitcoin lounge.
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-[#C5BFA5]/80 md:text-base">
                Member pricing, cashback, priority booking, lounge perks,
                and Bitcoin-friendly payment for repeat guests who want a
                polished routine.
              </p>
            </motion.div>
          </div>

          <div className="mx-auto mb-10 grid max-w-5xl gap-3 md:grid-cols-3">
            {[
              ["Member pricing", "Save across repeat visits"],
              ["Priority booking", "Better appointment access"],
              ["BTC / USDT / VLINKPAY", "Discreet crypto checkout"],
            ].map(([title, text], index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className="rounded-2xl border border-white/10 bg-white/[0.045] px-5 py-4 shadow-[0_18px_60px_rgba(0,0,0,0.20)] backdrop-blur-md"
              >
                <div className="mb-3 flex items-center gap-2 text-[#F2B544]">
                  {index === 2 ? (
                    <Bitcoin className="h-4 w-4" strokeWidth={1.5} />
                  ) : (
                    <Crown className="h-4 w-4" strokeWidth={1.5} />
                  )}
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em]">
                    {title}
                  </span>
                </div>
                <p className="text-sm text-[#F0EDE4]/72">{text}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 max-w-[1536px] mx-auto rounded-2xl">
            {loading ? (
              <div className="col-span-full flex min-h-48 flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-white/[0.045] text-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#F2B544]" />
                <p className="font-serif text-[#C5BFA5]">
                  Preparing member tiers...
                </p>
              </div>
            ) : error ? (
              <div className="col-span-full rounded-2xl border border-white/10 bg-white/[0.045] px-6 py-8 text-center text-[#C5BFA5]">
                Current membership options are available at the lounge.
              </div>
            ) : (
              tiers.map((tier, index) => {
                const baseVisual =
                  TIER_VISUALS[tier.name] ||
                  TIER_VISUALS["silver"];
                const visual = {
                  ...baseVisual,
                  popular:
                    tier.is_popular !== undefined
                      ? tier.is_popular
                      : baseVisual.popular,
                };
                const saveText =
                  tier.discount_percentage > 0
                    ? `${t("home.membership.save")} ${tier.discount_percentage}%`
                    : null;

                return (
                  <MembershipCard
                    key={tier.id}
                    tier={tier}
                    visual={visual}
                    saveText={saveText}
                    isPopular={visual.popular}
                  />
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Conditional: Show full RedeemSection or just a Button */}
      {showRedeemSection ? (
        <RedeemSection />
      ) : (
        <section className="relative overflow-hidden bg-[#15120E] px-0 pb-12 pt-0">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block"
            >
              <button
                onClick={() => navigate("/membership#redeem")}
                className="group relative rounded-full border border-[#C8932D]/40 bg-[#C8932D] px-8 py-4 font-serif font-bold text-white shadow-[0_18px_50px_rgba(200,147,45,0.18)] transition-all hover:scale-105 hover:bg-[#F2B544]"
              >
                <div className="flex items-center gap-3">
                  <Gift className="w-5 h-5" />
                  <span className="text-lg">
                    Redeem Your Code
                  </span>
                </div>
                <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
              <p className="text-[#C5BFA5]/75 text-sm mt-3">
                {t("home.membership.redeem_prompt")}
              </p>
            </motion.div>
          </div>
        </section>
      )}
    </>
  );
}
