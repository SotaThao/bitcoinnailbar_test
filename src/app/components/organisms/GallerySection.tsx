import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, X, Instagram, Facebook } from 'lucide-react';
import { Button } from '../ui/button';
import { useLanguage } from '../../context/LanguageContext';
import { projectId, publicAnonKey } from '@utils/supabase/info';
import { optimizeCloudinaryUrl, optimizeCloudinaryThumbnail } from '@/utils/cloudinary';

interface GalleryImage {
  id: string;
  cloudinary_url: string;
  order: number;
}

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
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [socialMedia, setSocialMedia] = useState({
    facebook: '',
    instagram: '',
  });

  // Fetch gallery images from backend
  useEffect(() => {
    const fetchGalleryImages = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/gallery/images`,
          {
            headers: { Authorization: `Bearer ${publicAnonKey}` },
          }
        );
        const result = await response.json();
        
        if (result.success && result.data) {
          setGalleryImages(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch gallery images:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryImages();
  }, []);

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
  }, [galleryImages.length]);

  const showPrev = useCallback((e?: any) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev === null ? null : (prev - 1 + galleryImages.length) % galleryImages.length));
  }, [galleryImages.length]);

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

  // Don't render if no images
  if (loading || galleryImages.length === 0) {
    return null;
  }

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
                 duration: galleryImages.length * 3 // 3 seconds per image
               }}
               style={{ width: "fit-content" }}
             >
                {[...Array(2)].map((_, setIndex) => (
                   <div key={setIndex} className="flex gap-4">
                      {galleryImages.map((img, i) => (
                         <div 
                           key={img.id} 
                           onClick={() => setSelectedIndex(i)}
                           className="relative w-[300px] h-[200px] rounded-lg overflow-hidden flex-shrink-0 group grayscale hover:grayscale-0 transition-all duration-500 cursor-pointer border border-white/10"
                         >
                            <img 
                              src={optimizeCloudinaryThumbnail(img.cloudinary_url, 500)} 
                              alt={`Gallery ${i + 1}`} 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors"></div>
                            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                               <div className="bg-[#FF9800] p-2 rounded-full">
                                  <X className="h-4 w-4 text-black fill-current" />
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
                 <img 
                    src={optimizeCloudinaryUrl(galleryImages[selectedIndex].cloudinary_url, { width: 1920 })} 
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