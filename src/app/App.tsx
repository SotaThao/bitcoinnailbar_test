import {
  BrowserRouter as Router,
  Navigate,
  useLocation,
  useRoutes,
} from "react-router";
import { useState, useEffect, lazy, Suspense } from "react";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "@/utils/disableConsoleLogs";

import HomePage from "@/app/components/pages/HomePage";
import ServicesPage from "@/app/components/pages/ServicesPage";
import PromotionsPage from "@/app/components/pages/PromotionsPage";
import MembershipPage from "@/app/components/pages/MembershipPage";
import CareersPage from "@/app/components/pages/CareersPage";
import GalleryPage from "@/app/components/pages/GalleryPage";
import EGiftPage from "@/app/components/pages/EGiftPage";
import ComingSoonPage from "@/app/components/pages/ComingSoonPage";
import LocationsPage from "@/app/components/pages/LocationsPage";
import ReviewsPage from "@/app/components/pages/ReviewsPage";
import PublicCheckInPage from "@/app/components/pages/CheckInPage";
import VIPPage from "@/app/components/pages/VIPPage";
import MenuPage from "@/app/components/pages/MenuPage";
import PaymentSuccessPage from "@/app/pages/PaymentSuccessPage";
import RedeemMembershipStandalonePage from "@/app/pages/RedeemMembershipStandalonePage";

import AdminKioskCheckInPage from "@/app/pages/CheckInPage";
import SetupOwnerPage from "@/app/pages/admin/SetupOwnerPage";
import LoginPage from "@/app/pages/admin/LoginPage";
import DebugAuth from "@/app/pages/admin/DebugAuth";
import TestSetup from "@/app/pages/admin/TestSetup";
import TestJWT from "@/app/pages/admin/TestJWT";
import { TestMigration } from "@/app/components/TestMigration";

const AdminDashboard = lazy(() => import("@/app/components/admin/Dashboard"));
const AdminAppointments = lazy(() => import("@/app/components/admin/Appointments"));
const AdminServices = lazy(() => import("@/app/components/admin/Services"));
const AdminReviews = lazy(() => import("@/app/components/admin/Reviews"));
const AdminStaffPayroll = lazy(() => import("@/app/components/admin/StaffPayroll"));
const AdminComingSoon = lazy(() => import("@/app/components/admin/AdminComingSoon"));
const AdminSettings = lazy(() => import("@/app/components/admin/Settings"));
const AdminMembership = lazy(() => import("@/app/components/admin/MembershipPage"));
const DebugData = lazy(() => import("@/app/components/admin/DebugData"));
const AdminGallery = lazy(() => import("@/app/components/admin/GalleryManagement"));

const RolePermissionsPage = lazy(() => import("@/app/pages/admin/RolePermissionsPage"));
const VLinkPaySettingsPage = lazy(() => import("@/app/pages/admin/VLinkPaySettingsPage"));
const RedeemCodesPage = lazy(() => import("@/app/pages/admin/RedeemCodesPage"));

import { ProtectedAdminRoute } from "@/app/components/ProtectedAdminRoute";
import { PromotionModal } from "@/app/components/PromotionModal";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "@/app/context/LanguageContext";
import { LoadingProvider } from "@/app/context/LoadingContext";
import { NotificationProvider } from "@/app/context/NotificationContext";
import { ScrollToTop } from "@/app/components/ScrollToTop";
import { Loader2 } from "lucide-react";

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
  type: "crypto" | "golden-hour" | "vip-royalty";
  enabled: boolean;
  featured: boolean;
  vi: PromotionLanguageData;
  en: PromotionLanguageData;
}

// Create a client for React Query with optimized cache settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Data fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // Cache for 10 minutes (renamed from cacheTime)
      retry: 1,
      refetchOnWindowFocus: false, // Don't refetch on tab switch
      refetchOnReconnect: false, // Don't refetch on reconnect
    },
  },
});

