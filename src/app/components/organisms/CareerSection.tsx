import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { Button } from '../ui/button';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useLanguage } from '../../context/LanguageContext';
import { ContactDialog } from '../ui/contact-dialog';
import { useState } from 'react';

export function CareerSection() {
  const { t } = useLanguage();
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <section className="bg-white overflow-hidden py-10">
      <div className="container mx-auto px-4 mb-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
           {/* Left Image */}
           <motion.div 
             initial={{ opacity: 0, x: -50 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.8 }}
             className="relative"
           >
              <div className="relative z-10 rounded-2xl shadow-2xl">
                 <ImageWithFallback 
                   src="https://images.unsplash.com/photo-1632345031435-8727f6897d53?q=80&w=1080&auto=format&fit=crop" 
                   alt="Join The Elite Team" 
                   className="w-full h-auto object-cover rounded-2xl"
                 />
                 
                 {/* Highest Pay Badge */}
                 <div className="absolute bottom-8 -right-4 bg-white py-4 px-6 rounded-lg shadow-xl border-l-4 border-[#FF9800] z-20 animate-in slide-in-from-bottom duration-700 delay-300 hidden md:block">
                    <p className="font-serif font-bold text-gray-900 text-lg">{t('careers.salary_badge_title')}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">{t('careers.salary_badge_subtitle')}</p>
                 </div>
              </div>
              {/* Decorative blob */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gray-50 rounded-full blur-3xl -z-10"></div>
           </motion.div>
           
           {/* Right Content */}
           <motion.div 
             initial={{ opacity: 0, x: 50 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.8 }}
             className="space-y-8"
           >
              <div className="inline-block px-4 py-1.5 rounded-full border border-gray-200 text-gray-500 text-[10px] font-bold tracking-[0.2em] uppercase">
                 {t('careers.badge')}
              </div>
              
              <div className="space-y-4">
                 <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900">
                    {t('careers.title')}
                 </h2>
                 <p className="text-gray-600 leading-relaxed text-lg">
                    {t('careers.desc')}
                 </p>
              </div>
              
              <ul className="space-y-4">
                 {Array.isArray(t('careers.features')) && (t('careers.features') as string[]).map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                       <div className="h-5 w-5 rounded-full bg-[#FF9800] flex items-center justify-center flex-shrink-0">
                          <Check className="h-3 w-3 text-white" />
                       </div>
                       <span className="text-gray-700 font-medium">{item}</span>
                    </li>
                 ))}
              </ul>
              
              <div className="pt-4">
                 <Button 
                   variant="outline" 
                   className="border-black text-black hover:bg-black hover:text-white rounded-full px-8 py-6 text-xs font-bold tracking-widest uppercase shadow-lg hover:shadow-xl transition-all hover:scale-105"
                   onClick={(e) => {
                     e.preventDefault();
                     setIsContactOpen(true);
                   }}
                   type="button"
                 >
                    {t('careers.cta')}
                 </Button>
              </div>
           </motion.div>
        </div>
      </div>

      {/* Contact Dialog */}
      <ContactDialog 
        open={isContactOpen} 
        onOpenChange={setIsContactOpen}
        title="Join Our Team"
        description="Contact us to learn more about career opportunities at Bitcoin Nail Bar."
      />
    </section>
  );
}