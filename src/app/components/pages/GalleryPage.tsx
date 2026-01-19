import { useState, useEffect, useCallback } from 'react';
import PublicLayout from '../PublicLayout';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { X, ZoomIn, ChevronLeft, ChevronRight, Instagram } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../ui/button';

// Import images exactly as they are in GallerySection to reuse assets
import img1 from 'figma:asset/490a930e6c326d1add62e3f6ba528d76450ac949.png';
import img2 from 'figma:asset/3976be47e4190d18a738dedbeb3ac96221c6c101.png';
import img3 from 'figma:asset/421e44d36e14dee66a0a1ff99a2b4e3dc34150ad.png';
import img4 from 'figma:asset/4bfb016c30178cac0fd6016ed541b8df4380f18f.png';
import img5 from 'figma:asset/36f854256560dfcfb8c919a5776a411f0c3c8422.png';
import img6 from 'figma:asset/335b66cb51969fc7c9a2c97186c9aa7dee54ed2f.png';
import img7 from 'figma:asset/98a7d0f5d1022bd53d3508b351bacc1e15f89655.png';
import img8 from 'figma:asset/76c9e9fb732fce98feb10ecd16537ebe409ebec5.png';

const galleryImages = [
  { src: img1, category: 'Interior' },
  { src: img2, category: 'Nail Art' },
  { src: img3, category: 'Pedicure' },
  { src: img4, category: 'Atmosphere' },
  { src: img5, category: 'Interior' },
  { src: img6, category: 'Nail Art' },
  { src: img7, category: 'Relaxation' },
  { src: img8, category: 'Bar' },
];

const categories = ['All', 'Interior', 'Nail Art', 'Atmosphere'];

export default function GalleryPage() {
  const { t } = useLanguage();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  
  const filteredImages = activeCategory === 'All' 
    ? galleryImages 
    : galleryImages.filter(img => img.category === activeCategory || img.category === 'All'); // Simple fallback

  // Find the index in the original array for lightbox navigation
  const getOriginalIndex = (filteredIndex: number) => {
    const img = filteredImages[filteredIndex];
    return galleryImages.findIndex(i => i === img);
  };

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
    <PublicLayout>
      <div className="min-h-screen bg-[#0B0F19] py-10">
        <div className="container mx-auto px-4">
          
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 space-y-4"
          >
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4">
              {t('nav.gallery') || 'Our Gallery'}
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Experience the luxury and artistry of Bitcoin Nail Bar. From our premium interiors to our exquisite nail art designs.
            </p>
          </motion.div>

          {/* Categories */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-full text-sm font-bold tracking-widest uppercase transition-all duration-300 ${
                  activeCategory === cat 
                    ? 'bg-[#FF9800] text-black shadow-lg shadow-[#FF9800]/20 scale-105' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>

          {/* Masonry-style Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode='popLayout'>
              {filteredImages.map((img, index) => {
                const originalIndex = galleryImages.indexOf(img);
                return (
                  <motion.div
                    key={originalIndex}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="group relative aspect-[4/5] rounded-xl overflow-hidden cursor-pointer bg-white/5"
                    onClick={() => setSelectedIndex(originalIndex)}
                  >
                    <ImageWithFallback 
                      src={img.src} 
                      alt={`Gallery Image ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <div className="w-12 h-12 rounded-full bg-[#FF9800] flex items-center justify-center shadow-xl">
                          <ZoomIn className="h-5 w-5 text-black" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Instagram CTA */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-20 text-center"
          >
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-bold tracking-wider uppercase hover:shadow-lg hover:shadow-purple-500/30 transition-all transform hover:-translate-y-1"
            >
              <Instagram className="h-5 w-5" />
              Follow us on Instagram
            </a>
          </motion.div>
        </div>

        {/* Lightbox */}
        <AnimatePresence>
          {selectedIndex !== null && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md p-4"
              onClick={closeLightbox}
            >
              <button 
                onClick={closeLightbox}
                className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-50 p-2"
              >
                <X className="w-8 h-8" />
              </button>

              <div className="relative w-full max-w-6xl aspect-[16/9] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                <button 
                  onClick={showPrev}
                  className="absolute left-2 lg:-left-12 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-[#FF9800] transition-colors z-50"
                >
                  <ChevronLeft className="w-10 h-10" />
                </button>

                <motion.div
                  key={selectedIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-full h-full flex items-center justify-center"
                >
                  <ImageWithFallback 
                    src={galleryImages[selectedIndex].src} 
                    alt="Gallery View" 
                    className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                  />
                </motion.div>

                <button 
                  onClick={showNext}
                  className="absolute right-2 lg:-right-12 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-[#FF9800] transition-colors z-50"
                >
                  <ChevronRight className="w-10 h-10" />
                </button>
              </div>

              {/* Thumbnails */}
              <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 overflow-x-auto px-4 py-2">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedIndex(idx);
                    }}
                    className={`relative w-12 h-12 flex-shrink-0 rounded-md overflow-hidden transition-all ${
                      idx === selectedIndex ? 'ring-2 ring-[#FF9800] opacity-100 scale-110' : 'opacity-40 hover:opacity-100'
                    }`}
                  >
                     <ImageWithFallback 
                        src={img.src} 
                        alt="thumbnail" 
                        className="w-full h-full object-cover"
                     />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PublicLayout>
  );
}