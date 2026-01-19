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
    console.log('🔐 [saveSession] Called with:', { token, userId: user.id, expiresAt });
    
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

    console.log('🔐 [saveSession] Session data prepared:', sessionData);
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    console.log('✅ [saveSession] Set SESSION_KEY');
    
    localStorage.setItem(SESSION_EXPIRY_KEY, expiresAt);
    console.log('✅ [saveSession] Set SESSION_EXPIRY_KEY');
    
    // Verify immediately
    const verify = localStorage.getItem(SESSION_KEY);
    console.log('✅ [saveSession] Verification - Item exists:', verify ? 'YES' : 'NO');
    
    console.log('✅ Session saved, expires at:', expiresAt);
  } catch (error) {
    console.error('❌ Failed to save session:', error);
    throw error; // Re-throw so caller knows it failed
  }
}

/**
 * Get session from localStorage
 * Returns null if no session or expired
 */
export function getSession(): SessionData | null {
  try {
    console.log('🔍 [getSession] Called');
    
    const sessionStr = localStorage.getItem(SESSION_KEY);
    const expiryStr = localStorage.getItem(SESSION_EXPIRY_KEY);

    console.log('🔍 [getSession] sessionStr exists:', sessionStr ? 'YES' : 'NO');
    console.log('🔍 [getSession] expiryStr exists:', expiryStr ? 'YES' : 'NO');

    if (!sessionStr || !expiryStr) {
      console.log('❌ [getSession] No session or expiry in localStorage');
      return null;
    }

    // Check if expired
    const now = new Date();
    const expiresAt = new Date(expiryStr);

    console.log('🔍 [getSession] Now:', now.toISOString());
    console.log('🔍 [getSession] Expires at:', expiresAt.toISOString());
    console.log('🔍 [getSession] Is expired:', now > expiresAt);

    if (now > expiresAt) {
      console.log('⏰ Session expired, clearing...');
      clearSession();
      return null;
    }

    const session: SessionData = JSON.parse(sessionStr);
    console.log('✅ [getSession] Valid session found for user:', session.user.email);
    return session;
  } catch (error) {
    console.error('❌ Failed to get session:', error);
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
    console.log('🗑️ Session cleared');
  } catch (error) {
    console.error('❌ Failed to clear session:', error);
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