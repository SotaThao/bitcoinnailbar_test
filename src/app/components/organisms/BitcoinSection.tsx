import { motion } from 'motion/react';
import { BarChart3, Zap, Users, QrCode, Wallet, Play, Pause } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useLanguage } from '../../context/LanguageContext';
import { useState, useRef } from 'react';

export function BitcoinSection() {
  const { t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoClick = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
      videoRef.current.muted = false;
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent click from bubbling to video element
    if (!videoRef.current) return;
    
    videoRef.current.play();
    videoRef.current.muted = false;
  };

  return (
    <section className="py-20 bg-black text-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
          {/* Left Column - Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden border border-[#FF9800]/20 shadow-[0_0_50px_rgba(255,152,0,0.15)] group">
                <div className="w-full h-auto aspect-[4/3] relative">
                  <video 
                    ref={videoRef}
                    src="https://pwmrmcipniefewufwjjy.supabase.co/storage/v1/object/public/NailPage/BitcoinNailbar.mp4"
                    className="w-full h-full object-contain bg-black"
                    muted
                    loop
                    playsInline
                    controls={isPlaying}
                    onClick={handleVideoClick}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                  
                  {/* YouTube-style Play Button Overlay */}
                  {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity hover:bg-black/30 cursor-pointer" onClick={handleOverlayClick}>
                      <div className="w-20 h-20 rounded-full bg-[#FF9800] flex items-center justify-center shadow-[0_0_30px_rgba(255,152,0,0.5)] transition-transform hover:scale-110">
                        <Play className="h-10 w-10 text-white fill-white ml-1" />
                      </div>
                    </div>
                  )}
                </div>
            </div>
            {/* Glow effect behind */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#FF9800]/10 blur-3xl -z-10 rounded-full pointer-events-none"></div>
          </motion.div>

          {/* Right Column - Content */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-10"
          >
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#FF9800] text-[#FF9800] text-xs font-bold tracking-widest uppercase bg-[#FF9800]/5">
                  <Zap className="h-3 w-3 fill-current" />
                  {t('home.bnb_section.badge')}
              </div>

              <div className="space-y-1">
                  <h2 className="text-4xl md:text-5xl font-serif font-bold text-white leading-tight">
                      {t('home.bnb_section.title_1')}
                  </h2>
                  <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#FF9800] leading-tight" style={{ textShadow: '0 0 20px rgba(255,152,0,0.3)' }}>
                      {t('home.bnb_section.title_2')}
                  </h2>
              </div>

              <p className="text-gray-400 leading-relaxed text-lg">
                  {t('home.bnb_section.desc')}
              </p>
            </div>

            <div className="space-y-8">
                <div className="flex gap-5">
                    <div className="flex-shrink-0">
                        <div className="w-14 h-14 rounded-2xl bg-[#1C1F26] flex items-center justify-center border border-zinc-800 shadow-inner">
                             <Users className="h-7 w-7 text-[#FF9800]" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">{t('home.bnb_section.feature_1_title')}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                            {t('home.bnb_section.feature_1_desc')}
                        </p>
                    </div>
                </div>

                <div className="flex gap-5">
                    <div className="flex-shrink-0">
                        <div className="w-14 h-14 rounded-2xl bg-[#1C1F26] flex items-center justify-center border border-zinc-800 shadow-inner">
                             <QrCode className="h-7 w-7 text-[#FF9800]" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">{t('home.bnb_section.feature_2_title')}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                            {t('home.bnb_section.feature_2_desc')}
                        </p>
                    </div>
                </div>
            </div>

            <div className="pt-2">
                 <a href="https://vlinkpay.com?ref=6145CBD8&parent=6145CBD8&leg=left" target="_blank" rel="noopener noreferrer">
                     <button className="relative overflow-hidden h-14 border-2 border-[#1e3a8a] bg-[#172554] text-white px-8 rounded-full text-base font-semibold shadow-[0_0_20px_rgba(30,58,138,0.3)] flex items-center gap-3 group/btn transition-all hover:shadow-[0_0_30px_rgba(30,58,138,0.5)]">
                        <span className="absolute inset-0 bg-[#1e3a8a] transform -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-300 ease-out"></span>
                        <Wallet className="h-5 w-5 relative z-10" />
                        <span className="relative z-10">
                            {t('home.bnb_section.btn_register')}
                        </span>
                     </button>
                 </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}