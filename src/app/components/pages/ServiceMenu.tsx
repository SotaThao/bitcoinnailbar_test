import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { motion } from "motion/react";
import PublicLayout from "../PublicLayout";
import { SEOHead } from "../shared/SEOHead";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  BookOpen,
} from "lucide-react";
import { Card } from "../ui/card";
import {
  PillTabs,
  PillTabsContent,
  PillTabsList,
  PillTabsTrigger,
} from "../ui/pill-tabs";
import { cn } from "../ui/utils";
import { useLanguage } from "../../context/LanguageContext";
import { projectId, publicAnonKey } from "@utils/supabase/info";
import { useServiceCategories } from "../../hooks/useServiceCategories";

export function ServiceMenu() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("");
  const [serviceData, setServiceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load categories from backend (same as admin)
  const {
    categories: rawCategories,
    loading: categoriesLoading,
  } = useServiceCategories();

  // Filter only active categories for public display and sort by displayOrder
  const categories = rawCategories
    .filter((cat: any) => cat.status === "active")
    .sort(
      (a: any, b: any) =>
        (a.displayOrder ?? 999) - (b.displayOrder ?? 999),
    );

  // Auto-select first category when loaded
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].key);
    }
  }, [categories, activeCategory]);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/settings/service-menu`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
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

  // Auto-navigate to ServicesPage if no menu data uploaded
  useEffect(() => {
    if (
      !loading &&
      !categoriesLoading &&
      serviceData === null
    ) {
      console.log(
        "No service menu uploaded, redirecting to ServicesPage...",
      );
      navigate("/services");
    }
  }, [loading, categoriesLoading, serviceData, navigate]);

  if (loading || categoriesLoading) {
    return (
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#FF9800]" />
        </div>
      </section>
    );
  }

  // No categories available
  if (categories.length === 0) {
    return (
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto">
            <span className="text-[#FF9800] font-bold tracking-widest text-sm uppercase">
              {t("services_page.service_menu.title")}
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#0B0F19] mt-3 mb-8">
              {t("services_page.service_menu.subtitle")}
            </h2>
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
              <p className="text-gray-500">
                No service categories available.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const activeData = serviceData?.[activeCategory];

  // Filter groups that will actually be rendered (have regular services)
  const displayableGroups =
    activeData?.groups?.filter((group: any) => {
      const items = group.items || [];
      // Check if group has any regular services (not just addons)
      return items.some(
        (s: any) => s.serviceType?.toLowerCase() !== "addon",
      );
    }) || [];

  const isSingleGroup = displayableGroups.length <= 1;

  // Find current category name
  const currentCategory = categories.find(
    (cat: any) => cat.key === activeCategory,
  );

  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-[#FF9800] font-bold tracking-widest text-sm uppercase">
            {t("services_page.service_menu.title")}
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#0B0F19] mt-3">
            {t("services_page.service_menu.subtitle")}
          </h2>
          <div className="w-24 h-1 bg-[#FF9800] mx-auto mt-6"></div>

          {/* Menu Bitcoin Nail Bar CTA Button */}
          <Link
            to="/menu"
            className="inline-flex items-center gap-3 mt-8 px-8 py-4 bg-gradient-to-r from-[#0B0F19] to-[#1a1f2e] text-white font-bold text-base md:text-lg rounded-full shadow-[0_4px_20px_rgba(255,152,0,0.3)] hover:shadow-[0_8px_32px_rgba(255,152,0,0.5)] border border-[#FF9800]/30 hover:border-[#FF9800] transition-all duration-300 hover:scale-105 group"
          >
            <BookOpen className="h-5 w-5 text-[#FF9800] group-hover:scale-110 transition-transform duration-300" />
            <span>Menu Bitcoin Nail Bar</span>
            <span className="text-[#FF9800] group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto"
        >
          {/* Left Sidebar - Categories */}
          <div className="w-full lg:w-1/4">
            <div className="bg-white rounded-xl shadow-lg p-2 space-y-1 sticky top-24">
              {rawCategories
                .filter(
                  (cat: any) =>
                    !["add-on", "add-ons", "addon"].includes(
                      cat.key,
                    ),
                )
                .sort(
                  (a: any, b: any) =>
                    (a.displayOrder ?? 999) -
                    (b.displayOrder ?? 999),
                )
                .map((cat: any) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.key)}
                    className={cn(
                      "w-full text-left px-4 py-4 rounded-lg flex items-center gap-3 transition-all duration-300",
                      activeCategory === cat.key
                        ? "bg-[#FF9800] text-white shadow-md"
                        : "text-gray-600 hover:bg-gray-50 hover:text-[#FF9800]",
                    )}
                  >
                    <span className="font-semibold text-sm">
                      {cat.name}
                    </span>
                  </button>
                ))}
            </div>
          </div>

          {/* Right Content - Services Table */}
          <div className="w-full lg:w-3/4">
            <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
              {/* Header */}
              <div className="bg-[#0B0F19] px-8 py-6 flex justify-between items-center">
                <h3 className="text-2xl font-serif font-bold text-white">
                  {rawCategories.find(
                    (c: any) => c.key === activeCategory,
                  )?.name || activeCategory}
                </h3>
              </div>

              {/* Content Groups */}
              <div className="p-8">
                {displayableGroups.length === 0 ? (
                  /* Empty State */
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          cx="11"
                          cy="11"
                          r="8"
                          strokeWidth="2"
                        />
                        <path
                          d="m21 21-4.35-4.35"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-base">
                      No services found in this category.
                    </p>
                  </div>
                ) : (
                  <div
                    className={cn(
                      "relative grid grid-cols-1 gap-12",
                      !isSingleGroup
                        ? "md:grid-cols-2"
                        : "md:grid-cols-1",
                    )}
                  >
                    {!isSingleGroup && <VerticalDivider />}
                    {displayableGroups.map(
                      (group: any, idx: number) => {
                        // Get all services from ALL categories (for cross-category addon lookup)
                        const allServices = serviceData
                          ? Object.values(serviceData).flatMap(
                              (cat: any) =>
                                cat.groups?.flatMap(
                                  (g: any) => g.items || [],
                                ) || [],
                            )
                          : [];

                        // Get ALL addons globally (matching Admin's allAddons prop)
                        const allAddons = allServices.filter(
                          (s: any) =>
                            s.serviceType?.toLowerCase() ===
                            "addon",
                        );

                        // Get services from THIS group only
                        const groupItems = group.items || [];

                        // Filter regular services (exclude addons)
                        const regularServices =
                          groupItems.filter(
                            (s: any) =>
                              s.serviceType?.toLowerCase() !==
                              "addon",
                          );

                        // Build parent-child groups
                        const grouped = regularServices.map(
                          (parent: any) => {
                            const childAddons =
                              allAddons.filter(
                                (addon: any) =>
                                  parent.compatibleServiceIds &&
                                  parent.compatibleServiceIds.some(
                                    (id: any) =>
                                      String(id) ===
                                      String(addon.id),
                                  ),
                              );
                            return {
                              parent,
                              addons: childAddons,
                            };
                          },
                        );

                        return grouped.length > 0 ? (
                          <div key={idx} className="space-y-6">
                            <h4 className="text-[#FF9800] font-bold tracking-widest text-sm uppercase border-b border-gray-100 pb-2">
                              {group.name}
                            </h4>

                            {/* Desktop Header */}
                            <div
                              className={cn(
                                "hidden md:block",
                                isSingleGroup && "w-full",
                              )}
                            >
                              {isSingleGroup ? (
                                <div className="grid grid-cols-2 gap-12">
                                  <ServiceTableHeader t={t} />
                                  <ServiceTableHeader t={t} />
                                </div>
                              ) : (
                                <ServiceTableHeader t={t} />
                              )}
                            </div>

                            {/* Mobile Header */}
                            <div className="md:hidden">
                              <ServiceTableHeader t={t} />
                            </div>

                            <div
                              className={cn(
                                "relative space-y-1",
                                isSingleGroup &&
                                  "grid md:grid-cols-2 md:gap-x-12 md:space-y-0 md:gap-y-1",
                              )}
                            >
                              {isSingleGroup && (
                                <VerticalDivider />
                              )}
                              {grouped.map(
                                (item, itemIdx: number) => (
                                  <div
                                    key={itemIdx}
                                    className="break-inside-avoid"
                                  >
                                    {/* Parent Service Row */}
                                    <ServiceItemRow
                                      item={item.parent}
                                    />

                                    {/* Child Addon Rows */}
                                    {item.addons.map(
                                      (
                                        addon: any,
                                        addonIdx: number,
                                      ) => {
                                        const regularPrice =
                                          addon.regular ||
                                          addon.price ||
                                          0;
                                        const memberPrice =
                                          addon.member ||
                                          addon.memberPrice ||
                                          addon.price ||
                                          0;

                                        return (
                                          <div
                                            key={`addon-${addonIdx}`}
                                            className="flex justify-between items-center p-2 bg-orange-50/30 hover:bg-orange-50/50 rounded transition-colors group border-b border-gray-50 last:border-0 pl-8"
                                          >
                                            <div className="flex items-center gap-2">
                                              <span className="text-gray-400 text-sm">
                                                └─
                                              </span>
                                              <span className="text-gray-600 font-medium group-hover:text-gray-900 transition-colors italic text-sm">
                                                {addon.name}
                                              </span>
                                            </div>
                                            <div className="flex gap-6 text-sm">
                                              <span className="w-12 text-right text-gray-600 font-semibold group-hover:text-gray-900 transition-colors">
                                                +${regularPrice}
                                              </span>
                                              <span className="w-12 text-right text-[#FF9800] font-bold">
                                                +${memberPrice}
                                              </span>
                                            </div>
                                          </div>
                                        );
                                      },
                                    )}
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        ) : null;
                      },
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function VerticalDivider() {
  return (
    <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 -translate-x-1/2" />
  );
}

function ServiceTableHeader({ t }: { t: any }) {
  return (
    <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2 px-2">
      <span>
        {t("services_page.service_menu.headers.service")}
      </span>
      <div className="flex gap-6">
        <span className="w-12 text-right">
          {t("services_page.service_menu.headers.regular")}
        </span>
        <span className="w-12 text-right text-[#FF9800]">
          {t("services_page.service_menu.headers.member")}
        </span>
      </div>
    </div>
  );
}

function ServiceItemRow({
  item,
}: {
  item: { name: string; regular: number; member: number };
}) {
  return (
    <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded transition-colors group border-b border-gray-50 last:border-0">
      <span className="text-gray-700 font-medium group-hover:text-[#0B0F19]">
        {item.name}
      </span>
      <div className="flex gap-6 text-sm">
        <span className="w-12 text-right text-gray-900 font-bold">
          ${item.regular}
        </span>
        <span className="w-12 text-right text-[#FF9800] font-bold">
          ${item.member}
        </span>
      </div>
    </div>
  );
}

function ServiceAddons({
  serviceId,
  allItems,
}: {
  serviceId: string;
  allItems: any[];
}) {
  // Find add-ons that are compatible with this service
  const addons = allItems.filter(
    (item: any) =>
      item.serviceType === "addon" &&
      item.compatibleServiceIds &&
      item.compatibleServiceIds.includes(serviceId),
  );

  if (addons.length === 0) {
    return null;
  }

  return (
    <div className="ml-6 mt-1 space-y-1">
      {addons.map((addon: any, idx: number) => (
        <div
          key={idx}
          className="flex justify-between items-center py-1.5 px-2 bg-orange-50 rounded transition-colors group border-l-2 border-orange-300"
        >
          <span className="text-sm text-gray-600 flex items-center gap-2">
            <span className="text-orange-500">&darr;</span>
            <span className="italic">{addon.name}</span>
          </span>
          <div className="flex gap-6 text-xs">
            <span className="w-12 text-right text-gray-700 font-medium">
              +${addon.regular}
            </span>
            <span className="w-12 text-right text-[#FF9800] font-medium">
              +${addon.member}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}