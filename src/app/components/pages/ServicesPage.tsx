import React from 'react';
import PublicLayout from '../PublicLayout';
import { SEOHead } from '../shared/SEOHead';
import { useLanguage } from '../../context/LanguageContext';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Button } from '../ui/button';
import { PrimaryButton } from '../PrimaryButton';
import { Check, Bitcoin, Sparkles, Gem, ArrowRight, Zap, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import image_9b76d043322193ecba98cb79a9c58c5abe8efbf0 from 'figma:asset/9b76d043322193ecba98cb79a9c58c5abe8efbf0.png';
import { AnimatedButton } from '../ui/animated-button';

export default function ServicesPage() {
  const { t } = useLanguage();

  return (
    <PublicLayout>
      <SEOHead
        title="Luxury Nail Services & Spa Menu"
        description="Explore our full menu of luxury nail services including manicures, pedicures, acrylics, dipping powder, and waxing. Best nail salon services in Houston."
        keywords="nail services list, manicure menu, pedicure menu, acrylic nails price, dipping powder nails, waxing services houston"
        canonicalUrl="https://bitcoinnailbar.com/services"
      />
      {/* Hero Header */}
      <section className="relative py-10 bg-[#0B0F19] text-white overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,152,0,0.15),transparent_70%)] pointer-events-none"></div>
         
         <div className="container mx-auto px-4 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#FF9800]/30 bg-[#FF9800]/5 text-[#FF9800] text-sm font-bold tracking-widest uppercase mb-6">
              <Sparkles className="h-4 w-4" />
              {t('home.services.badge')}
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6">
              {t('services_page.hero_title')} <span className="text-[#FF9800]">{t('services_page.hero_title_highlight')}</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              {t('services_page.hero_desc')}
            </p>
         </div>
      </section>

      {/* Main Service Highlight (Like HomePage) */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
           {/* Section 1: Introduction */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto mb-32">
              <div className="relative group">
                 <div className="absolute inset-0 bg-black/5 rounded-3xl transform rotate-3 transition-transform group-hover:rotate-6 duration-500"></div>
                 <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                    <ImageWithFallback 
                       src={image_9b76d043322193ecba98cb79a9c58c5abe8efbf0}
                       alt="Luxury Manicure"
                       className="w-full h-[600px] object-cover"
                    />
                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-8">
                       <div className="flex items-center gap-4 text-white">
                          <div className="p-3 bg-[#FF9800] rounded-xl">
                             <Gem className="h-8 w-8 text-white" />
                          </div>
                          <div>
                             <h3 className="text-xl font-bold">{t('services_page.premium_materials')}</h3>
                             <p className="text-sm text-gray-300">{t('services_page.premium_desc')}</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="space-y-8">
                 <h2 className="text-4xl md:text-5xl font-serif font-bold leading-tight text-gray-900">
                    {t('services_page.art_title')} <br/>
                    <span className="text-[#FF9800]">{t('services_page.art_highlight')}</span>
                 </h2>
                 <p className="text-lg text-gray-600 leading-relaxed">
                    {t('services_page.art_desc')}
                 </p>
                 
                 <div className="space-y-6">
                    {/* Reusing home.services.items for this list as it seems similar */}
                    {Array.isArray(t('home.services.items')) && (t('home.services.items') as string[]).slice(0, 4).map((item, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-[#FF9800]/30 hover:shadow-lg transition-all bg-gray-50/50">
                         <div className="h-10 w-10 rounded-full bg-[#FF9800]/10 flex items-center justify-center flex-shrink-0">
                            <Check className="h-5 w-5 text-[#FF9800]" />
                         </div>
                         <span className="text-lg font-medium text-gray-800">{item}</span>
                      </div>
                    ))}
                 </div>

                 <div className="pt-6">
                    <Link to="/booking">
                       <PrimaryButton size="lg" className="w-full sm:w-auto shadow-xl shadow-[#FF9800]/20">
                          {t('services_page.book_appointment')} <ArrowRight className="ml-2 h-5 w-5" />
                       </PrimaryButton>
                    </Link>
                 </div>
              </div>
           </div>

           {/* Section 2: Menu Categories */}
           <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                 <h2 className="text-4xl font-serif font-bold mb-4">{t('services_page.menu_title')}</h2>
                 <div className="w-24 h-1 bg-[#FF9800] mx-auto"></div>
                 <p className="mt-4 text-gray-500">{t('services_page.service_menu.subtitle')}</p>
              </div>

              {/* Signature Services (Special Highlight) */}
              <div id="signature" className="mb-12 scroll-mt-24">
                <div className="bg-[#0B0F19] text-white rounded-2xl p-8 md:p-12 border border-[#FF9800]/30 relative overflow-hidden shadow-2xl">
                   <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                      <Crown size={200} />
                   </div>
                   
                   <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-6">
                         <Crown className="text-[#FF9800] h-8 w-8" />
                         <h3 className="text-3xl font-serif font-bold">{t('services_page.categories.signature.title')}</h3>
                      </div>
                      <p className="text-gray-400 mb-8 max-w-2xl">{t('services_page.categories.signature.desc')}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         {Array.isArray(t('services_page.categories.signature.items')) && (t('services_page.categories.signature.items') as any[]).map((item, idx) => (
                            <div key={idx} className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-[#FF9800]/50 transition-colors">
                               <h4 className="font-bold text-lg mb-2 text-[#FF9800]">{item.name}</h4>
                               <p className="text-sm text-gray-400 mb-4 h-10">{item.desc}</p>
                               <div className="font-bold text-xl">{item.price}</div>
                            </div>
                         ))}
                      </div>
                   </div>
                </div>
              </div>

              {/* Detailed Menu Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 {['acrylic', 'dipping', 'gel', 'waxing', 'pedicure', 'manicure', 'kids', 'additional'].map((key) => {
                    const categoryName = t(`services_page.service_menu.categories.${key}`);
                    const categoryData = t(`services_page.service_menu.data.${key}`);
                    
                    if (!categoryData || !categoryData.groups) return null;

                    return (
                       <div id={key} key={key} className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-xl transition-shadow relative overflow-hidden group scroll-mt-24">
                          {/* Decorative BG Icon - Simplified */}
                          <div className="absolute -right-6 -top-6 text-gray-200 opacity-30 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                             <Sparkles size={150} />
                          </div>

                          <h3 className="text-2xl font-serif font-bold text-gray-900 mb-6 relative z-10 flex items-center gap-3">
                             {categoryName}
                          </h3>
                          
                          <div className="space-y-8 relative z-10">
                             {categoryData.groups.map((group: any, gIdx: number) => (
                                <div key={gIdx}>
                                   <h4 className="text-sm font-bold text-[#FF9800] uppercase tracking-wider mb-4 border-b border-[#FF9800]/20 pb-2 inline-block">
                                      {group.name}
                                   </h4>
                                   <div className="space-y-4">
                                      {group.items.map((item: any, iIdx: number) => (
                                         <div key={iIdx} className="flex justify-between items-start pb-2 border-b border-gray-200/50 last:border-0 hover:bg-white/50 p-2 rounded-lg transition-colors">
                                            <div>
                                               <span className="font-medium text-gray-800">{item.name}</span>
                                            </div>
                                            <div className="text-right pl-4">
                                               <div className="font-bold text-gray-900">${item.regular}</div>
                                               {item.member && (
                                                  <div className="text-xs text-[#FF9800] font-bold">VIP: ${item.member}</div>
                                               )}
                                            </div>
                                         </div>
                                      ))}
                                   </div>
                                </div>
                             ))}
                          </div>
                          
                          <div className="mt-8 pt-6 border-t border-dashed border-gray-300 relative z-10">
                              <Link to="/booking" className="inline-flex items-center text-sm font-bold text-gray-900 hover:text-[#FF9800] transition-colors uppercase tracking-wider">
                                  {t('services_page.book_category')} <ArrowRight className="ml-2 h-4 w-4" />
                              </Link>
                          </div>
                       </div>
                    );
                 })}
              </div>
           </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-24 bg-[#0B0F19] relative overflow-hidden text-center">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
         <div className="container mx-auto px-4 relative z-10">
            <Zap className="h-12 w-12 text-[#FF9800] mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">{t('services_page.ready_title')}</h2>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
               {t('services_page.ready_desc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
               <Button 
                  asChild
                  className="bg-[#FF9800] hover:bg-[#F57C00] text-white rounded-full px-10 h-14 text-lg font-bold shadow-[0_0_20px_rgba(255,152,0,0.4)] hover:shadow-[0_0_30px_rgba(255,152,0,0.6)] transition-all"
               >
                  <Link to="/booking" onClick={() => window.scrollTo(0, 0)}>
                     {t('services_page.book_appointment')}
                  </Link>
               </Button>
               
               <AnimatedButton to="/locations" className="rounded-full px-10 h-14 text-lg font-bold">
                  {t('services_page.find_location')}
               </AnimatedButton>
            </div>
         </div>
      </section>
    </PublicLayout>
  );
}