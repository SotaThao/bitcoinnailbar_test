import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Loader2, Gift } from "lucide-react";
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

  if (loading) {
    return (
      <section className="py-20 bg-[#111827] flex justify-center items-center min-h-[600px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#FF9800] animate-spin" />
          <p className="text-gray-400 font-serif">
            Loading memberships...
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return null;
  }

  return (
    <>
      <section
        className="py-10 bg-[#111827] relative overflow-hidden px-4"
        id="membership"
      >
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-px bg-[#1f2937]" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center gap-2"
            >
              <span className="text-[#f7931a] tracking-[1.6px] uppercase text-sm font-serif">
                {t("home.membership.badge")}
              </span>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-white">
                {t("home.membership.title")}
              </h2>
              <div className="h-1 w-24 bg-[#f7931a] rounded-full mt-4" />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 max-w-[1536px] mx-auto rounded-2xl">
            {tiers.map((tier, index) => {
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
            })}
          </div>
        </div>
      </section>

      {/* Conditional: Show full RedeemSection or just a Button */}
      {showRedeemSection ? (
        <RedeemSection />
      ) : (
        <section className="py-12 bg-[rgb(17,24,39)] relative overflow-hidden pt-[0px] pr-[0px] pb-[48px] pl-[0px]">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block"
            >
              <button
                onClick={() => navigate("/membership#redeem")}
                className="group relative px-8 py-4 bg-gradient-to-r from-[#FF9800] to-[#f7931a] text-white font-serif font-bold rounded-xl transition-all hover:scale-105 hover:shadow-2xl hover:shadow-[#FF9800]/30"
              >
                <div className="flex items-center gap-3">
                  <Gift className="w-5 h-5" />
                  <span className="text-lg">
                    Redeem Your Code
                  </span>
                </div>
                <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <p className="text-gray-400 text-sm mt-3">
                {t("home.membership.redeem_prompt")}
              </p>
            </motion.div>
          </div>
        </section>
      )}
    </>
  );
}