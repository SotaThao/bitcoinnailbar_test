import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, lazy, Suspense } from 'react';
import { projectId, publicAnonKey } from '@utils/supabase/info';

// Disable console logs in production
import '@/utils/disableConsoleLogs';

// Public Pages
import HomePage from '@/app/components/pages/HomePage';
import ServicesPage from '@/app/components/pages/ServicesPage';
import BookingPage from '@/app/components/pages/BookingPage';
import PromotionsPage from '@/app/components/pages/PromotionsPage';
import MembershipPage from '@/app/components/pages/MembershipPage';
import CareersPage from '@/app/components/pages/CareersPage';
import GalleryPage from '@/app/components/pages/GalleryPage';
import EGiftPage from '@/app/components/pages/EGiftPage';
import ComingSoonPage from '@/app/components/pages/ComingSoonPage';
import LocationsPage from '@/app/components/pages/LocationsPage';
import ReviewsPage from '@/app/components/pages/ReviewsPage';
import PublicCheckInPage from '@/app/components/pages/CheckInPage';
import VIPPage from '@/app/components/pages/VIPPage';
import MenuPage from '@/app/components/pages/MenuPage';

// Admin Pages (non-lazy)
import AdminKioskCheckInPage from '@/app/pages/CheckInPage';
import ComingSoon from '@/app/pages/ComingSoon';
import SetupOwnerPage from '@/app/pages/admin/SetupOwnerPage';
import LoginPage from '@/app/pages/admin/LoginPage';
import DebugAuth from '@/app/pages/admin/DebugAuth';
import TestSetup from '@/app/pages/admin/TestSetup';
import TestJWT from '@/app/pages/admin/TestJWT';

// Admin Pages - Lazy Loaded
const AdminDashboard = lazy(() => import('@/app/components/admin/Dashboard'));
const AdminAppointments = lazy(() => import('@/app/components/admin/Appointments'));
const AdminServices = lazy(() => import('@/app/components/admin/Services'));
const AdminReviews = lazy(() => import('@/app/components/admin/Reviews'));
const AdminStaffPayroll = lazy(() => import('@/app/components/admin/StaffPayroll'));
const AdminComingSoon = lazy(() => import('@/app/components/admin/AdminComingSoon'));
const AdminSettings = lazy(() => import('@/app/components/admin/Settings'));
const AdminMembership = lazy(() => import('@/app/components/admin/MembershipPage'));
const DebugData = lazy(() => import('@/app/components/admin/DebugData'));
const AdminGallery = lazy(() => import('@/app/components/admin/GalleryManagement'));

// Owner Pages - Lazy Loaded
const UsersPage = lazy(() => import('@/app/pages/admin/UsersPage'));
const RolePermissionsPage = lazy(() => import('@/app/pages/admin/RolePermissionsPage'));

import { ProtectedAdminRoute } from '@/app/components/ProtectedAdminRoute';
import { PromotionModal } from '@/app/components/PromotionModal';
import { Toaster } from 'sonner';
import { HelmetProvider } from 'react-helmet-async';
import { LanguageProvider } from '@/app/context/LanguageContext';
import { LoadingProvider } from '@/app/context/LoadingContext';
import { ScrollToTop } from '@/app/components/ScrollToTop';
import { Loader2 } from 'lucide-react';

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

