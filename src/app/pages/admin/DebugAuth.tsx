import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { projectId, publicAnonKey } from '/utils/supabase/info';

export default function DebugAuth() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const listAllUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/debug/users`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      console.log('All users:', data);
      setTestResult(data);
      if (data.success) {
        setUsers(data.data.users);
      }
    } catch (error) {
      console.error('Error:', error);
      setTestResult({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const checkUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/setup/check`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      console.log('Setup check:', data);
      setTestResult(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    const email = prompt('Enter email:');
    const password = prompt('Enter password:');
    
    if (!email || !password) {
      setLoading(false);
      return;
    }

    try {
      // First, hash the password client-side (same as LoginPage)
      const encoder = new TextEncoder();
      const encodedPassword = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', encodedPassword);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      console.log('🔐 Test Login Debug:');
      console.log('  Email:', email);
      console.log('  Password:', password);
      console.log('  Password Hash (client):', passwordHash);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email, password }),
        }
      );
      
      const loginData = await response.json();
      console.log('📦 Login response status:', response.status);
      console.log('📦 Login response:', loginData);
      
      setTestResult({
        status: response.status,
        response: loginData,
        debug: {
          email,
          password,
          password_hash_client: passwordHash,
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      setTestResult({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const clearAllSessions = async () => {
    if (!confirm('Clear all sessions? This will log out everyone.')) return;

    setLoading(true);
    try {
      // This is a debug function - would need backend support
      setError('Need to implement backend endpoint to clear sessions');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testPasswordHash = async () => {
    const password = prompt('Enter password to hash:');
    if (!password) return;

    // Client-side hash (same as login)
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    const hashHex = Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    console.log('Password:', password);
    console.log('Hash:', hashHex);
    setTestResult({
      action: 'Password Hash',
      password,
      hash: hashHex,
    });
  };

  const getUserHash = async () => {
    const email = prompt('Enter email to get hash:');
    if (!email) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/debug/get-hash`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email }),
        }
      );
      
      const data = await response.json();
      console.log('User hash:', data);
      setTestResult(data);
    } catch (error) {
      console.error('Error:', error);
      setTestResult({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const testSessionVerify = async () => {
    setLoading(true);
    try {
      const session = localStorage.getItem('admin_session');
      if (!session) {
        setTestResult({ error: 'No session in localStorage' });
        setLoading(false);
        return;
      }

      const sessionData = JSON.parse(session);
      console.log('📋 Session from localStorage:', sessionData);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/auth/verify`,
        {
          headers: {
            'X-Session-Token': sessionData.token,
          },
        }
      );

      const data = await response.json();
      console.log('✅ Verify response:', data);
      
      setTestResult({
        status: response.status,
        ok: response.ok,
        session_token: sessionData.token,
        response: data,
      });
    } catch (error) {
      console.error('Error:', error);
      setTestResult({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const testLocalStorage = () => {
    console.log('🧪 Testing localStorage...');
    
    // Test write
    const testKey = 'test_key_123';
    const testValue = { test: 'data', timestamp: Date.now() };
    
    console.log('Writing:', testValue);
    localStorage.setItem(testKey, JSON.stringify(testValue));
    
    // Test read immediately
    const retrieved = localStorage.getItem(testKey);
    console.log('Retrieved:', retrieved);
    
    // Clean up
    localStorage.removeItem(testKey);
    
    setTestResult({
      test: 'localStorage',
      write: testValue,
      read: retrieved ? JSON.parse(retrieved) : null,
      success: retrieved !== null,
    });
  };

  const testListSessions = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/debug/sessions`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      console.log('✅ Sessions response:', data);
      
      setTestResult({
        status: response.status,
        ok: response.ok,
        response: data,
      });
    } catch (error) {
      console.error('Error:', error);
      setTestResult({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Debug Authentication</h1>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h4 className="font-semibold text-red-900">Error</h4>
              <p className="text-sm text-red-700 mt-1 whitespace-pre-line">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg border p-6 space-y-4">
          <h2 className="text-xl font-semibold">Actions</h2>
          
          <div className="flex flex-wrap gap-3">
            <Button onClick={listAllUsers} disabled={loading}>
              List All Users
            </Button>
            
            <Button onClick={checkUsers} disabled={loading}>
              Check Owner Status
            </Button>
            
            <Button onClick={testLogin} disabled={loading}>
              Test Login
            </Button>
            
            <Button onClick={testSessionVerify} disabled={loading}>
              Test Session Verify
            </Button>
            
            <Button onClick={testPasswordHash} disabled={loading}>
              Test Password Hash
            </Button>
            
            <Button onClick={getUserHash} disabled={loading}>
              Get User Hash
            </Button>
            
            <Button onClick={clearAllSessions} disabled={loading} variant="destructive">
              Clear All Sessions
            </Button>
            
            <Button onClick={testLocalStorage} disabled={loading}>
              Test LocalStorage
            </Button>
            
            <Button onClick={testListSessions} disabled={loading}>
              List Sessions
            </Button>
          </div>
        </div>

        {testResult && (
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Result</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}

        {/* Users Table */}
        {users.length > 0 && (
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Users in System ({users.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3 font-semibold">Email</th>
                    <th className="text-left p-3 font-semibold">Full Name</th>
                    <th className="text-left p-3 font-semibold">Role</th>
                    <th className="text-left p-3 font-semibold">Phone</th>
                    <th className="text-left p-3 font-semibold">Active</th>
                    <th className="text-left p-3 font-semibold">Has Password</th>
                    <th className="text-left p-3 font-semibold">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-mono text-xs">{user.email}</td>
                      <td className="p-3">{user.full_name}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          user.role === 'owner' ? 'bg-orange-100 text-orange-700' :
                          user.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-3">{user.phone || '-'}</td>
                      <td className="p-3">
                        {user.is_active ? (
                          <span className="text-green-600">✓ Yes</span>
                        ) : (
                          <span className="text-red-600">✗ No</span>
                        )}
                      </td>
                      <td className="p-3">
                        {user.has_password ? (
                          <span className="text-green-600">✓ Yes</span>
                        ) : (
                          <span className="text-red-600">✗ No</span>
                        )}
                      </td>
                      <td className="p-3 text-xs text-gray-500">
                        {new Date(user.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">LocalStorage</h2>
          <div className="space-y-2">
            <p><strong>Session:</strong></p>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {localStorage.getItem('admin_session') || 'No session'}
            </pre>
            
            <p><strong>Expiry:</strong></p>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {localStorage.getItem('admin_session_expiry') || 'No expiry'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}