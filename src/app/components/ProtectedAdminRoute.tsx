import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { getSession, clearSession } from '/utils/auth';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
  requireOwner?: boolean; // Keep for backward compatibility but won't use
}

export function ProtectedAdminRoute({ children, requireOwner }: ProtectedAdminRouteProps) {
  const [loading, setLoading] = useState(true);
  const [hasOwner, setHasOwner] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    checkAuthAndOwner();
  }, []);

  const checkAuthAndOwner = async () => {
    try {
      // Step 1: Check if owner exists in system
      const ownerCheckResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/setup/check`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const ownerData = await ownerCheckResponse.json();
      const ownerExists = ownerData.success && ownerData.data.has_owner;
      setHasOwner(ownerExists);

      // If no owner exists and not on setup page, redirect to setup
      if (!ownerExists && !location.pathname.includes('/setup-owner')) {
        setLoading(false);
        return;
      }

      // If on setup page and owner exists, we'll redirect to login
      if (ownerExists && location.pathname.includes('/setup-owner')) {
        setLoading(false);
        return;
      }

      // If on login page, don't check session (allow access)
      if (location.pathname.includes('/login')) {
        setLoading(false);
        return;
      }

      // Step 2: Check session authentication
      const session = getSession();

      if (!session) {
        console.log('❌ No session found, redirecting to login');
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      // Step 3: Verify JWT with backend
      console.log('🔐 [ProtectedRoute] Verifying JWT with backend...');
      console.log('🔐 [ProtectedRoute] Token (first 50 chars):', session.token.substring(0, 50) + '...');
      
      const verifyResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/auth/verify`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Session-Token': session.token,
          },
        }
      );

      console.log('📦 [ProtectedRoute] Verify response status:', verifyResponse.status);
      
      const verifyData = await verifyResponse.json();
      console.log('📦 [ProtectedRoute] Verify response data:', verifyData);

      if (!verifyResponse.ok) {
        console.log('❌ Session invalid or expired');
        console.log('❌ Backend error:', verifyData);
        clearSession();
        setIsAuthenticated(false);
      } else {
        console.log('✅ Session verified');
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Failed to check auth status:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#FF9F1C] animate-spin" />
          <p className="text-gray-600 text-sm font-medium">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If no owner exists and not on setup page, redirect to setup
  if (!hasOwner && !location.pathname.includes('/setup-owner')) {
    return <Navigate to="/admin/setup-owner" replace />;
  }

  // If owner exists and trying to access setup page, redirect to login
  if (hasOwner && location.pathname.includes('/setup-owner')) {
    return <Navigate to="/admin/login" replace />;
  }

  // If on login page, allow access (don't check authentication)
  if (location.pathname.includes('/login')) {
    return <>{children}</>;
  }

  // If not authenticated and not on login/setup, redirect to login
  if (!isAuthenticated && !location.pathname.includes('/login') && !location.pathname.includes('/setup-owner')) {
    return <Navigate to="/admin/login" replace />;
  }

  // No longer checking requireOwner here - let individual pages handle it
  return <>{children}</>;
}