export default function App() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [modalRendered, setModalRendered] = useState(false);

  // Fetch promotions and check if modal should be shown
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/settings/promotions`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        const result = await response.json();
        console.log('📦 Promotions API Response:', result);

        if (result.success && result.data) {
          // Backend returns { success: true, data: { promotions: [...] } }
          const promotionsData = result.data.promotions || [];
          setPromotions(promotionsData);

          // Check if we should show the modal
          // ONLY show on public pages (not admin routes)
          const isAdminRoute = window.location.pathname.startsWith('/admin');
          
          if (!isAdminRoute) {
            const dismissedDate = localStorage.getItem('promotion-dismissed-date');
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

            // Show modal if:
            // 1. Not on admin route
            // 2. Not dismissed today
            // 3. There are featured promotions
            const hasFeaturedPromotions = Array.isArray(promotionsData) && 
              promotionsData.some((p: Promotion) => p.enabled && p.featured);

            console.log('🔍 Promotion Modal Check:', {
              isAdminRoute,
              dismissedDate,
              today,
              hasFeaturedPromotions,
              shouldShow: dismissedDate !== today && hasFeaturedPromotions
            });

            if (dismissedDate !== today && hasFeaturedPromotions) {
              // Small delay to ensure page has loaded
              setTimeout(() => {
                setShowPromotionModal(true);
              }, 500);
            }
          }
        }
      } catch (error) {
        console.error('❌ Failed to fetch promotions:', error);
      }
    };

    fetchPromotions();

    // Listen for promotions-updated event (fired when admin saves changes)
    const handlePromotionsUpdated = () => {
      console.log('🔄 Promotions updated, refetching...');
      fetchPromotions();
    };

    window.addEventListener('promotions-updated', handlePromotionsUpdated);

    return () => {
      window.removeEventListener('promotions-updated', handlePromotionsUpdated);
    };
  }, []);

  const handleClosePromotionModal = () => {
    setShowPromotionModal(false);
  };

  return (
    <HelmetProvider>
      <LanguageProvider>
        <LoadingProvider hasPromotionModal={showPromotionModal} modalRendered={modalRendered}>
          <Router>
            <ScrollToTop />
            <div className="min-h-screen bg-background">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/promotions" element={<PromotionsPage />} />
                <Route path="/membership" element={<MembershipPage />} />
                <Route path="/careers" element={<CareersPage />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/e-gift" element={<EGiftPage />} />
                <Route path="/booking" element={<BookingPage />} />
                <Route path="/locations" element={<LocationsPage />} />
                <Route path="/reviews" element={<ReviewsPage />} />
                <Route path="/vip" element={<VIPPage />} />
                <Route path="/menu" element={<MenuPage />} />
                <Route path="/coming-soon" element={<ComingSoonPage />} />
                <Route path="/checkin/:id" element={<PublicCheckInPage />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/dashboard" element={<ProtectedAdminRoute><Suspense fallback={<AdminLoadingFallback />}><AdminDashboard /></Suspense></ProtectedAdminRoute>} />
                <Route path="/admin/services" element={<ProtectedAdminRoute><Suspense fallback={<AdminLoadingFallback />}><AdminServices /></Suspense></ProtectedAdminRoute>} />
                <Route path="/admin/reviews" element={<ProtectedAdminRoute><Suspense fallback={<AdminLoadingFallback />}><AdminReviews /></Suspense></ProtectedAdminRoute>} />
                <Route path="/admin/appointments" element={<ProtectedAdminRoute><Suspense fallback={<AdminLoadingFallback />}><AdminAppointments /></Suspense></ProtectedAdminRoute>} />
                <Route path="/admin/staff-payroll" element={<ProtectedAdminRoute><Suspense fallback={<AdminLoadingFallback />}><AdminStaffPayroll /></Suspense></ProtectedAdminRoute>} />
                <Route path="/admin/analytics" element={<ProtectedAdminRoute><Suspense fallback={<AdminLoadingFallback />}><AdminComingSoon /></Suspense></ProtectedAdminRoute>} />
                <Route path="/admin/membership" element={<ProtectedAdminRoute><Suspense fallback={<AdminLoadingFallback />}><AdminMembership /></Suspense></ProtectedAdminRoute>} />
                <Route path="/admin/check-in" element={<ProtectedAdminRoute><AdminKioskCheckInPage /></ProtectedAdminRoute>} />
                
                {/* Owner Routes */}
                <Route path="/admin/users" element={<ProtectedAdminRoute requireOwner><Suspense fallback={<AdminLoadingFallback />}><UsersPage /></Suspense></ProtectedAdminRoute>} />
                <Route path="/admin/role-permissions" element={<ProtectedAdminRoute requireOwner><Suspense fallback={<AdminLoadingFallback />}><RolePermissionsPage /></Suspense></ProtectedAdminRoute>} />
                <Route path="/admin/system-settings" element={<ProtectedAdminRoute requireOwner><Suspense fallback={<AdminLoadingFallback />}><AdminSettings /></Suspense></ProtectedAdminRoute>} />
                
                {/* Legacy Settings Route - Redirect to System Settings */}
                <Route path="/admin/settings" element={<Navigate to="/admin/system-settings" replace />} />
                
                <Route path="/admin/debug-data" element={<ProtectedAdminRoute><Suspense fallback={<AdminLoadingFallback />}><DebugData /></Suspense></ProtectedAdminRoute>} />
                <Route path="/admin/gallery" element={<ProtectedAdminRoute><Suspense fallback={<AdminLoadingFallback />}><AdminGallery /></Suspense></ProtectedAdminRoute>} />
                
                {/* Auth Routes (NOT PROTECTED - these are for logging in) */}
                <Route path="/admin/setup-owner" element={<SetupOwnerPage />} />
                <Route path="/admin/login" element={<LoginPage />} />
                <Route path="/admin/debug-auth" element={<DebugAuth />} />
                <Route path="/admin/test-setup" element={<TestSetup />} />
                <Route path="/admin/test-jwt" element={<TestJWT />} />
                
                {/* 404 */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              
              <Toaster 
                position="bottom-center" 
                toastOptions={{
                  className: 'bg-white border-gray-200 text-gray-900',
                  duration: 5000,
                }}
              />

              {/* Promotion Modal - Shows featured promotions on homepage */}
              {showPromotionModal && (
                <PromotionModal
                  promotions={promotions}
                  onClose={handleClosePromotionModal}
                  onRendered={() => setModalRendered(true)}
                  language="en"
                />
              )}
            </div>
          </Router>
        </LoadingProvider>
      </LanguageProvider>
    </HelmetProvider>
  );
}

// Loading fallback for admin lazy-loaded routes
function AdminLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin text-[#FF9800]" />
    </div>
  );
}