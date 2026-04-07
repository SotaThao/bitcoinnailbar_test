import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  Loader2,
  ImageOff,
  ChevronUp,
  BookOpen,
  ChevronDown,
  Menu,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { projectId, publicAnonKey } from "@utils/supabase/info";
import PublicLayout from "../PublicLayout";
import { useServiceCategories } from "../../hooks/useServiceCategories";

interface MenuImage {
  id: string;
  name: string;
  cloudinary_url: string;
  order: number;
}

// Utility function to optimize Cloudinary URLs
function optimizeCloudinaryUrl(
  url: string,
  options: { width?: number; quality?: number },
) {
  try {
    const urlObj = new URL(url);
    const queryParams = new URLSearchParams(urlObj.search);

    if (options.width) {
      queryParams.set("w", options.width.toString());
    }
    if (options.quality) {
      queryParams.set("q", options.quality.toString());
    }

    urlObj.search = queryParams.toString();
    return urlObj.toString();
  } catch {
    return url;
  }
}

// Lazy-loaded image with fade-in
function MenuImageItem({
  image,
  index,
}: {
  image: MenuImage;
  index: number;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      id={`menu-page-${index}`}
      className="relative w-full"
    >
      <div className="relative bg-[#0B0F19] overflow-hidden">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#111827] min-h-[200px]">
            <Loader2 className="w-8 h-8 text-[#FF9800]/50 animate-spin" />
          </div>
        )}
        <img
          src={optimizeCloudinaryUrl(image.cloudinary_url, {
            width: 1200,
            quality: 90,
          })}
          alt={image.name || `Menu page ${index + 1}`}
          className={`w-full h-auto block transition-opacity duration-500 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          loading={index < 2 ? "eager" : "lazy"}
          onLoad={() => setLoaded(true)}
        />
      </div>
    </div>
  );
}

export default function MenuPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [images, setImages] = useState<MenuImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuDropdownRef = useRef<HTMLDivElement>(null);
  const [scrollDirection, setScrollDirection] = useState<"up" | "down" | "idle">(
    "idle",
  );
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Service categories for dropdown
  const {
    categories: rawCategories,
    loading: categoriesLoading,
  } = useServiceCategories();

  // Filter active categories (fallback: show all if no status field)
  const categories = rawCategories
    .filter((cat: any) => !cat.status || cat.status === "active")
    .sort(
      (a: any, b: any) =>
        (a.displayOrder ?? 999) - (b.displayOrder ?? 999),
    );

  useEffect(() => {
    fetchImages();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuDropdownRef.current &&
        !menuDropdownRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // Cleanup: remove body class on unmount
  useEffect(() => {
    return () => {
      document.body.classList.remove("menu-scrolling-down");
    };
  }, []);

  // Scroll direction detection
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const diff = currentScrollY - lastScrollY.current;

          // Only change direction if scrolled more than 5px (debounce jitter)
          if (diff > 5) {
            setScrollDirection("down");
            document.body.classList.add("menu-scrolling-down");
          } else if (diff < -5) {
            setScrollDirection("up");
            document.body.classList.remove("menu-scrolling-down");
          }

          // At top of page, always show
          if (currentScrollY < 100) {
            setScrollDirection("idle");
            document.body.classList.remove("menu-scrolling-down");
          }

          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }

      // Reset to idle after stopping scroll
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      scrollTimeout.current = setTimeout(() => {
        setScrollDirection("idle");
        document.body.classList.remove("menu-scrolling-down");
      }, 1500);
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  // Scroll to page from URL param
  useEffect(() => {
    if (images.length === 0) return;
    const params = new URLSearchParams(location.search);
    const pageParam = params.get("page");

    if (pageParam) {
      const pageIndex = parseInt(pageParam, 10);
      const targetIndex = images.findIndex(
        (img) => img.order === pageIndex,
      );
      if (targetIndex !== -1) {
        setTimeout(() => {
          const el = document.getElementById(
            `menu-page-${targetIndex}`,
          );
          if (el) {
            el.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }, 300);
      }
    }
  }, [location.search, images]);

  // IntersectionObserver to track active page
  useEffect(() => {
    if (images.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            const idx = parseInt(
              id.replace("menu-page-", ""),
              10,
            );
            if (!isNaN(idx)) {
              setActiveIndex(idx);
            }
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: "-10% 0px -10% 0px",
      },
    );

    images.forEach((_, i) => {
      const el = document.getElementById(`menu-page-${i}`);
      if (el) observerRef.current?.observe(el);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [images]);

  const fetchImages = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/menu/images`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        },
      );
      const data = await response.json();
      if (data.success) {
        setImages(data.data);
      } else {
        setError("Failed to load menu");
      }
    } catch (err) {
      console.error("Error fetching menu images:", err);
      setError("Unable to load menu. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToPage = (index: number) => {
    const el = document.getElementById(`menu-page-${index}`);
    if (el) {
      const headerOffset = 80;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  const isHidden = scrollDirection === "down";
  const showScrollTop =
    lastScrollY.current > 400 && !isHidden;

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2
              className="w-16 h-16 text-[#FF9800] animate-spin mx-auto mb-4"
              style={{
                filter:
                  "drop-shadow(0 0 10px rgba(255, 152, 0, 0.5))",
              }}
            />
            <p className="text-gray-300 text-lg">
              Loading menu...
            </p>
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
            <h2 className="text-2xl font-bold text-gray-200 mb-2">
              Menu Not Available
            </h2>
            <p className="text-gray-400">
              {error ||
                "No menu images have been uploaded yet. Please check back later."}
            </p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const totalPages = images.length;

  return (
    <PublicLayout>
      {/* Header */}
      <div className="text-center pt-4 pb-4 md:pt-6 md:pb-8">
        {/* Menu Bitcoin Nail Bar dropdown - TOP */}
        <div className="relative inline-block mb-4" ref={menuDropdownRef}>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1a1f2e] to-[#0B0F19] text-white font-bold text-sm rounded-full border border-[#FF9800]/30 hover:border-[#FF9800] shadow-[0_4px_16px_rgba(255,152,0,0.2)] hover:shadow-[0_6px_24px_rgba(255,152,0,0.4)] transition-all duration-300 hover:scale-105 group"
          >
            <Menu className="w-4 h-4 text-[#FF9800]" />
            <span>Menu Bitcoin Nail Bar</span>
            <ChevronDown
              className={`w-4 h-4 text-[#FF9800] transition-transform duration-300 ${
                menuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
                animate={{ opacity: 1, y: 0, scaleY: 1 }}
                exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute left-1/2 -translate-x-1/2 mt-2 w-72 origin-top bg-[#1a1f2e] border border-[#FF9800]/20 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden z-50"
              >
                {/* Orange top accent */}
                <div className="h-1 bg-gradient-to-r from-[#FF9800] to-[#F7931A]" />

                <div className="py-1">
                  {categoriesLoading ? (
                    <div className="px-4 py-6 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-[#FF9800] animate-spin" />
                    </div>
                  ) : categories.length === 0 ? (
                    <div className="px-4 py-4 text-gray-500 text-sm text-center">
                      No categories available
                    </div>
                  ) : (
                    categories.map((cat: any) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setMenuOpen(false);
                          navigate(`/#services?category=${cat.key}`);
                        }}
                        className="w-full text-left px-5 py-3 text-sm text-gray-200 hover:bg-[#FF9800]/10 hover:text-white transition-colors duration-150 flex items-center gap-3 group/item"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF9800]/30 group-hover/item:bg-[#FF9800] transition-all duration-200" />
                        {cat.name}
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#FF9800]/30 bg-[#FF9800]/5 mb-3">
          <BookOpen className="w-4 h-4 text-[#FF9800]" />
          <span className="text-xs font-bold tracking-wider uppercase text-[#FF9800]">
            Our Menu
          </span>
        </div>
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-2">
          Bitcoin Nail Bar
        </h1>
        <p className="text-gray-400 text-sm md:text-base">
          {totalPages} page{totalPages > 1 ? "s" : ""} &bull;
          Scroll to explore
        </p>
      </div>

      {/* Desktop: Right Side Nav Dots */}
      {totalPages > 1 && (
        <div
          className="fixed right-3 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center gap-2 transition-all duration-300"
          style={{
            opacity: isHidden ? 0 : 1,
            transform: `translateY(-50%) translateX(${isHidden ? "20px" : "0px"})`,
            pointerEvents: isHidden ? "none" : "auto",
          }}
        >
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => scrollToPage(i)}
              className={`group relative transition-all duration-300 ${
                i === activeIndex
                  ? "w-3 h-8 bg-[#FF9800] rounded-full"
                  : "w-2 h-2 bg-white/20 hover:bg-[#FF9800]/50 rounded-full"
              }`}
              aria-label={`Go to page ${i + 1}`}
            >
              <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                {img.name || `Page ${i + 1}`}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Vertical Scroll Menu - seamless */}
      <div className="w-full max-w-3xl mx-auto px-4 md:px-6 pb-20">
        {images.map((image, index) => (
          <MenuImageItem
            key={image.id}
            image={image}
            index={index}
          />
        ))}
      </div>

      {/* Bottom Bar: Page Counter - LEFT side, Scroll-to-top - LEFT side above it */}
      {/* Page Counter - Fixed bottom left, above mobile navbar */}
      <div
        className="fixed z-40 transition-all duration-300 ease-out"
        style={{
          bottom: "90px",
          left: "16px",
          opacity: isHidden ? 0 : 1,
          transform: `translateY(${isHidden ? "20px" : "0px"})`,
          pointerEvents: isHidden ? "none" : "auto",
        }}
      >
        <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-2.5 shadow-lg flex items-center gap-2">
          {/* Page Number */}
          <span className="text-white text-sm font-bold tabular-nums">
            {activeIndex + 1}
          </span>
          
          {/* Progress bar */}
          <div className="w-16 md:w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#FF9800] rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${((activeIndex + 1) / totalPages) * 100}%`,
              }}
            />
          </div>

          <span className="text-gray-500 text-sm tabular-nums">
            {totalPages}
          </span>
        </div>
      </div>

      {/* Scroll to Top - LEFT side, above page counter */}
      <div
        className="fixed z-40 transition-all duration-300 ease-out"
        style={{
          bottom: "140px",
          left: "16px",
          opacity: showScrollTop ? 1 : 0,
          transform: `translateY(${showScrollTop ? "0px" : "12px"})`,
          pointerEvents: showScrollTop ? "auto" : "none",
        }}
      >
        <button
          onClick={scrollToTop}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-[#FF9800] hover:text-black hover:border-[#FF9800] active:scale-95 transition-all duration-200"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      </div>
    </PublicLayout>
  );
}