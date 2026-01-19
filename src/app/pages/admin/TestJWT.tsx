import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { getSession } from '/utils/auth';

export default function TestJWT() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            email: 'bitcoinnailbar_owner@mailinator.com',
            password: 'Owner@123456',
          }),
        }
      );

      const data = await response.json();
      console.log('✅ Login response:', data);

      if (data.success && data.data.token) {
        // Decode JWT (without verification, just to see payload)
        const parts = data.data.token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          console.log('📋 JWT Payload:', payload);
          
          setResult({
            status: 'success',
            token_preview: data.data.token.substring(0, 50) + '...',
            payload: payload,
            user: data.data.user,
          });
        }
      } else {
        setResult({ status: 'error', data });
      }
    } catch (error) {
      console.error('Error:', error);
      setResult({ status: 'error', error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const testVerify = async () => {
    setLoading(true);
    try {
      const session = getSession();
      if (!session) {
        setResult({ status: 'error', message: 'No session found' });
        setLoading(false);
        return;
      }

      console.log('🔐 Verifying JWT...');
      console.log('Token (first 50):', session.token.substring(0, 50));

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/auth/verify`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Session-Token': session.token,
          },
        }
      );

      const data = await response.json();
      console.log('✅ Verify response:', data);

      setResult({
        status: response.ok ? 'success' : 'error',
        http_status: response.status,
        data: data,
      });
    } catch (error) {
      console.error('Error:', error);
      setResult({ status: 'error', error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const decodeLocalJWT = () => {
    const session = getSession();
    if (!session) {
      setResult({ status: 'error', message: 'No session in localStorage' });
      return;
    }

    try {
      const parts = session.token.split('.');
      if (parts.length !== 3) {
        setResult({ status: 'error', message: 'Invalid JWT format' });
        return;
      }

      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));

      setResult({
        status: 'success',
        jwt_structure: {
          header,
          payload,
          signature: parts[2].substring(0, 20) + '...',
        },
        session_data: session,
      });
    } catch (error) {
      setResult({ status: 'error', error: String(error) });
    }
  };

  const clearSession = () => {
    localStorage.removeItem('admin_session');
    localStorage.removeItem('admin_session_expiry');
    setResult({ status: 'success', message: 'Session cleared' });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg border p-6">
          <h1 className="text-2xl font-bold mb-4">🔐 JWT Authentication Test</h1>
          
          <div className="flex flex-wrap gap-3 mb-6">
            <Button onClick={testLogin} disabled={loading}>
              1. Test Login (Generate JWT)
            </Button>
            
            <Button onClick={decodeLocalJWT} disabled={loading}>
              2. Decode Local JWT
            </Button>
            
            <Button onClick={testVerify} disabled={loading}>
              3. Test Verify JWT
            </Button>
            
            <Button onClick={clearSession} variant="destructive" disabled={loading}>
              Clear Session
            </Button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm">
            <p className="font-semibold mb-2">📝 Test Flow:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Click "Test Login" to generate a JWT token</li>
              <li>Click "Decode Local JWT" to see the JWT payload (permissions, role, etc.)</li>
              <li>Click "Test Verify JWT" to verify the token with backend</li>
            </ol>
          </div>
        </div>

        {result && (
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">
              Result: 
              <span className={`ml-2 ${result.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {result.status === 'success' ? '✅ Success' : '❌ Error'}
              </span>
            </h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Current localStorage</h2>
          <div className="space-y-3">
            <div>
              <p className="font-semibold text-sm mb-1">admin_session:</p>
              <pre className="bg-gray-100 p-3 rounded overflow-auto text-xs">
                {localStorage.getItem('admin_session') || 'null'}
              </pre>
            </div>
            <div>
              <p className="font-semibold text-sm mb-1">admin_session_expiry:</p>
              <pre className="bg-gray-100 p-3 rounded overflow-auto text-xs">
                {localStorage.getItem('admin_session_expiry') || 'null'}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
