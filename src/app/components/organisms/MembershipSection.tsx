import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useMembershipTiers } from '../../hooks/useMembershipTiers';
import { MembershipCard } from '../molecules/MembershipCard';
import { TIER_VISUALS } from '../../lib/membership-visuals';

export function MembershipSection() {
  const { t } = useLanguage();
  const { tiers, loading, error } = useMembershipTiers();

  if (loading) {
    return (
      <section className="py-20 bg-[#111827] flex justify-center items-center min-h-[600px]">
         <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-[#FF9800] animate-spin" />
            <p className="text-gray-400 font-serif">Loading memberships...</p>
         </div>
      </section>
    );
  }

  if (error) {
    return null;
  }

  return (
    <section className="py-10 bg-[#111827] relative overflow-hidden px-4" id="membership">
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
            <span className="text-[#f7931a] tracking-[1.6px] uppercase text-sm font-serif">{t('home.membership.badge')}</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white">{t('home.membership.title')}</h2>
            <div className="h-1 w-24 bg-[#f7931a] rounded-full mt-4" />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 max-w-[1536px] mx-auto rounded-2xl">
          {tiers.map((tier, index) => {
            const visual = TIER_VISUALS[tier.name] || TIER_VISUALS['silver'];
            const saveText = tier.discount_percentage > 0 ? `${t('home.membership.save')} ${tier.discount_percentage}%` : null;

            return (
              <MembershipCard 
                key={tier.id} 
                tier={tier} 
                visual={visual} 
                saveText={saveText} 
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}