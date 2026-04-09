import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { QRCodeSVG } from 'qrcode.react';

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
  videoUrl?: string;
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
  onRendered?: () => void;
}

export function PromotionModal({ promotions, onClose, language = 'en', onRendered }: PromotionModalProps) {
  const location = useLocation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dontShowToday, setDontShowToday] = useState(false);

  // Filter only featured and enabled promotions, newest first
  const featuredPromotions = promotions
    .filter(p => p.enabled && p.featured)
    .sort((a, b) => {
      const aNum = Number(a.id);
      const bNum = Number(b.id);
      const aIsNumeric = !isNaN(aNum);
      const bIsNumeric = !isNaN(bNum);
      if (aIsNumeric && bIsNumeric) return bNum - aNum;
      if (aIsNumeric && !bIsNumeric) return -1;
      if (!aIsNumeric && bIsNumeric) return 1;
      return 0;
    });

  // Notify parent when modal is rendered
  useEffect(() => {
    if (onRendered && featuredPromotions.length > 0) {
      const timer = setTimeout(onRendered, 100);
      return () => clearTimeout(timer);
    }
  }, [onRendered]);

  // Auto-slide every 10 seconds
  useEffect(() => {
    if (featuredPromotions.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredPromotions.length);
    }, 15000);

    return () => clearInterval(interval);
  }, [featuredPromotions.length]);

  // Handle close with localStorage
  const handleClose = () => {
    if (dontShowToday) {
      const today = new Date().toISOString().split('T')[0];
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
    if (!link || link === '#') {
      handleClose();
      return;
    }
    
    if (link.startsWith('#')) {
      try {
        const element = document.querySelector(link);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          handleClose();
        }
      } catch (error) {
        console.error('Invalid selector:', link, error);
        handleClose();
      }
    } else {
      window.open(link, '_blank', 'noopener,noreferrer');
      handleClose();
    }
  };

  // Logic: Only show modal on homepage
  if (location.pathname !== '/') {
    return null;
  }

  if (featuredPromotions.length === 0) return null;

  const currentPromotion = featuredPromotions[currentSlide];
  const data = currentPromotion[language];
  
  const hasBackgroundImage = Boolean(
    data.backgroundImage &&
    data.backgroundImage.trim() !== '' &&
    data.backgroundImage !== 'null' &&
    data.backgroundImage !== 'undefined'
  );

  // Helper function to convert video URLs to embed format
  const getVideoEmbedUrl = (url: string): string | null => {
    if (!url) return null;

    // YouTube watch URL
    const ytMatch = url.match(/^(?:(https?):\/\/)?(?:(?:www|m)\.)?youtube\.com\/watch.*v=([a-zA-Z0-9_-]+)/);
    if (ytMatch) {
      return `${ytMatch[1] || "https"}://www.youtube.com/embed/${ytMatch[2]}?autoplay=1&mute=1&loop=1&playlist=${ytMatch[2]}&showinfo=0&controls=0`;
    }

    // YouTube short URL
    const ytShortMatch = url.match(/^(?:(https?):\/\/)?(?:(?:www|m)\.)?youtu\.be\/([a-zA-Z0-9_-]+)/);
    if (ytShortMatch) {
      return `${ytShortMatch[1] || "https"}://www.youtube.com/embed/${ytShortMatch[2]}?autoplay=1&mute=1&loop=1&playlist=${ytShortMatch[2]}&showinfo=0&controls=0`;
    }

    // Vimeo URL
    const vimeoMatch = url.match(/^(?:(https?):\/\/)?(?:www\.)?vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `${vimeoMatch[1] || "https"}://player.vimeo.com/video/${vimeoMatch[2]}?autoplay=1&mute=1&loop=1&background=1`;
    }

    // Direct video URL (.mp4, .webm)
    if (url.match(/\.(mp4|webm)(\?.*)?$/i)) {
      return url;
    }

    // Already an embed URL
    if (url.includes('/embed/') || url.includes('/video/')) {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}autoplay=1&mute=1&loop=1&controls=0`;
    }

    return null;
  };

  const videoEmbedUrl = data.videoUrl ? getVideoEmbedUrl(data.videoUrl) : null;
  const hasVideo = Boolean(videoEmbedUrl);
  const isDirectVideo = data.videoUrl?.match(/\.(mp4|webm)(\?.*)?$/i);

  const hasBackground = hasBackgroundImage || hasVideo;

  console.log('🔍 Promotion Modal Render:', {
    promotionId: currentPromotion.id,
    promotionType: currentPromotion.type,
    language,
    title: data.title,
    backgroundImage: data.backgroundImage,
    videoUrl: data.videoUrl,
    backgroundImagePath: (currentPromotion[language] as any).backgroundImagePath,
    hasBackgroundImage,
    hasVideo,
    hasBackground,
    mode: hasBackground ? 'WITH_BACKGROUND' : 'NO_BACKGROUND'
  });

  return (
    <>
      {/* Add global styles for rich text content */}
      <style>{`
        .promotion-description p {
          margin-bottom: 0.5rem;
        }
        .promotion-description p:last-child {
          margin-bottom: 0;
        }
        .promotion-description strong {
          font-weight: 900;
          color: white;
        }
        .promotion-description em {
          font-style: italic;
          color: #FB923C;
        }
        .promotion-description ul {
          list-style: none;
          margin-top: 0.75rem;
          margin-bottom: 0.75rem;
          padding-left: 0;
        }
        .promotion-description ul li {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          margin-bottom: 0.375rem;
        }
        .promotion-description ul li::before {
          content: "•";
          color: #F97316;
          font-weight: bold;
          flex-shrink: 0;
          margin-top: 0.125rem;
        }
        .promotion-description ol {
          list-style: decimal;
          margin-top: 0.75rem;
          margin-bottom: 0.75rem;
          padding-left: 1.5rem;
        }
        .promotion-description ol li {
          margin-bottom: 0.375rem;
        }
        .promotion-description a {
          color: #F97316;
          text-decoration: underline;
          font-weight: 600;
          transition: color 0.2s;
        }
        .promotion-description a:hover {
          color: #FB923C;
        }
        .promotion-description h1,
        .promotion-description h2 {
          font-weight: 900;
          color: white;
          margin-bottom: 0.5rem;
        }
        .promotion-description h1 {
          font-size: 1.5rem;
        }
        .promotion-description h2 {
          font-size: 1.25rem;
        }
      `}</style>

      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
        onClick={handleBackdropClick}
      >
        <div className="relative w-full max-w-2xl my-auto rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 max-h-[calc(100vh-2rem)] flex flex-col">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center rounded-full transition-colors backdrop-blur-sm bg-black/20 hover:bg-black/40 text-white"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Carousel Container - Scrollable */}
          <div className="relative overflow-y-auto flex-1">
            {/* WITH Background Image or Video - Only show media, no text */}
            {hasBackground ? (
              <div
                className="relative min-h-[400px] md:min-h-[500px] flex items-center justify-center cursor-pointer bg-transparent"
                onClick={() => handleButtonClick(data.buttonLink)}
              >
                {/* Background Video */}
                {hasVideo ? (
                  isDirectVideo ? (
                    <video
                      src={videoEmbedUrl!}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="max-w-full max-h-[500px] object-contain rounded-2xl"
                    />
                  ) : (
                    <iframe
                      src={videoEmbedUrl!}
                      className="w-full h-[500px] rounded-2xl pointer-events-none"
                      allow="autoplay; encrypted-media"
                      allowFullScreen={false}
                      tabIndex={-1}
                    />
                  )
                ) : (
                  /* Background Image */
                  <img
                    src={data.backgroundImage}
                    alt="Promotion"
                    className="max-w-full max-h-[500px] object-contain rounded-2xl"
                    onError={(e) => {
                      console.error('Failed to load background image:', data.backgroundImage);
                      e.currentTarget.style.display = 'none';
                    }}
                    onLoad={() => {
                      console.log('Background image loaded successfully:', data.backgroundImage);
                    }}
                  />
                )}
              </div>
            ) : (
              /* WITHOUT Background Image - Dark Theme (Homepage Style) */
              <div className="relative p-4 sm:p-8 md:p-12 min-h-0 flex flex-col items-center justify-center text-center overflow-hidden">
                {/* Liquid Glass Background Layers */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0B0F19]/90 via-[#1a1f2e]/80 to-[#0B0F19]/90 backdrop-blur-3xl"></div>
                
                {/* Animated liquid orbs */}
                <div className="absolute top-20 -left-20 w-80 h-80 bg-gradient-to-br from-[#F97316]/30 to-[#FB923C]/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 -right-20 w-96 h-96 bg-gradient-to-tl from-[#FB923C]/25 to-[#F97316]/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-[#F97316]/10 to-[#FB923C]/10 rounded-full blur-2xl animate-pulse delay-500"></div>
                
                {/* Glass reflection overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-50"
                  style={{
                    animation: 'pulse-glow 2s ease-in-out infinite, shimmer-sweep 3s ease-in-out infinite',
                  }}
                ></div>
                <style>{`
                  @keyframes pulse-glow {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.02); }
                  }
                  @keyframes shimmer-sweep {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                  }
                `}</style>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.1),transparent_50%)] pointer-events-none"></div>

                {/* Content wrapper with relative positioning */}
                <div className="relative z-10 w-full flex flex-col items-center py-4">
                  {/* Badge - Liquid Glass Pill */}
                  {data.badge && (
                    <div className="mb-4 md:mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
                      <span className="inline-block px-4 py-2 md:px-6 md:py-3 bg-white/10 backdrop-blur-xl rounded-full text-xs md:text-sm font-black tracking-widest text-[#F97316] uppercase border border-white/20 shadow-lg relative overflow-hidden group">
                        {/* Glass shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        <span className="relative z-10">{data.badge}</span>
                      </span>
                    </div>
                  )}

                  {/* Title - Frosted Glass Text */}
                  <h2 className="text-2xl sm:text-3xl md:text-5xl font-black mb-2 md:mb-3 leading-tight text-white max-w-2xl tracking-tight animate-in fade-in slide-in-from-top-6 duration-700 drop-shadow-[0_0_25px_rgba(249,115,22,0.3)] px-2">
                    {data.title}
                  </h2>

                  {/* Subtitle - Liquid Gradient with Glass Underline */}
                  {data.subtitle && (
                    <div className="mb-4 md:mb-8 animate-in fade-in slide-in-from-top-8 duration-900">
                      <p className="text-lg sm:text-xl md:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#F97316] via-[#FB923C] to-[#FDBA74] tracking-wide drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]">
                        {data.subtitle}
                      </p>
                      <div className="mt-2 md:mt-3 h-1 w-24 mx-auto bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full backdrop-blur-sm"></div>
                    </div>
                  )}

                  {/* Discount/Offer - Premium Liquid Glass Card */}
                  {data.discount && (
                    <div className="mb-8 w-full max-w-xl animate-in fade-in zoom-in-95 duration-1000 delay-200">
                      <div className="relative group">
                        {/* Outer glow halo */}
                        <div className="absolute -inset-2 bg-gradient-to-r from-[#F97316]/40 via-[#FB923C]/30 to-[#FDBA74]/40 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-700 animate-pulse"></div>
                        
                        {/* Glass card container */}
                        <div className="relative bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-[0_8px_32px_0_rgba(249,115,22,0.2)]">
                          {/* Liquid shimmer overlay */}
                          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-50"></div>
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),transparent_60%)]"></div>
                          
                          {/* Animated liquid edge glow */}
                          <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
                            <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-white/60 to-transparent"></div>
                            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
                            <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-white/60 to-transparent"></div>
                          </div>

                          {/* Content */}
                          <div className="relative px-8 py-8 rounded-[16px]">
                            {/* Floating star icon */}
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-gradient-to-br from-[#F97316] to-[#FB923C] rounded-full flex items-center justify-center shadow-lg shadow-[#F97316]/50 backdrop-blur-sm border border-white/30">
                              <svg className="w-4 h-4 text-white animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </div>
                            
                            {/* Floating particles effect */}
                            <div className="absolute top-4 left-6 w-1 h-1 bg-white/40 rounded-full animate-pulse"></div>
                            <div className="absolute top-8 right-8 w-1.5 h-1.5 bg-[#F97316]/60 rounded-full animate-pulse delay-300"></div>
                            <div className="absolute bottom-6 left-10 w-1 h-1 bg-[#FB923C]/50 rounded-full animate-pulse delay-700"></div>
                            
                            {/* Main discount text with enhanced styling */}
                            <div className="relative space-y-2">
                              {/* Top accent line */}
                              <div className="flex items-center gap-2 justify-center mb-3">
                                <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#F97316]/60"></div>
                                <div className="w-1.5 h-1.5 bg-[#F97316] rounded-full"></div>
                                <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#F97316]/60"></div>
                              </div>
                              
                              {/* Discount text */}
                              <p className="text-lg md:text-2xl font-black text-white leading-tight tracking-wide drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] text-center">
                                {data.discount}
                              </p>
                              
                              {/* Bottom accent line */}
                              <div className="flex items-center gap-2 justify-center mt-3">
                                <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#FB923C]/60"></div>
                                <div className="w-1.5 h-1.5 bg-[#FB923C] rounded-full"></div>
                                <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#FB923C]/60"></div>
                              </div>
                            </div>
                            
                            {/* Subtle glow behind text */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#F97316]/5 rounded-full blur-2xl pointer-events-none"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Description - Rich HTML Content */}
                  {data.description && (
                    <div className="w-full max-w-2xl mb-6 md:mb-8 flex flex-col md:flex-row items-center md:items-start justify-center gap-6 md:gap-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 px-2">
                      {/* Left: Description */}
                      <div 
                        className="text-sm md:text-base text-white/90 leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)] promotion-description flex-1 w-full md:w-auto"
                        dangerouslySetInnerHTML={{ __html: data.description }}
                      />
                      
                      {/* Right: QR Code - Simple Clean Design */}
                      {data.buttonLink && data.buttonLink !== '#' && (
                        <div className="flex-shrink-0 w-full md:w-auto flex justify-center animate-in fade-in zoom-in-95 duration-1000 delay-400">
                          <div 
                            className="bg-white rounded-2xl p-3 sm:p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                            onClick={() => handleButtonClick(data.buttonLink)}
                          >
                            {/* QR Code */}
                            <QRCodeSVG
                              value={data.buttonLink}
                              size={110}
                              level="H"
                              includeMargin={false}
                              fgColor="#000000"
                              bgColor="#FFFFFF"
                              imageSettings={{
                                src: "https://pwmrmcipniefewufwjjy.supabase.co/storage/v1/object/public/NailPage/Symbol.png",
                                height: 26,
                                width: 26,
                                excavate: true,
                              }}
                              className="mx-auto"
                            />
                            
                            {/* Label */}
                            <div className="mt-2 sm:mt-3 space-y-0.5">
                              <p className="text-xs text-gray-800 font-semibold text-center">
                                Scan to learn more
                              </p>
                              <p className="text-[10px] text-gray-500 text-center md:hidden">
                                or tap to open
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Days & Time (Golden Hour) - Glass Container */}
                  {data.days && data.time && (
                    <div className="mb-8 space-y-2 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-400">
                      <div className="inline-block px-8 py-4 bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] relative overflow-hidden">
                        {/* Inner glass reflection */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent"></div>
                        <div className="relative z-10">
                          <p className="text-base md:text-lg font-bold text-white drop-shadow-lg">{data.days}</p>
                          <p className="text-sm md:text-base text-[#F97316] font-semibold drop-shadow-lg">{data.time}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CTA Button - Liquid Glass Button */}
                  <div className="animate-in fade-in zoom-in-95 duration-1000 delay-500">
                    <Button
                      onClick={() => handleButtonClick(data.buttonLink)}
                      className="relative group bg-gradient-to-r from-[#F97316] to-[#FB923C] text-white font-black text-sm md:text-base px-10 md:px-12 py-5 md:py-6 rounded-2xl shadow-[0_8px_32px_0_rgba(249,115,22,0.4)] transition-all duration-500 uppercase tracking-widest border border-white/30 hover:border-white/50 hover:scale-105 hover:shadow-[0_8px_48px_0_rgba(249,115,22,0.6)] backdrop-blur-sm overflow-hidden animate-[cta-bounce_2s_ease-in-out_infinite]"
                    >
                      {/* Liquid shimmer animation - auto sweep */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[cta-shimmer_2.5s_ease-in-out_infinite]"></div>
                      
                      {/* Glass reflection overlay with pulse */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent animate-[cta-glow_2s_ease-in-out_infinite]"></div>

                      {/* Outer glow ring */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-[#F97316] to-[#FB923C] rounded-2xl blur-md opacity-40 animate-[cta-ring_2s_ease-in-out_infinite] -z-10"></div>
                      
                      <span className="relative z-10 flex items-center gap-2">
                        {data.buttonText}
                        
                        {/* Arrow icon with liquid movement */}
                        <svg className="w-4 h-4 animate-[cta-arrow_1.5s_ease-in-out_infinite]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                    </Button>
                    <style>{`
                      @keyframes cta-shimmer {
                        0% { transform: translateX(-100%); }
                        50% { transform: translateX(100%); }
                        100% { transform: translateX(100%); }
                      }
                      @keyframes cta-glow {
                        0%, 100% { opacity: 0.3; }
                        50% { opacity: 0.7; }
                      }
                      @keyframes cta-bounce {
                        0%, 100% { transform: translateY(0) scale(1); box-shadow: 0 8px 32px 0 rgba(249,115,22,0.4); }
                        50% { transform: translateY(-3px) scale(1.02); box-shadow: 0 12px 40px 0 rgba(249,115,22,0.55); }
                      }
                      @keyframes cta-ring {
                        0%, 100% { opacity: 0.3; transform: scale(1); }
                        50% { opacity: 0.6; transform: scale(1.03); }
                      }
                      @keyframes cta-arrow {
                        0%, 100% { transform: translateX(0); }
                        50% { transform: translateX(4px); }
                      }
                    `}</style>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Arrows (only if multiple promotions) */}
            {featuredPromotions.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full transition-colors backdrop-blur-sm ${
                    hasBackground
                      ? 'bg-white/20 hover:bg-white/40 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>

                <button
                  onClick={handleNext}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full transition-colors backdrop-blur-sm ${
                    hasBackground
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
    </>
  );
}