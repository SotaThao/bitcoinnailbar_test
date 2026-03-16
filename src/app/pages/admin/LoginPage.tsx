import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Eye, EyeOff, Lock, AlertCircle, LogIn } from 'lucide-react';
import bitcoinLogo from 'figma:asset/2e1db8bc09ca3990d8353e1709360b43f3caa800.png';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { saveSession } from '/utils/auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);

    try {
      console.log('🔐 [LOGIN] Attempting login for:', formData.email);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      console.log('📦 [LOGIN] Response status:', response.status);
      console.log('📦 [LOGIN] Response data:', data);

      if (!response.ok) {
        console.error('❌ [LOGIN] Failed:', data.error);
        throw new Error(data.error || 'Login failed');
      }

      console.log('✅ [LOGIN] Success! User:', data.data.user);

      // Save session to localStorage (7 days)
      saveSession(data.data.token, data.data.user, data.data.expires_at);

      // Verify session was saved
      const savedSession = localStorage.getItem('admin_session');
      console.log('💾 [LOGIN] Session saved to localStorage:', savedSession ? 'YES' : 'NO');
      if (savedSession) {
        console.log('💾 [LOGIN] Session data:', JSON.parse(savedSession));
      } else {
        // If session wasn't saved, something is wrong with localStorage
        console.error('❌ [LOGIN] CRITICAL: Session not saved to localStorage!');
        console.error('❌ [LOGIN] Check if browser is in private mode or localStorage is disabled');
        setError('Unable to save session. Please check browser settings.');
        return;
      }

      console.log('🔄 [LOGIN] Redirecting to dashboard...');

      // Small delay to ensure localStorage is persisted before navigation
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 100);
    } catch (err: any) {
      console.error('❌ [LOGIN] Exception:', err);
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full shadow-[0_0_20px_rgba(255,152,0,0.6)]">
              <img src={bitcoinLogo} alt="Bitcoin" className="h-12 w-12 object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-2xl tracking-tight text-gray-900 uppercase">BITCOIN</span>
              <span className="text-xs font-bold text-gray-500 tracking-[0.3em] uppercase">NAIL BAR</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-orange-600">
            <Lock className="h-6 w-6" />
            <h1 className="text-xl font-bold">Admin Login</h1>
          </div>
          <p className="text-sm text-gray-500 mt-2 text-center">
            Sign in to access the admin dashboard
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@bitcoinnailbar.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="h-11"
                disabled={loading}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-11 pr-10"
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          {/* Session Info */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              🔒 Your session will be saved for 7 days
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Bitcoin Nail Bar Admin System v1.0
        </p>
      </div>
    </div>
  );
}