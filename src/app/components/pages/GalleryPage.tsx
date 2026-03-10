import { useState, useEffect, useCallback } from "react";
import PublicLayout from "../PublicLayout";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  Instagram,
  Loader2,
  Facebook,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { Button } from "../ui/button";
import { projectId, publicAnonKey } from "@utils/supabase/info";
import {
  optimizeCloudinaryUrl,
  optimizeCloudinaryThumbnail,
} from "@/utils/cloudinary";
import { LogoBadge } from "@/app/components/atoms/LogoBadge";
import { FilterTabs } from "@/app/components/atoms/FilterTabs";

interface GalleryImage {
  id: string;
  cloudinary_url: string;
  order: number;
  category: string;
  showLogo?: boolean;
  featured?: boolean;
  views?: number;
  uploadedAt: string;
}

// Helper function to ensure URLs have https:// prefix
const ensureHttps = (url: string): string => {
  if (!url) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `https://${url}`;
};

export default function GalleryPage() {
  const { t } = useLanguage();
  const [selectedIndex, setSelectedIndex] = useState<
    number | null
  >(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<string>("all");
  
  // Content Filter State (NEW)
  const [contentFilter, setContentFilter] = useState<string>("new");
  
  const [socialMedia, setSocialMedia] = useState({
    facebook: "",
    instagram: "",
  });
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // Fetch logo
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/gallery-logo`,
          {
            headers: { Authorization: `Bearer ${publicAnonKey}` },
          }
        );
        const data = await response.json();
        if (data.logo) {
          setLogoUrl(data.logo.url);
        }
      } catch (error) {
        console.error("Error fetching logo:", error);
      }
    };

    fetchLogo();
  }, []);

  // Fetch images from backend
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/gallery/images`,
          {
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
            },
          },
        );
        const data = await response.json();
        if (data.success) {
          setImages(data.data);

          // Extract unique categories
          const uniqueCategories = Array.from(
            new Set(
              data.data.map(
                (img: GalleryImage) => img.category,
              ),
            ),
          ).filter(Boolean) as string[];
          setCategories(uniqueCategories);
        }
      } catch (error) {
        console.error("Error fetching gallery images:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  // Fetch social media links
  useEffect(() => {
    const fetchSocialMedia = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/settings/social-media`,
          {
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
            },
          },
        );
        const result = await response.json();

        if (result.success && result.data) {
          setSocialMedia({
            facebook: result.data.facebook || "",
            instagram: result.data.instagram || "",
          });
        }
      } catch (error) {
        console.error(
          "Failed to fetch social media links:",
          error,
        );
      }
    };

    fetchSocialMedia();
  }, []);

  // Track view when lightbox opens
  useEffect(() => {
    if (selectedIndex !== null && filteredImages[selectedIndex]) {
      const trackView = async () => {
        try {
          await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/gallery/image/${filteredImages[selectedIndex].id}/view`,
            {
              method: "POST",
              headers: { Authorization: `Bearer ${publicAnonKey}` },
            }
          );
        } catch (error) {
          console.error("Failed to track view:", error);
        }
      };
      trackView();
    }
  }, [selectedIndex]);

  // Apply content filter and sorting
  const applyContentFilter = (imgs: GalleryImage[]) => {
    switch (contentFilter) {
      case "new":
        // Sort by uploadedAt (newest first)
        return [...imgs].sort(
          (a, b) =>
            new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        );
      case "popular":
        // Sort by views (highest first)
        return [...imgs].sort((a, b) => (b.views || 0) - (a.views || 0));
      case "featured":
        // Filter only featured images
        return imgs.filter((img) => img.featured === true);
      case "all":
      default:
        // Return as-is (use default order)
        return imgs;
    }
  };

  // Filter images by category, then apply content filter
  const categoryFilteredImages =
    selectedCategory === "all"
      ? images
      : images.filter((img) => img.category === selectedCategory);

  const filteredImages = applyContentFilter(categoryFilteredImages);

  const showNext = useCallback(
    (e?: any) => {
      e?.stopPropagation();
      setSelectedIndex((prev) =>
        prev === null
          ? null
          : (prev + 1) % filteredImages.length,
      );
    },
    [filteredImages.length],
  );

  const showPrev = useCallback(
    (e?: any) => {
      e?.stopPropagation();
      setSelectedIndex((prev) =>
        prev === null
          ? null
          : (prev - 1 + filteredImages.length) %
            filteredImages.length,
      );
    },
    [filteredImages.length],
  );

  const closeLightbox = useCallback(
    () => setSelectedIndex(null),
    [],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") showNext();
      if (e.key === "ArrowLeft") showPrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () =>
      window.removeEventListener("keydown", handleKeyDown);
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
              {t("nav.gallery") || "Our Gallery"}
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Experience the luxury and artistry of Bitcoin Nail
              Bar. From our premium interiors to our exquisite
              nail art designs.
            </p>
          </motion.div>

          {/* Content Filter Tabs (NEW - Primary Layer) */}
          <FilterTabs
            options={[
              { id: "new", label: "New" },
              { id: "popular", label: "Popular" },
              { id: "featured", label: "Featured" },
              { id: "all", label: "All" },
            ]}
            selected={contentFilter}
            onSelect={setContentFilter}
            variant="primary"
            className="mb-8"
          />

          {/* Category Filter Tabs (Secondary Layer) */}
          {categories.length > 0 && (
            <FilterTabs
              options={[
                { id: "all", label: "All" },
                ...categories.map((cat) => ({ id: cat, label: cat })),
              ]}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
              variant="secondary"
              className="mb-12"
            />
          )}

          {/* Masonry-style Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-[#FF9800] animate-spin" />
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-xl">
                {selectedCategory === "all"
                  ? "No images available yet."
                  : `No images in "${selectedCategory}" category.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredImages.map((img, index) => (
                  <motion.div
                    key={img.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="group relative aspect-[4/5] rounded-xl overflow-hidden cursor-pointer bg-white/5"
                    onClick={() => setSelectedIndex(index)}
                  >
                    <img
                      src={optimizeCloudinaryThumbnail(
                        img.cloudinary_url,
                        600,
                      )}
                      alt={`Gallery Image ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Gradient overlay for logo visibility */}
                    {img.showLogo && logoUrl && (
                      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
                    )}

                    {/* Logo Badge */}
                    {img.showLogo && logoUrl && (
                      <LogoBadge logoUrl={logoUrl} visible={true} size="sm" />
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <div className="w-12 h-12 rounded-full bg-[#FF9800] flex items-center justify-center shadow-xl">
                          <ZoomIn className="h-5 w-5 text-black" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Instagram CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-20 text-center"
          >
            <a
              href={
                socialMedia.instagram
                  ? ensureHttps(socialMedia.instagram)
                  : socialMedia.facebook
                    ? ensureHttps(socialMedia.facebook)
                    : "#"
              }
              target={
                socialMedia.instagram || socialMedia.facebook
                  ? "_blank"
                  : "_self"
              }
              rel={
                socialMedia.instagram || socialMedia.facebook
                  ? "noopener noreferrer"
                  : undefined
              }
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-bold tracking-wider uppercase hover:shadow-lg hover:shadow-purple-500/30 transition-all transform hover:-translate-y-1"
            >
              {socialMedia.instagram ? (
                <>
                  <Instagram className="h-5 w-5" />
                  Follow us on Instagram
                </>
              ) : socialMedia.facebook ? (
                <>
                  <Facebook className="h-5 w-5" />
                  Follow us on Facebook
                </>
              ) : (
                <>
                  <Instagram className="h-5 w-5" />
                  Follow us on Instagram
                </>
              )}
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
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 bg-[rgba(0,0,0,0.6)]"
              onClick={closeLightbox}
            >
              <button
                onClick={closeLightbox}
                className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-50 p-2"
              >
                <X className="w-8 h-8" />
              </button>

              <div
                className="relative w-full max-w-6xl aspect-[16/9] flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
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
                  <div className="relative">
                    <img
                      src={optimizeCloudinaryUrl(
                        filteredImages[selectedIndex]
                          .cloudinary_url,
                        { width: 1920 },
                      )}
                      alt="Gallery View"
                      className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                    />
                    
                    {/* Gradient overlay for logo visibility */}
                    {filteredImages[selectedIndex].showLogo && logoUrl && (
                      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none rounded-b-lg" />
                    )}
                    
                    {/* Logo Badge on Lightbox */}
                    {filteredImages[selectedIndex].showLogo && logoUrl && (
                      <LogoBadge logoUrl={logoUrl} visible={true} size="lg" />
                    )}
                  </div>
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
                {filteredImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedIndex(idx);
                    }}
                    className={`relative w-12 h-12 flex-shrink-0 rounded-md overflow-hidden transition-all ${
                      idx === selectedIndex
                        ? "ring-2 ring-[#FF9800] opacity-100 scale-110"
                        : "opacity-40 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={optimizeCloudinaryThumbnail(
                        img.cloudinary_url,
                        200,
                      )}
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