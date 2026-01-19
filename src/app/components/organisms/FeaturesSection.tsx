import { motion } from 'motion/react';
import { Bitcoin, Martini, ShieldCheck, Gem } from 'lucide-react';
import clsx from 'clsx';
import { useLanguage } from '../../context/LanguageContext';

interface FeatureItemProps {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  description: string;
  hasBorder?: boolean;
  delay?: number;
}

function FeatureItem({ icon: Icon, title, subtitle, description, hasBorder, delay = 0 }: FeatureItemProps) {
  return (
    <div className="relative flex-1 flex flex-col items-center text-center px-4 py-8 md:py-0">
      {/* Vertical Border (Desktop only) */}
      {hasBorder && (
        <div 
          aria-hidden="true" 
          className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 h-24 w-px bg-gray-800"
        />
      )}
      
      {/* Horizontal Border (Mobile only) */}
      {hasBorder && (
        <div 
          aria-hidden="true" 
          className="md:hidden absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gray-800" 
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
        className="flex flex-col items-center h-full"
      >
        <div className="mb-6">
          <Icon className="w-12 h-12 text-[#f7931a]" strokeWidth={1.5} />
        </div>
        
        <h3 className="text-xl md:text-2xl font-serif font-bold text-white mb-2">
          {title}
        </h3>
        
        <div className="space-y-1 text-sm text-gray-400">
          <p>{subtitle}</p>
          <p>{description}</p>
        </div>
      </motion.div>
    </div>
  );
}

export function FeaturesSection() {
  const { t } = useLanguage();

  const features = [
    {
      icon: Bitcoin,
      title: t('home.features_section.crypto_payments.title') || 'Crypto Payments',
      subtitle: t('home.features_section.crypto_payments.subtitle') || 'Accepting Bitcoin, USDT, VLINKPAY.',
      description: t('home.features_section.crypto_payments.description') || 'Fast & Absolutely Secure.',
    },
    {
      icon: Martini,
      title: t('home.features_section.bar_cocktails.title') || 'Bar & Cocktails',
      subtitle: t('home.features_section.bar_cocktails.subtitle') || 'Enjoy free drinks at our luxury Bar',
      description: t('home.features_section.bar_cocktails.description') || 'while relaxing.',
    },
    {
      icon: ShieldCheck,
      title: t('home.features_section.medical_hygiene.title') || 'Medical Hygiene',
      subtitle: t('home.features_section.medical_hygiene.subtitle') || 'Hospital-grade Autoclave sterilization',
      description: t('home.features_section.medical_hygiene.description') || 'process. Safety first.',
    },
    {
      icon: Gem,
      title: t('home.features_section.large_space.title') || '10,000+ SQF',
      subtitle: t('home.features_section.large_space.subtitle') || 'The largest space in Houston,',
      description: t('home.features_section.large_space.description') || 'designed for privacy and class.',
    },
  ];

  return (
    <section className="bg-[#111827] py-12 md:py-16 border-t border-gray-800">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-stretch justify-center">
          {features.map((feature, index) => (
            <FeatureItem
              key={index}
              icon={feature.icon}
              title={feature.title}
              subtitle={feature.subtitle}
              description={feature.description}
              hasBorder={index < features.length - 1}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
