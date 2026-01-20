import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Instagram, Facebook, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useLanguage } from '../../context/LanguageContext';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import img1 from 'figma:asset/490a930e6c326d1add62e3f6ba528d76450ac949.png';
import img2 from 'figma:asset/3976be47e4190d18a738dedbeb3ac96221c6c101.png';
import img3 from 'figma:asset/421e44d36e14dee66a0a1ff99a2b4e3dc34150ad.png';
import img4 from 'figma:asset/4bfb016c30178cac0fd6016ed541b8df4380f18f.png';
import img5 from 'figma:asset/36f854256560dfcfb8c919a5776a411f0c3c8422.png';
import img6 from 'figma:asset/335b66cb51969fc7c9a2c97186c9aa7dee54ed2f.png';
import img7 from 'figma:asset/98a7d0f5d1022bd53d3508b351bacc1e15f89655.png';
import img8 from 'figma:asset/76c9e9fb732fce98feb10ecd16537ebe409ebec5.png';

const galleryImages = [
  img1, img2, img3, img4, img5, img6, img7, img8
];

// Helper function to ensure URLs have https:// prefix
const ensureHttps = (url: string): string => {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
};

export function GallerySection() {
  const { t } = useLanguage();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [socialMedia, setSocialMedia] = useState({
    facebook: '',
    instagram: '',
  });

  // Fetch social media links
  useEffect(() => {
    const fetchSocialMedia = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/settings/social-media`,
          {
            headers: { Authorization: `Bearer ${publicAnonKey}` },
          }
        );
        const result = await response.json();
        
        if (result.success && result.data) {
          setSocialMedia({
            facebook: result.data.facebook || '',
            instagram: result.data.instagram || '',
          });
        }
      } catch (error) {
        console.error('Failed to fetch social media links:', error);
      }
    };

    fetchSocialMedia();
  }, []);

  const showNext = useCallback((e?: any) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev === null ? null : (prev + 1) % galleryImages.length));
  }, []);

  const showPrev = useCallback((e?: any) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev === null ? null : (prev - 1 + galleryImages.length) % galleryImages.length));
  }, []);

  const closeLightbox = useCallback(() => setSelectedIndex(null), []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, showNext, showPrev, closeLightbox]);

  return (
    <div className="w-full bg-black py-12 pb-0">
       <div className="relative w-full overflow-hidden mb-0">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none"></div>
          
          <div className="flex w-full mb-12">
             <motion.div 
               className="flex gap-4"
               animate={{ x: "-50%" }}
               transition={{ 
                 repeat: Infinity, 
                 ease: "linear", 
                 duration: 40 
               }}
               style={{ width: "fit-content" }}
             >
                {[...Array(2)].map((_, setIndex) => (
                   <div key={setIndex} className="flex gap-4">
                      {galleryImages.map((img, i) => (
                         <div 
                           key={i} 
                           onClick={() => setSelectedIndex(i)}
                           className="relative w-[300px] h-[200px] rounded-lg overflow-hidden flex-shrink-0 group grayscale hover:grayscale-0 transition-all duration-500 cursor-pointer border border-white/10"
                         >
                            <ImageWithFallback 
                              src={img} 
                              alt="Gallery" 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors"></div>
                            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                               <div className="bg-[#FF9800] p-2 rounded-full">
                                  <Play className="h-4 w-4 text-black fill-current" />
                               </div>
                            </div>
                         </div>
                      ))}
                   </div>
                ))}
             </motion.div>
          </div>
          
          {/* Social Media CTA Bar */}
          <a 
            href={socialMedia.instagram ? ensureHttps(socialMedia.instagram) : (socialMedia.facebook ? ensureHttps(socialMedia.facebook) : '#')} 
            target={socialMedia.instagram || socialMedia.facebook ? '_blank' : '_self'}
            rel={socialMedia.instagram || socialMedia.facebook ? 'noopener noreferrer' : undefined}
            className="block bg-[#0f172a] border-t border-white/10 py-5 hover:bg-[#FF9800] hover:text-black transition-colors group"
          >
             <div className="flex items-center justify-center gap-3 text-white group-hover:text-black text-xs font-bold tracking-[0.2em] uppercase">
                {socialMedia.instagram ? (
                  <>
                    <Instagram className="h-4 w-4" />
                    Follow us on Instagram
                  </>
                ) : socialMedia.facebook ? (
                  <>
                    <Facebook className="h-4 w-4" />
                    Follow us on Facebook
                  </>
                ) : (
                  <>
                    <Instagram className="h-4 w-4" />
                    {t('ready_cta.instagram')}
                  </>
                )}
             </div>
          </a>
       </div>

       {/* Lightbox */}
       <AnimatePresence>
         {selectedIndex !== null && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
             onClick={closeLightbox}
           >
             <button 
               onClick={closeLightbox}
               className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-50 p-2"
             >
               <X className="w-8 h-8" />
             </button>

             <div className="relative w-full max-w-5xl aspect-video flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
               <button 
                 onClick={showPrev}
                 className="absolute left-0 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-[#FF9800] transition-colors z-50"
               >
                 <ChevronLeft className="w-10 h-10" />
               </button>

               <motion.div
                 key={selectedIndex}
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 transition={{ duration: 0.2 }}
                 className="relative w-full h-full flex items-center justify-center"
               >
                 <ImageWithFallback 
                    src={galleryImages[selectedIndex]} 
                    alt="Gallery View" 
                    className="max-w-full max-h-[80vh] object-contain rounded-md shadow-2xl"
                 />
               </motion.div>

               <button 
                 onClick={showNext}
                 className="absolute right-0 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-[#FF9800] transition-colors z-50"
               >
                 <ChevronRight className="w-10 h-10" />
               </button>
             </div>
             
             <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
               {galleryImages.map((_, idx) => (
                 <button
                   key={idx}
                   onClick={(e) => {
                     e.stopPropagation();
                     setSelectedIndex(idx);
                   }}
                   className={`w-2 h-2 rounded-full transition-colors ${
                     idx === selectedIndex ? 'bg-[#FF9800]' : 'bg-white/20 hover:bg-white/40'
                   }`}
                 />
               ))}
             </div>
           </motion.div>
         )}
       </AnimatePresence>
    </div>
  );
}