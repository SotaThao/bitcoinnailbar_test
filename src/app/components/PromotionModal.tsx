import { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

interface PromotionLanguageData {
  badge?: string;
  title: string;
  subtitle?: string;
  discount: string;
  description: string;
  days?: string;
  time?: string;
  buttonText: string;
  buttonLink: string;
  backgroundImage?: string;
  iconImage?: string;
}

interface Promotion {
  id: string;
  type: 'crypto' | 'golden-hour' | 'vip-royalty';
  enabled: boolean;
  featured: boolean;
  vi: PromotionLanguageData;
  en: PromotionLanguageData;
}

interface PromotionModalProps {
  promotions: Promotion[];
  onClose: () => void;
  language?: 'vi' | 'en';
  onRendered?: () => void; // Callback khi modal đã render xong
}

export function PromotionModal({ promotions, onClose, language = 'en', onRendered }: PromotionModalProps) {
  const location = useLocation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dontShowToday, setDontShowToday] = useState(false);

  // Filter only featured and enabled promotions
  const featuredPromotions = promotions.filter(p => p.enabled && p.featured);

  // Notify parent when modal is rendered
  useEffect(() => {
    if (onRendered && featuredPromotions.length > 0) {
      // Small delay to ensure DOM is painted
      const timer = setTimeout(onRendered, 100);
      return () => clearTimeout(timer);
    }
  }, [onRendered]);

  // Auto-slide every 6 seconds
  useEffect(() => {
    if (featuredPromotions.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredPromotions.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [featuredPromotions.length]);

  // Handle close with localStorage
  const handleClose = () => {
    if (dontShowToday) {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      localStorage.setItem('promotion-dismissed-date', today);
    }
    onClose();
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Navigation handlers
  const handlePrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredPromotions.length) % featuredPromotions.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredPromotions.length);
  };

  const handleDotClick = (index: number) => {
    setCurrentSlide(index);
  };

  // Handle CTA button click
  const handleButtonClick = (link: string) => {
    if (link.startsWith('#')) {
      // Internal link - scroll to section
      const element = document.querySelector(link);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        handleClose();
      }
    } else {
      // External link - open in same tab
      window.location.href = link;
    }
  };

  // Logic: Only show modal on homepage
  if (location.pathname !== '/') {
    return null;
  }

  if (featuredPromotions.length === 0) return null;

  const currentPromotion = featuredPromotions[currentSlide];
  const data = currentPromotion[language];
  
  // More robust check for background image
  // Sometimes API might return "null", "undefined" strings or just whitespace
  const hasBackgroundImage = Boolean(
    data.backgroundImage && 
    data.backgroundImage.trim() !== '' && 
    data.backgroundImage !== 'null' && 
    data.backgroundImage !== 'undefined'
  );

  console.log('🔍 Promotion Modal Render:', {
    promotionId: currentPromotion.id,
    promotionType: currentPromotion.type,
    language,
    title: data.title,
    backgroundImage: data.backgroundImage,
    backgroundImagePath: (currentPromotion[language] as any).backgroundImagePath,
    hasBackgroundImage,
    mode: hasBackgroundImage ? 'WITH_BACKGROUND' : 'NO_BACKGROUND'
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center rounded-full transition-colors backdrop-blur-sm bg-black/20 hover:bg-black/40 text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Carousel Container */}
        <div className="relative">
          {/* WITH Background Image - Only show image, no text */}
          {hasBackgroundImage ? (
            <div 
              className="relative min-h-[400px] md:min-h-[500px] flex items-center justify-center cursor-pointer"
              onClick={() => handleButtonClick(data.buttonLink)}
            >
              {/* Background Image - Full Display */}
              <img
                src={data.backgroundImage}
                alt="Promotion"
                className="max-w-full max-h-[500px] object-contain rounded-2xl"
                onError={(e) => {
                  console.error('❌ Failed to load background image:', data.backgroundImage);
                  e.currentTarget.style.display = 'none';
                }}
                onLoad={() => {
                  console.log('✅ Background image loaded successfully:', data.backgroundImage);
                }}
              />
            </div>
          ) : (
            /* WITHOUT Background Image - Dark Theme (Homepage Style) */
            <div className="relative p-8 md:p-16 min-h-[400px] md:min-h-[500px] flex flex-col items-center justify-center text-center bg-[#0B0F19]">
              {/* Icon (if available) */}
              {data.iconImage && (
                <div className="mb-6">
                  <img src={data.iconImage} alt="Icon" className="h-16 md:h-20 w-auto mx-auto drop-shadow-lg" />
                </div>
              )}

              {/* Badge */}
              {data.badge && (
                <div className="mb-4">
                  <span className="inline-block px-4 py-2 bg-white/10 rounded-lg text-xs md:text-sm font-bold tracking-wide text-white uppercase border border-white/10">
                    {data.badge}
                  </span>
                </div>
              )}

              {/* Discount - Orange Box (Prominent) */}
              <div className="mb-6">
                <div className="inline-block px-8 py-4 bg-[#F97316] rounded-2xl shadow-[0_0_30px_rgba(249,115,22,0.3)]">
                  <span className="text-3xl md:text-5xl font-black text-white">
                    {data.discount}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl md:text-4xl font-black mb-2 leading-tight text-white max-w-md">
                {data.title}
                {data.subtitle && (
                  <span className="block text-[#F97316]">{data.subtitle}</span>
                )}
              </h2>

              {/* Days & Time (Golden Hour) */}
              {data.days && data.time && (
                <div className="mb-4 space-y-1">
                  <p className="text-base md:text-lg font-semibold text-gray-200">{data.days}</p>
                  <p className="text-sm md:text-base text-gray-400">{data.time}</p>
                </div>
              )}

              {/* Description */}
              <p className="text-sm md:text-base text-gray-400 mb-8 max-w-md leading-relaxed">
                {data.description}
              </p>

              {/* CTA Button - Outlined Style */}
              <div>
                <Button
                  onClick={() => handleButtonClick(data.buttonLink)}
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-black font-bold text-sm md:text-base px-8 md:px-10 py-5 md:py-6 rounded-lg shadow-md transition-all uppercase tracking-wide"
                >
                  {data.buttonText}
                </Button>
              </div>
            </div>
          )}

          {/* Navigation Arrows (only if multiple promotions) */}
          {featuredPromotions.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full transition-colors backdrop-blur-sm ${
                  hasBackgroundImage
                    ? 'bg-white/20 hover:bg-white/40 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <button
                onClick={handleNext}
                className={`absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full transition-colors backdrop-blur-sm ${
                  hasBackgroundImage
                    ? 'bg-white/20 hover:bg-white/40 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-black/20 backdrop-blur-md p-4 border-t border-white/10">
          <div className="flex items-center justify-between gap-4">
            {/* Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-400 hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={dontShowToday}
                onChange={(e) => setDontShowToday(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 text-[#F97316] focus:ring-[#F97316] cursor-pointer bg-transparent"
              />
              <span>{language === 'vi' ? 'Không hiển thị hôm nay' : "Don't show this today"}</span>
            </label>

            {/* Dots Indicator */}
            {featuredPromotions.length > 1 && (
              <div className="flex items-center gap-2">
                {featuredPromotions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleDotClick(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentSlide
                        ? 'bg-[#F97316] w-6'
                        : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}