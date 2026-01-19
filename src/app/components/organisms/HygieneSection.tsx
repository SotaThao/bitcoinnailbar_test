import image_9b76d043322193ecba98cb79a9c58c5abe8efbf0 from 'figma:asset/9b76d043322193ecba98cb79a9c58c5abe8efbf0.png';
import image_36d0ff035d3f60c47a5c81a3484dd16ff2e9a5e6 from 'figma:asset/36d0ff035d3f60c47a5c81a3484dd16ff2e9a5e6.png';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { PrimaryButton } from '../PrimaryButton';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useLanguage } from '../../context/LanguageContext';

export function HygieneSection() {
  const { t } = useLanguage();

  return (
    <section className="py-20 md:py-32 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6 lg:order-1 order-2"
          >
            <div className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold">
              {t('home.hygiene.badge')}
            </div>
            <h2 className="text-4xl md:text-5xl font-serif">
              {t('home.hygiene.title')}
            </h2>
            <p className="text-lg text-[#FF9800] leading-relaxed">
              {t('home.hygiene.desc')}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {Array.isArray(t('home.hygiene.items')) && (t('home.hygiene.items') as string[]).map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative lg:order-2 order-1"
          >
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <ImageWithFallback
                src={image_36d0ff035d3f60c47a5c81a3484dd16ff2e9a5e6}
                alt="Hygiene Standards"
                className="w-full h-[500px] object-cover"
              />
            </div>
          </motion.div>
        </div>

        {/* Service Introduction Block */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto mt-24 md:mt-32">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative order-1"
          >
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <ImageWithFallback
                src={image_9b76d043322193ecba98cb79a9c58c5abe8efbf0}
                alt="Luxury Treatments"
                className="w-full h-[500px] object-cover"
              />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6 order-2"
          >
            <div className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold">
              {t('home.services.badge')}
            </div>
            <h2 className="text-4xl md:text-5xl font-serif">
              {t('home.services.title')}
            </h2>
            <p className="text-lg text-[#FF9800] leading-relaxed">
              {t('home.services.desc')}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {Array.isArray(t('home.services.items')) && (t('home.services.items') as string[]).map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Link to="/services">
                <PrimaryButton size="lg" className="font-bold shadow-lg shadow-[#FF9800]/20 hover:shadow-[#FF9800]/40 transition-shadow">
                  {t('home.services.btn')}
                </PrimaryButton>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
