import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, Sparkles } from 'lucide-react';
import { PrimaryButton } from '../PrimaryButton';
import { SecondaryButton } from '../SecondaryButton';
import { useLanguage } from '../../context/LanguageContext';

export function CtaSection() {
  const { t } = useLanguage();

  return (
    <section className="py-20 md:py-32 bg-[#1a1a1a] text-white">
      <div className="container mx-auto px-4 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-6xl mb-8 font-serif">
            {t('ready_cta.title')}
          </h2>
          <p className="text-xl md:text-2xl mb-12 text-gray-300 max-w-3xl mx-auto">
            {t('ready_cta.desc')}
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/booking">
            <PrimaryButton size="lg">
              <Calendar className="h-5 w-5" />
              {t('ready_cta.btn_book')}
            </PrimaryButton>
          </Link>
          <Link to="/menu">
            <SecondaryButton size="lg" variant="outline">
              <Sparkles className="h-5 w-5" />
              {t('ready_cta.btn_explore')}
            </SecondaryButton>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}