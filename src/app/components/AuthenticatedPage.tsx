import { useAuthGuard } from '@/app/hooks/useAuthGuard';
import { AdminPageSkeleton } from '@/app/components/admin/AdminPageSkeleton';

interface AuthenticatedPageProps {
  children: React.ReactNode;
  skeleton?: React.ReactNode;
  skipAuthCheck?: boolean; // For pages that handle auth themselves
}

/**
 * ⚡ INSTANT UI Wrapper - Zero Blocking!
 * 
 * Flow:
 * 1. Render skeleton IMMEDIATELY (no waiting)
 * 2. Verify auth in background
 * 3. Switch to content when verified
 * 
 * Usage:
 * ```tsx
 * <AuthenticatedPage>
 *   <YourPageContent />
 * </AuthenticatedPage>
 * ```
 */
export function AuthenticatedPage({ 
  children, 
  skeleton,
  skipAuthCheck = false,
}: AuthenticatedPageProps) {
  const { isAuthenticating } = useAuthGuard();

  // Skip auth check if requested (for pages with custom auth)
  if (skipAuthCheck) {
    return <>{children}</>;
  }

  // ⚡ ALWAYS show skeleton first (instant UI feedback)
  if (isAuthenticating) {
    return <>{skeleton || <AdminPageSkeleton />}</>;
  }

  // Auth verified → render actual content
  return <>{children}</>;
}