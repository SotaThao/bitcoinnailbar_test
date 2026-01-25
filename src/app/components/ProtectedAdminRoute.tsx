import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { getSession } from "/utils/auth";

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
  requireOwner?: boolean;
}

/**
 * ⚡ ULTRA-FAST Route Guard
 * - SYNC localStorage check only (no async!)
 * - Renders children IMMEDIATELY if session exists
 * - Background owner check (non-blocking)
 */
export function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const [ownerCheckDone, setOwnerCheckDone] = useState(false);
  const [hasOwner, setHasOwner] = useState(true); // Assume true to avoid blocking
  const location = useLocation();

  const isSetupPage = location.pathname.startsWith("/admin/setup-owner");
  const isLoginPage = location.pathname.startsWith("/admin/login");

  // Background owner check (non-blocking)
  useEffect(() => {
    let cancelled = false;

    const checkOwner = async () => {
      try {
        const ownerCheckResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/setup/check`,
          {
            headers: { Authorization: `Bearer ${publicAnonKey}` },
          }
        );

        const ownerData = await ownerCheckResponse.json();
        const ownerExists = !!(ownerData?.success && ownerData?.data?.has_owner);

        if (!cancelled) {
          setHasOwner(ownerExists);
          setOwnerCheckDone(true);
        }
      } catch {
        if (!cancelled) {
          setHasOwner(false);
          setOwnerCheckDone(true);
        }
      }
    };

    checkOwner();

    return () => {
      cancelled = true;
    };
  }, []);

  // ⚡ SYNC session check (instant from localStorage)
  const session = getSession();
  const hasSession = !!session?.token;

  // Special pages - allow without session check
  if (isSetupPage || isLoginPage) {
    // Only redirect after owner check completes
    if (ownerCheckDone) {
      if (hasOwner && isSetupPage) {
        return <Navigate to="/admin/login" replace />;
      }
      if (!hasOwner && !isSetupPage) {
        return <Navigate to="/admin/setup-owner" replace />;
      }
    }
    return <>{children}</>;
  }

  // Protected pages - require session
  if (!hasSession) {
    return <Navigate to="/admin/login" replace />;
  }

  // ✅ Render IMMEDIATELY - no async blocking!
  return <>{children}</>;
}