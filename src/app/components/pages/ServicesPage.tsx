import React from "react";
import { useState, useEffect } from "react";
import PublicLayout from "../PublicLayout";
import { SEOHead } from "../shared/SEOHead";
import { useLanguage } from "../../context/LanguageContext";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { Button } from "../ui/button";
import { PrimaryButton } from "../PrimaryButton";
import {
  Check,
  Bitcoin,
  Sparkles,
  Gem,
  ArrowRight,
  Zap,
  Crown,
  Loader2,
  ChevronLeft,
} from "lucide-react";
import { Link, useLocation, useParams, useNavigate } from "react-router";
import { motion } from "motion/react";
import { ASSETS } from "../../config/assets";
import { AnimatedButton } from "../ui/animated-button";
import { useServiceCategories } from "../../hooks/useServiceCategories";
import { projectId, publicAnonKey } from "@utils/supabase/info";
import Masonry, {
  ResponsiveMasonry,
} from "react-responsive-masonry";

export default function ServicesPage() {
  const { t } = useLanguage();
  const location = useLocation();
  const { categoryKey } = useParams<{ categoryKey?: string }>();
  const navigate = useNavigate();
  const [serviceData, setServiceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load categories from backend
  const {
    categories: rawCategories,
    loading: categoriesLoading,
  } = useServiceCategories();

  // Filter active categories and sort by displayOrder
  const allCategories = rawCategories
    .filter((cat: any) => cat.status === "active")
    .sort(
      (a: any, b: any) =>
        (a.displayOrder ?? 999) - (b.displayOrder ?? 999),
    );

  // 🎯 FILTER: If categoryKey exists, only show that category
  const categories = categoryKey
    ? allCategories.filter((cat: any) => cat.key === categoryKey)
    : allCategories;

  // Find selected category for header
  const selectedCategory = categoryKey
    ? allCategories.find((cat: any) => cat.key === categoryKey)
    : null;

  // 🎯 AUTO-SCROLL: Scroll to category when URL hash changes
  useEffect(() => {
    // Wait for data to load and DOM to render
    if (loading || categoriesLoading) return;

    const hash = location.hash.slice(1); // Remove '#' prefix
    if (!hash) return;

    // Delay scroll to ensure DOM is fully rendered
    const scrollTimeout = setTimeout(() => {
      const element = document.getElementById(hash);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        console.log(`✅ Scrolled to category: ${hash}`);
      } else {
        console.warn(`⚠️ Category element not found: ${hash}`);
      }
    }, 300);

    return () => clearTimeout(scrollTimeout);
  }, [location.hash, loading, categoriesLoading]);

  // Fetch service menu data
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/settings/service-menu`,
          {
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
            },
          },
        );
        const result = await response.json();
        if (result.success && result.data) {
          setServiceData(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Get all owner recommended services from all categories
  const getOwnerRecommendedServices = () => {
    if (!serviceData) return [];

    const recommended: any[] = [];
    Object.keys(serviceData).forEach((categoryKey) => {
      const categoryData = serviceData[categoryKey];
      if (categoryData?.groups) {
        categoryData.groups.forEach((group: any) => {
          if (group.items) {
            group.items.forEach((item: any) => {
              if (item.owner_recommended === true) {
                recommended.push({
                  ...item,
                  categoryKey,
                  groupName: group.name,
                });
              }
            });
          }
        });
      }
    });

    return recommended;
  };

  const ownerRecommendedServices =
    getOwnerRecommendedServices();

  return (
    <PublicLayout>
      <SEOHead
        title="Luxury Nail Services & Spa Menu"
        description="Explore our full menu of luxury nail services including manicures, pedicures, acrylics, dipping powder, and waxing. Best nail salon services in Houston."
        keywords="nail services list, manicure menu, pedicure menu, acrylic nails price, dipping powder nails, waxing services houston"
        canonicalUrl="https://bitcoinnailbar.com/services"
      />
      
      {/* 🎯 CONDITIONAL: Only show hero when viewing all services */}
      {!categoryKey && (
        <>
          {/* Hero Header */}
          <section className="relative py-10 bg-[#0B0F19] text-white overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,152,0,0.15),transparent_70%)] pointer-events-none"></div>

            <div className="container mx-auto px-4 relative z-10 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#FF9800]/30 bg-[#FF9800]/5 text-[#FF9800] text-sm font-bold tracking-widest uppercase mb-6">
                <Sparkles className="h-4 w-4" />
                {t("home.services.badge")}
              </div>
              <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6">
                {t("services_page.hero_title")}{" "}
                <span className="text-[#FF9800]">
                  {t("services_page.hero_title_highlight")}
                </span>
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                {t("services_page.hero_desc")}
              </p>
            </div>
          </section>
        </>
      )}

      {/* Main Service Highlight (Like HomePage) */}
      <section className={`${categoryKey ? 'py-10' : 'py-20'} bg-white`}>
        <div className="container mx-auto px-4">
          
          {/* 🎯 CONDITIONAL: Only show intro section when viewing all services */}
          {!categoryKey && (
            <>
              {/* Section 1: Introduction */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto mb-32">
                <div className="relative group">
                  <div className="absolute inset-0 bg-black/5 rounded-3xl transform rotate-3 transition-transform group-hover:rotate-6 duration-500"></div>
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                    <ImageWithFallback
                      src={ASSETS.hygieneLuxuryTreatments}
                      alt="Luxury Manicure"
                      className="w-full h-[600px] object-cover"
                    />
                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-8">
                      <div className="flex items-center gap-4 text-white">
                        <div className="p-3 bg-[#FF9800] rounded-xl">
                          <Gem className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">
                            {t("services_page.premium_materials")}
                          </h3>
                          <p className="text-sm text-gray-300">
                            {t("services_page.premium_desc")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <h2 className="text-4xl md:text-5xl font-serif font-bold leading-tight text-gray-900">
                    {t("services_page.art_title")} <br />
                    <span className="text-[#FF9800]">
                      {t("services_page.art_highlight")}
                    </span>
                  </h2>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {t("services_page.art_desc")}
                  </p>

                  <div className="space-y-6">
                    {/* Reusing home.services.items for this list as it seems similar */}
                    {Array.isArray(t("home.services.items")) &&
                      (t("home.services.items") as string[])
                        .slice(0, 4)
                        .map((item, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-[#FF9800]/30 hover:shadow-lg transition-all bg-gray-50/50"
                          >
                            <div className="h-10 w-10 rounded-full bg-[#FF9800]/10 flex items-center justify-center flex-shrink-0">
                              <Check className="h-5 w-5 text-[#FF9800]" />
                            </div>
                            <span className="text-lg font-medium text-gray-800">
                              {item}
                            </span>
                          </div>
                        ))}
                  </div>

                  <div className="pt-6">
                    <Link to="/booking">
                      <PrimaryButton
                        size="lg"
                        className="w-full sm:w-auto shadow-xl shadow-[#FF9800]/20"
                      >
                        {t("services_page.book_appointment")}{" "}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </PrimaryButton>
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Section 2: Menu Categories */}
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              {categoryKey && selectedCategory ? (
                // Filtered view - Show "Back to All Services" button
                <>
                  <Button
                    onClick={() => navigate("/menu")}
                    variant="ghost"
                    className="mb-4 text-gray-600 hover:text-[#FF9800]"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    View All Services
                  </Button>
                  <h2 className="text-4xl font-serif font-bold mb-4">
                    {selectedCategory.name}
                  </h2>
                  <div className="w-24 h-1 bg-[#FF9800] mx-auto"></div>
                </>
              ) : (
                // Full view - Show default header
                <>
                  <h2 className="text-4xl font-serif font-bold mb-4">
                    {t("services_page.menu_title")}
                  </h2>
                  <div className="w-24 h-1 bg-[#FF9800] mx-auto"></div>
                </>
              )}
            </div>

            {/* Signature Services (Special Highlight) */}
            {!categoryKey && (
              <div id="signature" className="mb-12 scroll-mt-24">
                <div className="bg-[#0B0F19] text-white rounded-2xl p-8 md:p-12 border border-[#FF9800]/30 relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                    <Crown size={200} />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <Crown className="text-[#FF9800] h-8 w-8" />
                      <h3 className="text-3xl font-serif font-bold">
                        {t(
                          "services_page.categories.signature.title",
                        )}
                      </h3>
                    </div>
                    <p className="text-gray-400 mb-8 max-w-2xl">
                      {t(
                        "services_page.categories.signature.desc",
                      )}
                    </p>

                    {loading ? (
                      // Skeleton loading
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, idx) => (
                          <div
                            key={idx}
                            className="bg-white/5 rounded-xl p-6 border border-white/10 animate-pulse"
                          >
                            <div className="h-6 bg-white/10 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-white/10 rounded w-full mb-2"></div>
                            <div className="h-4 bg-white/10 rounded w-2/3 mb-4"></div>
                            <div className="h-6 bg-white/10 rounded w-1/3 mt-auto"></div>
                          </div>
                        ))}
                      </div>
                    ) : ownerRecommendedServices.length > 0 ? (
                      // Dynamic data from API
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {ownerRecommendedServices
                          .slice(0, 6)
                          .map((item, idx) => (
                            <div
                              key={idx}
                              className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-[#FF9800]/50 transition-colors flex flex-col min-h-[160px] relative group"
                            >
                              {/* Owner's Pick Badge */}
                              <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-[#FF9800]/20 border border-[#FF9800]/50">
                                <Sparkles className="h-3 w-3 text-[#FF9800]" />
                                <span className="text-[10px] font-bold text-[#FF9800] uppercase tracking-wide">
                                  Pick
                                </span>
                              </div>

                              <h4 className="font-bold text-lg mb-2 text-[#FF9800] line-clamp-2 min-h-[3.5rem] flex items-start pr-16">
                                {item.name}
                              </h4>
                              <div className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                                <span className="text-gray-400">
                                  {item.groupName}
                                </span>
                              </div>
                              <div className="flex-1"></div>
                              <div className="flex items-baseline gap-3 mt-auto">
                                <div className="font-bold text-xl">
                                  $
                                  {item.regular ||
                                    item.price ||
                                    0}
                                </div>
                                {item.member && (
                                  <div className="text-sm text-[#FF9800]/80">
                                    VIP: ${item.member}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      // Fallback: Show translation data if no owner recommended services
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {Array.isArray(
                          t(
                            "services_page.categories.signature.items",
                          ),
                        ) &&
                          (
                            t(
                              "services_page.categories.signature.items",
                            ) as any[]
                          ).map((item, idx) => (
                            <div
                              key={idx}
                              className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-[#FF9800]/50 transition-colors flex flex-col min-h-[160px]"
                            >
                              <h4 className="font-bold text-lg mb-2 text-[#FF9800] line-clamp-2 min-h-[3.5rem] flex items-start">
                                {item.name}
                              </h4>
                              <p className="text-sm text-gray-400 mb-4 flex-1">
                                {item.desc}
                              </p>
                              <div className="font-bold text-xl mt-auto">
                                {item.price}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Detailed Menu Grid - Masonry Layout */}
            {loading || categoriesLoading ? (
              // Skeleton Loading
              <ResponsiveMasonry
                columnsCountBreakPoints={{ 350: 1, 1024: 2 }}
              >
                <Masonry gutter="5rem">
                  {[...Array(6)].map((_, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 rounded-2xl p-8 border border-gray-100 animate-pulse"
                    >
                      <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
                      <div className="space-y-6">
                        {[...Array(3)].map((_, i) => (
                          <div key={i}>
                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                            <div className="space-y-3">
                              {[...Array(4)].map((_, j) => (
                                <div
                                  key={j}
                                  className="flex justify-between items-center"
                                >
                                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </Masonry>
              </ResponsiveMasonry>
            ) : categoryKey ? (
              // 🎯 FILTERED VIEW: Full-width single category (no Masonry)
              <div className="max-w-7xl mx-auto">
                {categories.map((category: any) => {
                  const categoryData = serviceData?.[category.key];
                  const hasServices =
                    categoryData?.groups &&
                    categoryData.groups.length > 0;

                  return (
                    <div
                      id={category.key}
                      key={category.id}
                      className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-xl transition-shadow relative overflow-hidden group scroll-mt-24"
                    >
                      {/* Decorative BG Icon */}
                      <div className="absolute -right-6 -top-6 text-gray-200 opacity-30 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                        <Sparkles size={150} />
                      </div>

                      <h3 className="text-2xl font-serif font-bold text-gray-900 mb-6 relative z-10 flex items-center gap-3">
                        {category.name}
                      </h3>

                      {!hasServices ? (
                        // Empty State - No Services
                        <div className="relative z-10 text-center py-12">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-200/50 mb-4">
                            <Sparkles className="h-8 w-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500 text-sm">
                            {t("services_page.no_services")}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-8 relative z-10">
                          {categoryData.groups.map(
                            (group: any, gIdx: number) => {
                              // Filter out addon services from display
                              const regularServices =
                                group.items?.filter(
                                  (item: any) =>
                                    item.serviceType?.toLowerCase() !==
                                    "addon",
                                ) || [];

                              // Sort by owner recommended (recommended first)
                              const sortedServices = [
                                ...regularServices,
                              ].sort((a: any, b: any) => {
                                if (
                                  a.owner_recommended &&
                                  !b.owner_recommended
                                )
                                  return -1;
                                if (
                                  !a.owner_recommended &&
                                  b.owner_recommended
                                )
                                  return 1;
                                return 0;
                              });

                              if (sortedServices.length === 0)
                                return null;

                              return (
                                <div key={gIdx}>
                                  <h4 className="text-sm font-bold text-[#FF9800] uppercase tracking-wider mb-4 border-b border-[#FF9800]/20 pb-2 inline-block">
                                    {group.name}
                                  </h4>
                                  <div className="space-y-0">
                                    {sortedServices.map(
                                      (
                                        item: any,
                                        iIdx: number,
                                      ) => (
                                        <div
                                          key={iIdx}
                                          className="border-b border-gray-200 last:border-0 py-5 first:pt-2"
                                        >
                                          {/* Service Image - only show if imageUrl exists */}
                                          {item.imageUrl && (
                                            <div className="mb-3 rounded-xl overflow-hidden">
                                              <img
                                                src={item.imageUrl}
                                                alt={item.name}
                                                className="w-full h-48 sm:h-56 object-cover"
                                                loading="lazy"
                                              />
                                            </div>
                                          )}
                                          {/* Top row: Service name + Price boxes */}
                                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
                                            {/* Service Name */}
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                              <h5 className="text-xl md:text-2xl font-serif font-extrabold italic leading-tight text-[#ff9800]"
                                                style={{
                                                  fontStyle: 'italic',
                                                  letterSpacing: '0.02em',
                                                }}
                                              >
                                                {item.name}
                                              </h5>
                                              {item.owner_recommended && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FF9800]/10 border border-[#FF9800]/30 text-[10px] font-bold text-[#FF9800] uppercase tracking-wide shrink-0">
                                                  <Sparkles className="h-3 w-3" />
                                                  Pick
                                                </span>
                                              )}
                                            </div>
                                            {/* Price Boxes */}
                                            <div className="flex items-stretch gap-3 shrink-0">
                                              <div className="flex flex-col items-center justify-center px-5 py-2 border border-gray-300 rounded-md bg-white min-w-[90px]">
                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider leading-none mb-1">
                                                  Regular:
                                                </span>
                                                <span className="text-lg font-bold text-gray-900 leading-none">
                                                  ${item.regular || item.price || 0}
                                                </span>
                                              </div>
                                              {item.member && (
                                                <div className="flex flex-col items-center justify-center px-5 py-2 rounded-md bg-white border-2 border-[#FFC107] min-w-[90px]">
                                                  <span className="text-[10px] font-bold text-[#E8A817] uppercase tracking-wider leading-none mb-1">
                                                    ★ Member:
                                                  </span>
                                                  <span className="text-lg font-bold text-[#E8A817] leading-none">
                                                    ${item.member}
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                          {/* Description row: Duration + Description */}
                                          <p className="text-sm text-gray-600 leading-relaxed mt-2">
                                            {(item.durationMinutes || item.duration) && (
                                              <span className="font-bold text-gray-800">
                                                Duration: {item.durationMinutes ? `${item.durationMinutes} minutes` : item.duration}.{' '}
                                              </span>
                                            )}
                                            {item.description && (
                                              <span
                                                className="text-gray-600 [&_b]:font-bold [&_i]:italic [&_u]:underline [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4"
                                                dangerouslySetInnerHTML={{ __html: item.description }}
                                              />
                                            )}
                                          </p>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              );
                            },
                          )}
                        </div>
                      )}

                      <div className="mt-8 pt-6 border-t border-dashed border-gray-300 relative z-10">
                        <Link
                          to="/booking"
                          className="inline-flex items-center text-sm font-bold text-gray-900 hover:text-[#FF9800] transition-colors uppercase tracking-wider"
                        >
                          {t("services_page.book_category")}{" "}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // ALL CATEGORIES VIEW: Masonry layout
              <ResponsiveMasonry
                columnsCountBreakPoints={{ 350: 1, 1024: 2 }}
              >
                <Masonry gutter="5rem">
                  {categories.map((category: any) => {
                    const categoryData =
                      serviceData?.[category.key];

                    // Check if category has data and groups
                    const hasServices =
                      categoryData?.groups &&
                      categoryData.groups.length > 0;

                    return (
                      <div
                        id={category.key}
                        key={category.id}
                        className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-xl transition-shadow relative overflow-hidden group scroll-mt-24 w-full mt-[40px] mr-0 lg:mr-[40px] mb-[0px] ml-[0px]"
                      >
                        {/* Decorative BG Icon */}
                        <div className="absolute -right-6 -top-6 text-gray-200 opacity-30 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                          <Sparkles size={150} />
                        </div>

                        <h3 className="text-2xl font-serif font-bold text-gray-900 mb-6 relative z-10 flex items-center gap-3">
                          {category.name}
                        </h3>

                        {!hasServices ? (
                          // Empty State - No Services
                          <div className="relative z-10 text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-200/50 mb-4">
                              <Sparkles className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 text-sm">
                              {t("services_page.no_services")}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-8 relative z-10">
                            {categoryData.groups.map(
                              (group: any, gIdx: number) => {
                                // Filter out addon services from display
                                const regularServices =
                                  group.items?.filter(
                                    (item: any) =>
                                      item.serviceType?.toLowerCase() !==
                                      "addon",
                                  ) || [];

                                // Sort by owner recommended (recommended first)
                                const sortedServices = [
                                  ...regularServices,
                                ].sort((a: any, b: any) => {
                                  if (
                                    a.owner_recommended &&
                                    !b.owner_recommended
                                  )
                                    return -1;
                                  if (
                                    !a.owner_recommended &&
                                    b.owner_recommended
                                  )
                                    return 1;
                                  return 0;
                                });

                                if (sortedServices.length === 0)
                                  return null;

                                return (
                                  <div key={gIdx}>
                                    <h4 className="text-sm font-bold text-[#FF9800] uppercase tracking-wider mb-4 border-b border-[#FF9800]/20 pb-2 inline-block">
                                      {group.name}
                                    </h4>
                                    <div className="space-y-4">
                                      {sortedServices.map(
                                        (
                                          item: any,
                                          iIdx: number,
                                        ) => (
                                          <div
                                            key={iIdx}
                                            className="flex justify-between items-start pb-2 border-b border-gray-200/50 last:border-0 hover:bg-white/50 p-2 rounded-lg transition-colors"
                                          >
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-800">
                                                  {item.name}
                                                </span>
                                                {item.owner_recommended && (
                                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FF9800]/10 border border-[#FF9800]/30 text-[10px] font-bold text-[#FF9800] uppercase tracking-wide">
                                                    <Sparkles className="h-3 w-3" />
                                                    Pick
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                            <div className="text-right pl-4">
                                              <div className="font-bold text-gray-900">
                                                $
                                                {item.regular ||
                                                  item.price ||
                                                  0}
                                              </div>
                                              {item.member && (
                                                <div className="text-xs text-[#FF9800] font-bold">
                                                  VIP: $
                                                  {item.member}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  </div>
                                );
                              },
                            )}
                          </div>
                        )}

                        <div className="mt-8 pt-6 border-t border-dashed border-gray-300 relative z-10">
                          <Link
                            to="/booking"
                            className="inline-flex items-center text-sm font-bold text-gray-900 hover:text-[#FF9800] transition-colors uppercase tracking-wider"
                          >
                            {t("services_page.book_category")}{" "}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </Masonry>
              </ResponsiveMasonry>
            )}
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-24 bg-[#0B0F19] relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <Zap className="h-12 w-12 text-[#FF9800] mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
            {t("services_page.ready_title")}
          </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            {t("services_page.ready_desc")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              className="bg-[#FF9800] hover:bg-[#F57C00] text-white rounded-full px-10 h-14 text-lg font-bold shadow-[0_0_20px_rgba(255,152,0,0.4)] hover:shadow-[0_0_30px_rgba(255,152,0,0.6)] transition-all"
            >
              <Link
                to="/booking"
                onClick={() => window.scrollTo(0, 0)}
              >
                {t("services_page.book_appointment")}
              </Link>
            </Button>

            <AnimatedButton
              to="/locations"
              className="rounded-full px-10 h-14 text-lg font-bold"
            >
              {t("services_page.find_location")}
            </AnimatedButton>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}