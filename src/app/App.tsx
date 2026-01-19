import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Debug utilities for inspecting storage (accessible via console)
import './utils/debugStorage';

// Public Pages
import HomePage from './components/pages/HomePage';
import ServicesPage from './components/pages/ServicesPage';
import BookingPage from './components/pages/BookingPage';
import PromotionsPage from './components/pages/PromotionsPage';
import MembershipPage from './components/pages/MembershipPage';
import CareersPage from './components/pages/CareersPage';
import GalleryPage from './components/pages/GalleryPage';
import EGiftPage from './components/pages/EGiftPage';
import ComingSoonPage from './components/pages/ComingSoonPage';
import LocationsPage from './components/pages/LocationsPage';
import ReviewsPage from './components/pages/ReviewsPage';
import PublicCheckInPage from './components/pages/CheckInPage';
import VIPPage from './components/pages/VIPPage';
import MenuPage from './components/pages/MenuPage';

// Admin Pages (non-lazy)
import AdminKioskCheckInPage from './pages/CheckInPage';
import ComingSoon from './pages/ComingSoon';
import SetupOwnerPage from './pages/admin/SetupOwnerPage';
import LoginPage from './pages/admin/LoginPage';
import DebugAuth from './pages/admin/DebugAuth';
import TestSetup from './pages/admin/TestSetup';
import TestJWT from './pages/admin/TestJWT';

// Admin Pages - Lazy Loaded
const AdminDashboard = lazy(() => import('./components/admin/Dashboard'));
const AdminAppointments = lazy(() => import('./components/admin/Appointments'));
const AdminServices = lazy(() => import('./components/admin/Services'));
const AdminReviews = lazy(() => import('./components/admin/Reviews'));
const AdminStaffPayroll = lazy(() => import('./components/admin/StaffPayroll'));
const AdminComingSoon = lazy(() => import('./components/admin/AdminComingSoon'));
const AdminSettings = lazy(() => import('./components/admin/Settings'));
const AdminMembership = lazy(() => import('./components/admin/MembershipPage'));
const DebugData = lazy(() => import('./components/admin/DebugData'));

import { LanguageProvider } from './context/LanguageContext';
import { ScrollToTop } from './components/ScrollToTop';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { ProtectedAdminRoute } from './components/ProtectedAdminRoute';

// Loading fallback component
const AdminLoadingFallback = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="w-8 h-8 text-[#FF9F1C] animate-spin" />
      <p className="text-gray-600 text-sm font-medium">Loading admin panel...</p>
    </div>
  </div>
);

import { HelmetProvider } from 'react-helmet-async';

export default function App() {
  return (
    <HelmetProvider>
      <LanguageProvider>
        <BrowserRouter>
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
            <Route path="/admin/settings" element={<ProtectedAdminRoute><Suspense fallback={<AdminLoadingFallback />}><AdminSettings /></Suspense></ProtectedAdminRoute>} />
            <Route path="/admin/check-in" element={<ProtectedAdminRoute><AdminKioskCheckInPage /></ProtectedAdminRoute>} />
            <Route path="/admin/debug-data" element={<ProtectedAdminRoute><Suspense fallback={<AdminLoadingFallback />}><DebugData /></Suspense></ProtectedAdminRoute>} />
            
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
        </div>
      </BrowserRouter>
    </LanguageProvider>
    </HelmetProvider>
  );
}