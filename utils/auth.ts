// Authentication utilities for session management

const SESSION_KEY = 'admin_session';
const SESSION_EXPIRY_KEY = 'admin_session_expiry';

interface SessionData {
  token: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    role: string;
    phone?: string;
  };
  expiresAt: string;
}

/**
 * Save session to localStorage with 7-day expiry
 */
export function saveSession(token: string, user: any, expiresAt: string): void {
  try {
    const sessionData: SessionData = {
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        phone: user.phone,
      },
      expiresAt,
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    localStorage.setItem(SESSION_EXPIRY_KEY, expiresAt);
  } catch (error) {
    throw error;
  }
}

/**
 * Get session from localStorage
 * Returns null if no session or expired
 */
export function getSession(): SessionData | null {
  try {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    const expiryStr = localStorage.getItem(SESSION_EXPIRY_KEY);

    if (!sessionStr || !expiryStr) {
      return null;
    }

    // Check if expired
    const now = new Date();
    const expiresAt = new Date(expiryStr);

    if (now > expiresAt) {
      clearSession();
      return null;
    }

    const session: SessionData = JSON.parse(sessionStr);
    return session;
  } catch (error) {
    clearSession();
    return null;
  }
}

/**
 * Clear session from localStorage
 */
export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_EXPIRY_KEY);
  } catch (error) {
    // Silently fail — session may already be cleared
  }
}

/**
 * Quick check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const session = getSession();
  return session !== null;
}

/**
 * Get auth token for API requests
 */
export function getAuthToken(): string | null {
  const session = getSession();
  return session?.token || null;
}

/**
 * Get current user info
 */
export function getCurrentUser() {
  const session = getSession();
  return session?.user || null;
}