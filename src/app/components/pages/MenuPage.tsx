import { useState, useEffect, useRef, forwardRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { ChevronLeft, ChevronRight, Loader2, ImageOff } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import PublicLayout from '../PublicLayout';
import { useLocation, Link } from 'react-router-dom';

interface MenuImage {
  id: string;
  cloudinary_url: string;
  order: number;
}

// Using forwardRef properly for react-pageflip library
const PageImage = forwardRef<HTMLDivElement, { image: MenuImage }>(function PageImage({ image }, ref) {
  return (
    <div ref={ref} className="h-full w-full bg-white lg:bg-transparent flex items-center justify-center relative overflow-hidden">
      <img
        src={image.cloudinary_url}
        alt={`Menu page ${image.order + 1}`}
        className="w-full h-full object-contain"
        loading="lazy"
      />
    </div>
  );
});

PageImage.displayName = 'PageImage';

export default function MenuPage() {
  const location = useLocation();
  const [images, setImages] = useState<MenuImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 400, height: 600 });
  const flipBookRef = useRef<any>(null);
  
  // Touch handling for mobile - prevent accidental flips
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [swipeDistance, setSwipeDistance] = useState(80);

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchImages();
    calculateDimensions();
    window.addEventListener('resize', calculateDimensions);
    return () => window.removeEventListener('resize', calculateDimensions);
  }, []);

  // Navigate to the correct page when URL has page parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pageParam = params.get('page');
    
    if (pageParam && images.length > 0 && flipBookRef.current) {
      const pageIndex = parseInt(pageParam, 10);
      // Find the index of the image with matching order
      const targetIndex = images.findIndex(img => img.order === pageIndex);
      
      if (targetIndex !== -1) {
        // Wait a bit for flipbook to initialize
        setTimeout(() => {
          flipBookRef.current?.pageFlip()?.flip(targetIndex);
        }, 100);
      }
    }
  }, [location.search, images]);

  const calculateDimensions = () => {
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    
    // Determine if desktop or mobile
    const isDesktop = vw >= 1024; // lg breakpoint
    
    // Calculate swipe threshold: 1/3 of screen width on mobile
    if (!isDesktop) {
      const threshold = Math.floor(vw / 3);
      setSwipeDistance(threshold);
    }
    
    // On desktop, limit to 80% of viewport height
    // On mobile, use 92% of viewport height to maximize space and get close to navbar
    const maxHeightRatio = isDesktop ? 0.8 : 0.92;
    const availableHeight = vh * maxHeightRatio;
    
    // Reserve space for arrows (approx 80px each side) + padding
    const availableWidth = vw - 160;
    
    // Calculate dimensions maintaining aspect ratio (portrait page)
    const aspectRatio = 0.707; // A4 portrait ratio (1/√2)
    
    // Check if we need to fit single page (mobile/portrait) or double page (desktop)
    // For now assuming single page centered based on previous code's usePortrait={true}
    
    let width = Math.min(availableWidth, availableHeight * aspectRatio);
    let height = width / aspectRatio;
    
    // Ensure it doesn't exceed available height
    if (height > availableHeight) {
      height = availableHeight;
      width = height * aspectRatio;
    }
    
    // Add extra height: 80px on desktop, 280px on mobile
    const extraHeight = isDesktop ? 80 : 280;
    height = height + extraHeight;
    // Recalculate width to maintain aspect ratio
    width = height * aspectRatio;
    
    // Soft constraints - allow smaller sizes for small screens
    width = Math.max(200, Math.min(width, 800));
    height = Math.max(282, Math.min(height, 1080));
    
    setDimensions({ width: Math.floor(width), height: Math.floor(height) });
  };

  const fetchImages = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/menu/images`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );
      const data = await response.json();
      if (data.success) {
        setImages(data.data);
      } else {
        setError('Failed to load menu');
      }
    } catch (err) {
      console.error('Error fetching menu images:', err);
      setError('Unable to load menu. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const onFlip = (e: any) => {
    setCurrentPage(e.data);
  };

  const nextPage = () => {
    flipBookRef.current?.pageFlip()?.flipNext();
  };

  const prevPage = () => {
    flipBookRef.current?.pageFlip()?.flipPrev();
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 
              className="w-16 h-16 text-[#FF9800] animate-spin mx-auto mb-4" 
              style={{ filter: 'drop-shadow(0 0 10px rgba(255, 152, 0, 0.5))' }}
            />
            <p className="text-gray-300 text-lg">Loading menu...</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (error || images.length === 0) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <ImageOff className="w-20 h-20 text-[#FF9800]/50 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-200 mb-2">Menu Not Available</h2>
            <p className="text-gray-400">
              {error || 'No menu images have been uploaded yet. Please check back later.'}
            </p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const totalPages = images.length; // Only count actual images

  return (
    <PublicLayout>
      <div className="relative w-full max-w-6xl mx-auto">
        <div className="flex items-center justify-center">
          {/* Left Arrow */}
          <button
            onClick={prevPage}
            disabled={currentPage === 0}
            className="absolute left-0 z-10 p-3 md:p-4 rounded-full backdrop-blur-md border border-white/10 text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#FF9800]/50 hover:bg-black/60"
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              boxShadow: '0 0 20px rgba(255, 152, 0, 0.3)',
            }}
          >
            <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
          </button>

          {/* FlipBook */}
          <div className="shadow-2xl" style={{ perspective: '1500px' }}>
            <HTMLFlipBook
              ref={flipBookRef}
              width={dimensions.width}
              height={dimensions.height}
              size="fixed"
              minWidth={200}
              maxWidth={800}
              minHeight={280}
              maxHeight={1000}
              showCover={false}
              mobileScrollSupport={true}
              onFlip={onFlip}
              className="flipbook-container"
              style={{}}
              startPage={0}
              drawShadow={true}
              flippingTime={800}
              usePortrait={true}
              startZIndex={0}
              autoSize={false}
              maxShadowOpacity={0.5}
              showPageCorners={true}
              disableFlipByClick={isMobile}
              clickEventForward={true}
              swipeDistance={isMobile ? swipeDistance : 30}
              useMouseEvents={!isMobile}
            >
              {/* Menu Images Only */}
              {images.map((image) => (
                <PageImage key={image.id} image={image} />
              ))}
            </HTMLFlipBook>
          </div>

          {/* Right Arrow */}
          <button
            onClick={nextPage}
            disabled={currentPage >= totalPages - 1}
            className="absolute right-0 z-10 p-3 md:p-4 rounded-full backdrop-blur-md border border-white/10 text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#FF9800]/50 hover:bg-black/60"
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              boxShadow: '0 0 20px rgba(255, 152, 0, 0.3)',
            }}
          >
            <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
          </button>
        </div>

        {/* Page Indicator */}
        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            Page {currentPage + 1} of {totalPages}
          </p>
          {isMobile && (
            <p className="text-gray-500 text-xs mt-2">
              Use arrows or swipe to navigate
            </p>
          )}
        </div>

        {/* Page Indicator Dots */}
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => flipBookRef.current?.pageFlip()?.flip(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentPage
                  ? 'bg-[#FF9800] w-8'
                  : 'bg-white/20 hover:bg-[#FF9800]/50'
              }`}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}