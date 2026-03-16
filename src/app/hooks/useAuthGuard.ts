import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { getSession, clearSession, getCurrentUser } from '/utils/auth';

interface AuthGuardState {
  isAuthenticating: boolean;
  isAuthenticated: boolean;
  user: any | null;
}

/**
 * Hook to check authentication in the background without blocking UI
 * Returns immediately with cached session, verifies in background
 */
export function useAuthGuard() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [state, setState] = useState<AuthGuardState>(() => {
    // Initialize with cached data from localStorage
    const session = getSession();
    const user = getCurrentUser();
    
    return {
      isAuthenticating: !!session?.token, // Will verify if token exists
      isAuthenticated: !!session?.token, // Trust localStorage initially
      user,
    };
  });

  useEffect(() => {
    let cancelled = false;

    const verifyAuth = async () => {
      try {
        const session = getSession();
        
        // No session -> not authenticated
        if (!session?.token) {
          if (!cancelled) {
            setState({
              isAuthenticating: false,
              isAuthenticated: false,
              user: null,
            });
          }
          navigate('/admin/login', { replace: true });
          return;
        }

        // Has session -> verify in background
        const verifyResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/auth/verify`,
          {
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
              'X-Session-Token': session.token,
            },
          }
        );

        if (cancelled) return;

        if (!verifyResponse.ok) {
          // Token invalid -> clear and redirect
          clearSession();
          setState({
            isAuthenticating: false,
            isAuthenticated: false,
            user: null,
          });
          navigate('/admin/login', { replace: true });
        } else {
          // Token valid -> update state
          const result = await verifyResponse.json();
          setState({
            isAuthenticating: false,
            isAuthenticated: true,
            user: result.data?.user || getCurrentUser(),
          });
        }
      } catch (error) {
        if (!cancelled) {
          console.error('❌ [useAuthGuard] Auth verification failed:', error);
          setState({
            isAuthenticating: false,
            isAuthenticated: false,
            user: null,
          });
        }
      }
    };

    verifyAuth();

    return () => {
      cancelled = true;
    };
  }, [location.pathname, navigate]);

  return state;
}