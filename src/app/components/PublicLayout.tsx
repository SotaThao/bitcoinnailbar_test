import { useState, useEffect, useRef } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router";
import {
  Sparkles,
  Calendar,
  MapPin,
  Star,
  Menu,
  X,
  Bitcoin,
  Facebook,
  Instagram,
  Wallet,
  CreditCard,
  Gem,
  DollarSign,
  Coins,
  ChevronDown,
  PenTool,
  Droplets,
  Scissors,
  Footprints,
  Hand,
  Baby,
  PlusCircle,
  Crown,
  Gift,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { PrimaryButton } from "./PrimaryButton";
import { Chatbot } from "./Chatbot";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { BottomNav } from "./BottomNav";
import { CryptoTicker } from "./CryptoTicker";
import { BrandLogo } from "./BrandLogo";
import { useLanguage } from "../context/LanguageContext";
import { useLoadingState } from "../context/LoadingContext";
import { useSequentialLoad } from "../hooks/useSequentialLoad";
import { openExternalBookingInNewTab } from "../lib/external-booking";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { ASSETS } from "../config/assets";

interface PublicLayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  id: string;
  name: string;
  order: number;
}

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

// Helper function to ensure URLs have https:// prefix
const ensureHttps = (url: string): string => {
  if (!url) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `https://${url}`;
};