export default function App() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [modalRendered, setModalRendered] = useState(false);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/settings/promotions`,
          { headers: { Authorization: `Bearer ${publicAnonKey}` } }
        );

        const result = await response.json();

        console.log('🔍 [APP.TSX] Fetch promotions response:', {
          success: result.success,
          dataExists: !!result.data,
          promotionsCount: result.data?.promotions?.length || 0,
          rawPromotions: result.data?.promotions
        });

        // 🔍 DEBUG: Log buttonLink for each promotion
        if (result.data?.promotions) {
          result.data.promotions.forEach((promo: any) => {
            console.log(`🔗 [PROMOTION ${promo.id}] buttonLink:`, {
              vi: promo.vi?.buttonLink,
              en: promo.en?.buttonLink
            });
          });
        }

        if (result.success && result.data) {
          const promotionsData = result.data.promotions || [];
          
          // Sort newest first: numeric IDs (Date.now()) are newer, sort descending
          const sortedPromotions = [...promotionsData].sort((a: Promotion, b: Promotion) => {
            const aNum = Number(a.id);
            const bNum = Number(b.id);
            const aIsNumeric = !isNaN(aNum);
            const bIsNumeric = !isNaN(bNum);
            // Both numeric: newest (higher) first
            if (aIsNumeric && bIsNumeric) return bNum - aNum;
            // Numeric IDs are newer than string IDs
            if (aIsNumeric && !bIsNumeric) return -1;
            if (!aIsNumeric && bIsNumeric) return 1;
            return 0;
          });

          setPromotions(sortedPromotions);

          const isHomepage = window.location.pathname === "/";
          if (isHomepage) {
            const dismissedDate = localStorage.getItem("promotion-dismissed-date");
            const today = new Date().toISOString().split("T")[0];

            const hasFeaturedPromotions =
              Array.isArray(promotionsData) &&
              promotionsData.some((p: Promotion) => p.enabled && p.featured);

            console.log('🔍 [APP.TSX] Homepage modal logic:', {
              isHomepage,
              dismissedDate,
              today,
              hasFeaturedPromotions,
              willShowModal: dismissedDate !== today && hasFeaturedPromotions
            });

            if (dismissedDate !== today && hasFeaturedPromotions) {
              setTimeout(() => setShowPromotionModal(true), 500);
            }
          }
        }
      } catch (error) {
        console.error("❌ Failed to fetch promotions:", error);
      }
    };

    fetchPromotions();

    const handlePromotionsUpdated = () => fetchPromotions();
    window.addEventListener("promotions-updated", handlePromotionsUpdated);

    return () => window.removeEventListener("promotions-updated", handlePromotionsUpdated);
  }, []);

  const handleClosePromotionModal = () => setShowPromotionModal(false);

  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <LanguageProvider>
          <LoadingProvider hasPromotionModal={showPromotionModal} modalRendered={modalRendered}>
            <Router>
              <AppContent
                promotions={promotions}
                showPromotionModal={showPromotionModal}
                setShowPromotionModal={setShowPromotionModal}
                handleClosePromotionModal={handleClosePromotionModal}
                setModalRendered={setModalRendered}
              />
            </Router>
          </LoadingProvider>
        </LanguageProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

function AppContent({
  promotions,
  showPromotionModal,
  setShowPromotionModal,
  handleClosePromotionModal,
  setModalRendered,
}: {
  promotions: Promotion[];
  showPromotionModal: boolean;
  setShowPromotionModal: (show: boolean) => void;
  handleClosePromotionModal: () => void;
  setModalRendered: (rendered: boolean) => void;
}) {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== "/" && showPromotionModal) {
      setShowPromotionModal(false);
    }
  }, [location.pathname, showPromotionModal, setShowPromotionModal]);

  const routing = useRoutes([
    { path: "/", element: <HomePage /> },
    { path: "/services", element: <ServicesPage /> },
    { path: "/services/:categoryKey", element: <ServicesPage /> },
    { path: "/promotions", element: <PromotionsPage /> },
    { path: "/membership", element: <MembershipPage /> },
    { path: "/careers", element: <CareersPage /> },
    { path: "/gallery", element: <GalleryPage /> },
    { path: "/egift", element: <EGiftPage /> },
    { path: "/booking", element: <ExternalRedirect url="https://nailsolutionplus.firebaseapp.com/?storeKey=-OiuBNzy2Knxtk0uDGmn" /> },
    { path: "/locations", element: <LocationsPage /> },
    { path: "/reviews", element: <ReviewsPage /> },
    { path: "/vip", element: <VIPPage /> },
    { path: "/menu", element: <MenuPage /> },
    { path: "/coming-soon", element: <ComingSoonPage /> },
    { path: "/checkin/:id", element: <PublicCheckInPage /> },
    { path: "/redeem-membership", element: <RedeemMembershipStandalonePage /> },
    { path: "/payment/success", element: <PaymentSuccessPage /> },

    { path: "/admin", element: <Navigate to="/admin/dashboard" replace /> },

    {
      path: "/admin/dashboard",
      element: (
        <ProtectedAdminRoute>
          <Suspense fallback={<AdminLoadingFallback />}>
            <AdminDashboard />
          </Suspense>
        </ProtectedAdminRoute>
      ),
    },
    {
      path: "/admin/services",
      element: (
        <ProtectedAdminRoute>
          <Suspense fallback={<AdminLoadingFallback />}>
            <AdminServices />
          </Suspense>
        </ProtectedAdminRoute>
      ),
    },
    {
      path: "/admin/reviews",
      element: (
        <ProtectedAdminRoute>
          <Suspense fallback={<AdminLoadingFallback />}>
            <AdminReviews />
          </Suspense>
        </ProtectedAdminRoute>
      ),
    },
    {
      path: "/admin/appointments",
      element: (
        <ProtectedAdminRoute>
          <Suspense fallback={<AdminLoadingFallback />}>
            <AdminAppointments />
          </Suspense>
        </ProtectedAdminRoute>
      ),
    },
    {
      path: "/admin/staff",
      element: (
        <ProtectedAdminRoute>
          <Suspense fallback={<AdminLoadingFallback />}>
            <AdminStaffPayroll defaultTab="staff" />
          </Suspense>
        </ProtectedAdminRoute>
      ),
    },
    {
      path: "/admin/payroll",
      element: (
        <ProtectedAdminRoute>
          <Suspense fallback={<AdminLoadingFallback />}>
            <AdminStaffPayroll defaultTab="payroll" />
          </Suspense>
        </ProtectedAdminRoute>
      ),
    },
    { path: "/admin/staff-payroll", element: <Navigate to="/admin/staff" replace /> },
    {
      path: "/admin/analytics",
      element: (
        <ProtectedAdminRoute>
          <Suspense fallback={<AdminLoadingFallback />}>
            <AdminComingSoon />
          </Suspense>
        </ProtectedAdminRoute>
      ),
    },
    {
      path: "/admin/membership",
      element: (
        <ProtectedAdminRoute>
          <Suspense fallback={<AdminLoadingFallback />}>
            <AdminMembership />
          </Suspense>
        </ProtectedAdminRoute>
      ),
    },
    {
      path: "/admin/check-in",
      element: (
        <ProtectedAdminRoute>
          <AdminKioskCheckInPage />
        </ProtectedAdminRoute>
      ),
    },

    { path: "/admin/users", element: <Navigate to="/admin/role-permissions?tab=roles" replace /> },

    {
      path: "/admin/role-permissions",
      element: (
        <ProtectedAdminRoute requireOwner>
          <Suspense fallback={<AdminLoadingFallback />}>
            <RolePermissionsPage />
          </Suspense>
        </ProtectedAdminRoute>
      ),
    },
    {
      path: "/admin/vlinkpay-settings",
      element: (
        <ProtectedAdminRoute requireOwner>
          <Suspense fallback={<AdminLoadingFallback />}>
            <VLinkPaySettingsPage />
          </Suspense>
        </ProtectedAdminRoute>
      ),
    },
    {
      path: "/admin/redeem-codes",
      element: (
        <ProtectedAdminRoute requireOwner>
          <Suspense fallback={<AdminLoadingFallback />}>
            <RedeemCodesPage />
          </Suspense>
        </ProtectedAdminRoute>
      ),
    },
    {
      path: "/admin/system-settings",
      element: (
        <ProtectedAdminRoute requireOwner>
          <Suspense fallback={<AdminLoadingFallback />}>
            <AdminSettings />
          </Suspense>
        </ProtectedAdminRoute>
      ),
    },
    { path: "/admin/settings", element: <Navigate to="/admin/system-settings" replace /> },

    {
      path: "/admin/debug-data",
      element: (
        <ProtectedAdminRoute>
          <Suspense fallback={<AdminLoadingFallback />}>
            <DebugData />
          </Suspense>
        </ProtectedAdminRoute>
      ),
    },
    {
      path: "/admin/gallery",
      element: (
        <ProtectedAdminRoute>
          <Suspense fallback={<AdminLoadingFallback />}>
            <AdminGallery />
          </Suspense>
        </ProtectedAdminRoute>
      ),
    },

    { path: "/admin/setup-owner", element: <SetupOwnerPage /> },
    { path: "/admin/login", element: <LoginPage /> },
    { path: "/admin/debug-auth", element: <DebugAuth /> },
    { path: "/admin/test-setup", element: <TestSetup /> },
    { path: "/admin/test-jwt", element: <TestJWT /> },
    { path: "/admin/test-migration", element: <TestMigration /> },

    { path: "*", element: <Navigate to="/" replace /> },
  ]);

  return (
    <NotificationProvider>
      <ScrollToTop />
      <div className="min-h-screen bg-background">
        {routing}

        {showPromotionModal && (
          <PromotionModal
            promotions={promotions}
            onClose={handleClosePromotionModal}
            onRendered={() => setModalRendered(true)}
            language="en"
          />
        )}
      </div>
    </NotificationProvider>
  );
}

function AdminLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin text-[#FF9800]" />
    </div>
  );
}

// Component để redirect sang external URL
function ExternalRedirect({ url }: { url: string }) {
  useEffect(() => {
    window.location.href = url;
  }, [url]);

  return null;
}