export default function PublicLayout({
  children,
}: PublicLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] =
    useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { t } = useLanguage();
  const { hasPromotionModal, modalRendered } =
    useLoadingState();
  const { loadCryptoTicker, loadChatbot } = useSequentialLoad({
    hasPromotionModal,
    modalRendered,
  });

  // State for desktop hover dropdown
  const [desktopServicesOpen, setDesktopServicesOpen] =
    useState(false);
  // useRef to store timeout ID for delayed close
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [socialMedia, setSocialMedia] = useState({
    facebook: "",
    instagram: "",
    tiktok: "",
  });

  const [menuItems, setMenuItems] = useState<Array<MenuItem>>(
    [],
  );
  const [serviceCategories, setServiceCategories] = useState<
    Array<{
      id: string;
      name: string;
      key: string;
      displayOrder: number;
    }>
  >([]);
  const [hasUploadedMenu, setHasUploadedMenu] = useState(false);
  const [menuDisplayMode, setMenuDisplayMode] = useState<
    "menu-flipbook" | "services-list"
  >("services-list");

  // Hide header when payment modal is open
  const [isPaymentModalOpen, setIsPaymentModalOpen] =
    useState(false);

  useEffect(() => {
    const checkPaymentModal = () => {
      setIsPaymentModalOpen(
        document.body.classList.contains("payment-modal-open"),
      );
    };

    checkPaymentModal();

    const observer = new MutationObserver(checkPaymentModal);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // Show header after scrolling past hero section (approx 400px)
      setIsScrolled(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial state
    return () =>
      window.removeEventListener("scroll", handleScroll);
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
          setSocialMedia(result.data);
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

  // Fetch menu items
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/menu/images`,
          {
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
            },
          },
        );
        const result = await response.json();

        if (result.success && result.data) {
          // Get unique menu names (keep first occurrence by order)
          const uniqueMenus: MenuItem[] = [];
          const seenNames = new Set<string>();

          result.data
            .sort((a: any, b: any) => a.order - b.order) // Sort by order first
            .forEach((img: any) => {
              if (!seenNames.has(img.name)) {
                uniqueMenus.push({
                  id: img.id,
                  name: img.name,
                  order: img.order,
                });
                seenNames.add(img.name);
              }
            });

          setMenuItems(uniqueMenus);
        }
      } catch (error) {
        console.error("Failed to fetch menu items:", error);
      }
    };

    fetchMenuItems();
  }, []);

  // Fetch service categories
  useEffect(() => {
    const fetchServiceCategories = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/settings/categories`,
          {
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
            },
          },
        );
        const result = await response.json();

        if (
          result.success &&
          result.data &&
          result.data.length > 0
        ) {
          // Filter active categories and sort by displayOrder
          const activeCategories = result.data
            .filter((cat: any) => cat.status === "active")
            .sort(
              (a: any, b: any) =>
                (a.displayOrder ?? 999) -
                (b.displayOrder ?? 999),
            );
          setServiceCategories(activeCategories);
        }
      } catch (error) {
        console.error(
          "Failed to fetch service categories:",
          error,
        );
      }
    };

    fetchServiceCategories();
  }, []);

  // Fetch homepage menu display mode
  useEffect(() => {
    const fetchMenuMode = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/settings/homepage-menu`,
          {
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
            },
          },
        );
        const result = await response.json();

        if (result.success && result.data) {
          setMenuDisplayMode(result.data.mode);
        }
      } catch (error) {
        console.error(
          "Failed to fetch menu display mode:",
          error,
        );
      }
    };

    fetchMenuMode();
  }, []);

  // Handle smooth scroll to hash anchor on navigation
  useEffect(() => {
    // Wait for page to load
    const handleHashScroll = () => {
      const hash = location.hash;
      if (hash) {
        // Remove # from hash
        const elementId = hash.substring(1);
        const element = document.getElementById(elementId);

        if (element) {
          // Use setTimeout to ensure page has rendered
          setTimeout(() => {
            const headerOffset = 144; // Height of fixed header (80px nav + 64px crypto ticker)
            const elementPosition =
              element.getBoundingClientRect().top;
            const offsetPosition =
              elementPosition +
              window.pageYOffset -
              headerOffset;

            window.scrollTo({
              top: offsetPosition,
              behavior: "smooth",
            });
          }, 100);
        }
      }
    };

    // Handle hash on initial load and route changes
    handleHashScroll();
  }, [location]);

  const navLinks = [
    { path: "/", label: t("nav.home") },
    { path: "/#about", label: t("nav.about_us") },
    { path: "/menu", label: t("nav.services"), dropdown: true }, // Changed from /services to /menu
    {
      path: "/promotions",
      label: t("nav.promotions") || "Promotions",
    },
    {
      path: "/egift",
      label: t("nav.egift") || "E-GIFT",
      highlighted: true,
    },
    {
      path: "/membership",
      label: t("nav.membership") || "Membership",
    },
    { path: "/careers", label: t("nav.careers") || "Careers" },
    { path: "/gallery", label: t("nav.gallery") || "Gallery" },
  ];

  const eGiftLink = {
    path: "/egift",
    label: t("nav.egift") || "E-GIFT",
  };
  const isHomePage = location.pathname === "/";

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19] overflow-x-hidden w-full relative">
      {/* Backdrop Overlay for Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Header / Navigation */}
      <header
        className={`fixed top-0 z-50 w-full border-b border-white/5 bg-[#0B0F19]/90 backdrop-blur supports-[backdrop-filter]:bg-[#0B0F19]/60 transition-all duration-500 translate-y-0 opacity-100 ${isPaymentModalOpen ? "hidden" : ""}`}
      >
        {loadCryptoTicker && <CryptoTicker />}
        <div className="container mx-auto px-4">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <BrandLogo />

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center gap-1">
              {navLinks.map((link, index) =>
                link.dropdown ? (
                  <div
                    key={index}
                    className="relative"
                    onMouseEnter={() => {
                      if (closeTimeoutRef.current) {
                        clearTimeout(closeTimeoutRef.current);
                        closeTimeoutRef.current = null;
                      }
                      setDesktopServicesOpen(true);
                    }}
                    onMouseLeave={() => {
                      if (closeTimeoutRef.current) {
                        clearTimeout(closeTimeoutRef.current);
                      }
                      closeTimeoutRef.current = setTimeout(
                        () => setDesktopServicesOpen(false),
                        150,
                      );
                    }}
                  >
                    <button
                      type="button"
                      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all h-9 px-4 py-2 outline-none ${
                        desktopServicesOpen
                          ? "text-[#FF9800] bg-white/5"
                          : "text-gray-300 hover:text-[#FF9800] hover:bg-white/5"
                      }`}
                    >
                      {link.label}{" "}
                      <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${desktopServicesOpen ? "rotate-180" : ""}`} />
                    </button>
                    {desktopServicesOpen && (
                      <div className="absolute top-full left-0 pt-1 z-50">
                        <div className="bg-[#0B0F19] border border-white/10 text-gray-300 min-w-[260px] p-2 rounded-lg shadow-xl">
                          {/* Menu Bitcoin Nail Bar - Always show at top */}
                          <Link
                            to="/menu"
                            className="flex items-center gap-3 py-2 px-3 font-semibold text-[#FF9800] rounded-lg hover:bg-white/10 transition-colors"
                            onClick={() => setDesktopServicesOpen(false)}
                          >
                            <span>Menu Bitcoin Nail Bar</span>
                          </Link>
                          <div className="h-px bg-white/10 my-1" />
                          {menuDisplayMode === "menu-flipbook"
                            ? menuItems.map((item) => (
                                <Link
                                  key={item.id}
                                  to={`/menu?page=${item.order}`}
                                  className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-white/10 hover:text-[#FF9800] transition-colors"
                                  onClick={() => setDesktopServicesOpen(false)}
                                >
                                  <span>{item.name}</span>
                                </Link>
                              ))
                            : serviceCategories.map((category) => (
                                <Link
                                  key={category.id}
                                  to={`/services/${category.key}`}
                                  className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-white/10 hover:text-[#FF9800] transition-colors"
                                  onClick={() => setDesktopServicesOpen(false)}
                                >
                                  <span>{category.name}</span>
                                </Link>
                              ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : link.highlighted ? (
                  // E-GIFT Button - Highlighted
                  <Link key={index} to={link.path}>
                    <Button
                      variant="ghost"
                      className="group relative h-9 overflow-hidden border border-[#FF9800]/30 font-bold text-[#FF9800] hover:border-[#FF9800] hover:text-white hover:bg-transparent"
                    >
                      <span className="absolute inset-0 w-0 bg-[#FF9800] transition-all duration-300 ease-out group-hover:w-full" />
                      <span className="relative z-10 flex items-center gap-2">
                        🎁 {link.label}
                      </span>
                    </Button>
                  </Link>
                ) : (
                  <Link key={index} to={link.path}>
                    <Button
                      variant="ghost"
                      className={`h-9 text-gray-300 hover:text-[#FF9800] hover:bg-white/5 ${
                        location.pathname === link.path
                          ? "text-[#FF9800] bg-white/5"
                          : ""
                      }`}
                    >
                      {link.label}
                    </Button>
                  </Link>
                ),
              )}
            </nav>

            {/* CTA Button (Desktop) */}
            <div className="hidden xl:flex items-center gap-2">
              <LanguageSwitcher align="end" />
              {isHomePage ? (
                <PrimaryButton
                  type="button"
                  onClick={openExternalBookingInNewTab}
                  startIcon={<Calendar className="h-4 w-4" />}
                  className="text-white animate-[glowring_1.5s_ease-out_infinite]"
                >
                  {t("coming_soon.book_now")}
                </PrimaryButton>
              ) : (
                <Link to="/booking">
                  <PrimaryButton
                    startIcon={<Calendar className="h-4 w-4" />}
                    className="text-white animate-[glowring_1.5s_ease-out_infinite]"
                  >
                    {t("coming_soon.book_now")}
                  </PrimaryButton>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="xl:hidden flex items-center gap-2">
              <LanguageSwitcher align="end" />
              <button
                className="p-2 rounded-lg text-white hover:bg-white/10"
                onClick={() =>
                  setMobileMenuOpen(!mobileMenuOpen)
                }
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="xl:hidden py-4 border-t border-white/10 bg-[#0B0F19]">
              <nav className="flex flex-col gap-2 w-full">
                {navLinks.map((link, index) =>
                  link.dropdown ? (
                    // Services - Dropdown on mobile
                    <DropdownMenu key={index}>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className={`w-full justify-center text-gray-300 hover:text-[#FF9800] hover:bg-white/5 data-[state=open]:text-[#FF9800] data-[state=open]:bg-white/5 ${
                            location.pathname === link.path
                              ? "text-[#FF9800] bg-white/5"
                              : ""
                          }`}
                        >
                          {link.label}{" "}
                          <ChevronDown className="ml-1 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-[#0B0F19] border-white/10 text-gray-300 min-w-[260px] p-2">
                        {/* Menu Bitcoin Nail Bar - Always show at top */}
                        <DropdownMenuItem
                          asChild
                          className="focus:bg-white/10 focus:text-[#FF9800] cursor-pointer rounded-lg mb-1"
                        >
                          <Link
                            to="/menu"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 py-2 px-3 font-semibold text-[#FF9800]"
                          >
                            <span>Menu Bitcoin Nail Bar</span>
                          </Link>
                        </DropdownMenuItem>
                        <div className="h-px bg-white/10 my-1" />
                        {/* Show menu based on system settings: 'menu-flipbook' (uploaded) or 'services-list' (categories) */}
                        {menuDisplayMode === "menu-flipbook"
                          ? // Show uploaded menu items
                            menuItems.map((item) => (
                              <DropdownMenuItem
                                key={item.id}
                                asChild
                                className="focus:bg-white/10 focus:text-[#FF9800] cursor-pointer rounded-lg mb-1"
                              >
                                <Link
                                  to={`/menu?page=${item.order}`}
                                  onClick={() =>
                                    setMobileMenuOpen(false)
                                  }
                                  className="flex items-center gap-3 py-2 px-3"
                                >
                                  <span>{item.name}</span>
                                </Link>
                              </DropdownMenuItem>
                            ))
                          : // Fallback: Show service categories from backend
                            serviceCategories.map(
                              (category) => (
                                <DropdownMenuItem
                                  key={category.id}
                                  asChild
                                  className="focus:bg-white/10 focus:text-[#FF9800] cursor-pointer rounded-lg mb-1"
                                >
                                  <Link
                                    to={`/services/${category.key}`}
                                    onClick={() =>
                                      setMobileMenuOpen(false)
                                    }
                                    className="flex items-center gap-3 py-2 px-3"
                                  >
                                    <span>{category.name}</span>
                                  </Link>
                                </DropdownMenuItem>
                              ),
                            )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : link.highlighted ? (
                    // E-Gift - Highlighted with icon and orange color
                    <Link
                      key={index}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex justify-center"
                    >
                      <Button
                        variant="ghost"
                        className={`justify-center font-bold text-[#FF9800] hover:text-[#FF9800] hover:bg-[#FF9800]/10 border border-[#FF9800]/30 px-6 ${
                          location.pathname === link.path
                            ? "bg-[#FF9800]/10"
                            : ""
                        }`}
                      >
                        <Gift className="h-4 w-4 mr-2" />
                        {link.label}
                      </Button>
                    </Link>
                  ) : (
                    // Regular Links
                    <Link
                      key={index}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full"
                    >
                      <Button
                        variant="ghost"
                        className={`w-full justify-center text-gray-300 hover:text-[#FF9800] hover:bg-white/5 ${
                          location.pathname === link.path
                            ? "text-[#FF9800] bg-white/5"
                            : ""
                        }`}
                      >
                        {link.label}
                      </Button>
                    </Link>
                  ),
                )}
                {isHomePage ? (
                  <PrimaryButton
                    type="button"
                    className="w-full gap-2 bg-[#FF9800] text-[#0B0F19]"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openExternalBookingInNewTab();
                    }}
                  >
                    <Calendar className="h-4 w-4" />
                    {t("nav.booking")}
                  </PrimaryButton>
                ) : (
                  <Link
                    to="/booking"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full"
                  >
                    <PrimaryButton className="w-full gap-2 bg-[#FF9800] text-[#0B0F19]">
                      <Calendar className="h-4 w-4" />
                      {t("nav.booking")}
                    </PrimaryButton>
                  </Link>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-[144px] pb-[80px] lg:pb-0 pr-[0px] pl-[0px]">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[rgb(3,0,32)] pb-24 lg:pb-0">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.5fr_auto_auto] gap-8 lg:gap-24">
            {/* Brand */}
            <div className="space-y-6">
              <BrandLogo />
              <p className="text-sm text-gray-400 leading-relaxed">
                {t("footer.desc")}
              </p>

              {/* Social Media */}
              <div className="flex items-center gap-4">
                {socialMedia.facebook && (
                  <a
                    href={ensureHttps(socialMedia.facebook)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-[#1A1F2E] border border-white/5 flex items-center justify-center text-gray-400 hover:bg-[#FF9800] hover:text-[#0B0F19] hover:border-[#FF9800] transition-all duration-300"
                  >
                    <Facebook className="h-4 w-4" />
                  </a>
                )}
                {socialMedia.instagram && (
                  <a
                    href={ensureHttps(socialMedia.instagram)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-[#1A1F2E] border border-white/5 flex items-center justify-center text-gray-400 hover:bg-[#FF9800] hover:text-[#0B0F19] hover:border-[#FF9800] transition-all duration-300"
                  >
                    <Instagram className="h-4 w-4" />
                  </a>
                )}
                {socialMedia.tiktok && (
                  <a
                    href={ensureHttps(socialMedia.tiktok)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-[#1A1F2E] border border-white/5 flex items-center justify-center text-gray-400 hover:bg-[#FF9800] hover:text-[#0B0F19] hover:border-[#FF9800] transition-all duration-300"
                  >
                    <TikTokIcon className="h-4 w-4" />
                  </a>
                )}
              </div>

              {/* Payment Methods */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase not-italic">
                  {t("footer.accept") ||
                    "SUPPORTED PAYMENT METHODS"}
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  {/* Bitcoin */}
                  <div
                    className="group relative flex items-center justify-center w-12 h-12 rounded-lg text-[#9ca3af] hover:text-[#F7931A] transition-all duration-200"
                    title="Bitcoin"
                  >
                    <img
                      src="https://pwmrmcipniefewufwjjy.supabase.co/storage/v1/object/public/NailPage/Symbol.png"
                      alt="Bitcoin"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-[#F7931A] text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-lg">
                      Bitcoin (BTC)
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#F7931A] rotate-45"></div>
                    </div>
                  </div>

                  {/* Ethereum */}
                  <div
                    className="group relative flex items-center justify-center w-12 h-12 rounded-lg text-[#627EEA] hover:text-[#627EEA] transition-all duration-200"
                    title="Ethereum"
                  >
                    <img
                      src="https://pwmrmcipniefewufwjjy.supabase.co/storage/v1/object/public/NailPage/Etherum.png"
                      alt="Ethereum"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-[#627EEA] text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-lg">
                      Ethereum (ETH)
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#627EEA] rotate-45"></div>
                    </div>
                  </div>

                  {/* USDC */}
                  <div
                    className="group relative flex items-center justify-center w-12 h-12 rounded-lg text-[#2775CA] transition-all duration-200"
                    title="USDC"
                  >
                    <img
                      src={ASSETS.layoutFeature3}
                      alt="USDT/USDC"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-[#2775CA] text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-lg">
                      USDT/USDC
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#2775CA] rotate-45"></div>
                    </div>
                  </div>

                  {/* Visa */}
                  <div
                    className="group relative flex items-center justify-center p-[0px] h-12 rounded-lg bg-[rgb(255,255,255)] border border-white/10 hover:border-[#1A1F6F] transition-all duration-200 px-[12px] py-[0px]"
                    title="Visa"
                  >
                    <img
                      src="https://pwmrmcipniefewufwjjy.supabase.co/storage/v1/object/public/NailPage/visa_318-202971.avif"
                      alt="Visa"
                      className="h-8 w-auto object-contain m-1"
                    />
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-[#1A1F6F] text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-lg">
                      Visa Card
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1A1F6F] rotate-45"></div>
                    </div>
                  </div>

                  {/* Mastercard */}
                  <div
                    className="group relative flex items-center justify-center px-3 h-12 rounded-lg bg-[rgb(255,255,255)] border border-white/10 hover:border-red-600 transition-all duration-200"
                    title="Mastercard"
                  >
                    <img
                      src="https://pwmrmcipniefewufwjjy.supabase.co/storage/v1/object/public/NailPage/Mastercard-logo.svg"
                      alt="Mastercard"
                      className="h-6 w-auto object-contain"
                    />
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-lg">
                      Mastercard
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-600 rotate-45"></div>
                    </div>
                  </div>

                  {/* Zelle */}
                  <div
                    className="group relative flex items-center justify-center px-3 h-12 rounded-lg bg-[rgb(255,255,255)] border border-white/10 hover:border-[#6D1ED4] transition-all duration-200"
                    title="Zelle"
                  >
                    <img
                      src="https://pwmrmcipniefewufwjjy.supabase.co/storage/v1/object/public/NailPage/Zelle_logo.svg%20(1).png"
                      alt="Zelle"
                      className="h-6 w-auto object-contain"
                    />
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-[#6D1ED4] text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-lg">
                      Zelle
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#6D1ED4] rotate-45"></div>
                    </div>
                  </div>

                  {/* Venmo */}
                  <div
                    className="group relative flex items-center justify-center px-3 h-12 rounded-lg bg-[rgb(255,255,255)] border border-white/10 hover:border-[#3D95CE] transition-all duration-200"
                    title="Venmo"
                  >
                    <img
                      src="https://pwmrmcipniefewufwjjy.supabase.co/storage/v1/object/public/NailPage/Venmo-Woordmark-Logo.png"
                      alt="Venmo"
                      className="h-6 w-auto object-contain"
                    />
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-[#3D95CE] text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-lg">
                      Venmo
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#3D95CE] rotate-45"></div>
                    </div>
                  </div>

                  {/* VLINKPAY */}
                  <div
                    className="group relative flex items-center justify-center px-3 h-12 rounded-lg bg-[rgb(255,255,255)] border border-white/10 hover:border-gray-400 transition-all duration-200"
                    title="VLINKPAY"
                  >
                    <span className="text-xs font-bold text-white flex items-center gap-1">
                      <img
                        src="https://pwmrmcipniefewufwjjy.supabase.co/storage/v1/object/public/NailPage/Logongang.png"
                        alt="VLINKPAY"
                        className="h-6 w-auto object-contain"
                      />
                    </span>
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-400 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-lg">
                      VLINKPAY
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-400 rotate-45"></div>
                    </div>
                  </div>

                  {/* Cash App */}
                  <div
                    className="group relative flex items-center justify-center px-3 h-12 rounded-lg bg-[rgb(255,255,255)] border border-white/10 hover:border-[#00D54B] transition-all duration-200"
                    title="Cash App"
                  >
                    <span className="text-xs font-bold text-[rgb(16,0,66)] flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      Cash App
                    </span>
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-[#00D54B] text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-lg">
                      Cash App
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#00D54B] rotate-45"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links & Services Stacked */}
            <div className="lg:w-fit grid grid-cols-2 gap-8 lg:gap-12">
              <div>
                <h3 className="font-medium mb-4 text-white">
                  {t("footer.quick_links")}
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link
                      to="/services"
                      className="text-gray-400 hover:text-[#FF9800] transition-colors"
                    >
                      {t("nav.services")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/booking"
                      className="text-gray-400 hover:text-[#FF9800] transition-colors"
                    >
                      {t("nav.booking")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/locations"
                      className="text-gray-400 hover:text-[#FF9800] transition-colors"
                    >
                      {t("nav.locations")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/reviews"
                      className="text-gray-400 hover:text-[#FF9800] transition-colors"
                    >
                      {t("nav.reviews")}
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium mb-4 text-white">
                  {t("footer.popular_services")}
                </h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>
                    {t(
                      "services_page.categories.signature.items.0.name",
                    )}
                  </li>
                  <li>
                    {t(
                      "services_page.categories.signature.items.1.name",
                    )}
                  </li>
                  <li>
                    {t(
                      "services_page.categories.signature.items.2.name",
                    )}
                  </li>
                  <li>
                    {t(
                      "services_page.categories.comprehensive.items.3.name",
                    ) || "Nail Art"}
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact */}
            <div className="lg:w-fit">
              <h3 className="font-medium mb-4 text-white">
                {t("footer.contact")}
              </h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#FF9800]" />
                  <span>
                    9793 Westheimer Rd, Houston, TX 77042
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#FF9800] font-bold">
                    Store:
                  </span>
                  <span>(346) 802-4906</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#FF9800] font-bold">
                    Cell Phone:
                  </span>
                  <span>(832) 799-3990</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#FF9800] font-bold">
                    Email:
                  </span>
                  <span>info@bitcoinnailbar.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 mt-8 pt-8 text-center text-sm text-gray-500">
            <div className="flex flex-col items-center gap-2">
              <p>
                &copy; 2026 Bitcoin Nail Bar.{" "}
                {t("footer.rights")}
              </p>
            </div>
          </div>
        </div>
      </footer>
      {loadChatbot && <Chatbot />}
      <BottomNav />
    </div>
  );
}