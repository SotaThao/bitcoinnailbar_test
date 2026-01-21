import { useState, useEffect } from 'react';
import AdminLayout from '@/app/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Settings, CheckCircle, AlertCircle, Loader2, Save, Eye, EyeOff } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

export default function VLinkPaySettingsPage() {
  const [merchantRefCode, setMerchantRefCode] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [sandboxEndpoint, setSandboxEndpoint] = useState('https://test-web-app.vlinkpay.com');
  const [redirectUrl] = useState('https://www.bitcoinnailbar.com/membership?payment=success'); // Fixed redirect URL
  const [showApiKey, setShowApiKey] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingFetch, setLoadingFetch] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoadingFetch(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/vlinkpay/settings`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      const result = await response.json();

      if (result.success && result.data) {
        setMerchantRefCode(result.data.merchantRefCode || '');
        setSandboxEndpoint(result.data.sandboxEndpoint || 'https://test-web-app.vlinkpay.com');
        // Redirect URL is fixed, don't load from backend
        // API key is not returned for security, keep empty or show placeholder
        if (result.data.apiKey === '***hidden***') {
          setApiKey(''); // User must re-enter
        }
        if (result.data.secretKey === '***hidden***') {
          setSecretKey(''); // User must re-enter
        }
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoadingFetch(false);
    }
  };

  const handleSave = async () => {
    if (!merchantRefCode.trim() || !apiKey.trim() || !secretKey.trim() || !sandboxEndpoint.trim() || !redirectUrl.trim()) {
      setError('All fields are required');
      return;
    }

    // Validate URL format
    try {
      new URL(sandboxEndpoint);
      new URL(redirectUrl);
    } catch {
      setError('Invalid URL format for Sandbox Endpoint or Redirect URL');
      return;
    }

    setLoading(true);
    setError('');
    setSaveSuccess(false);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/vlinkpay/settings`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            merchantRefCode: merchantRefCode.trim(),
            apiKey: apiKey.trim(),
            secretKey: secretKey.trim(),
            sandboxEndpoint: sandboxEndpoint.trim(),
            redirectUrl: redirectUrl.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to save settings');
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  if (loadingFetch) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-[#FF9800] animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#FF9800]/10 rounded-xl">
            <Settings className="w-6 h-6 text-[#FF9800]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">VLINKPAY Settings</h1>
            <p className="text-sm text-gray-600">Configure VLINKPAY for membership payment</p>
          </div>
        </div>

        {/* Success Message */}
        {saveSuccess && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-green-900">Settings Saved Successfully</h4>
              <p className="text-sm text-green-700 mt-1">
                VLINKPAY configuration has been updated. Membership payments are now enabled.
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-900">Error</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Settings Form */}
        <Card>
          <CardHeader>
            <CardTitle>VLINKPAY Configuration</CardTitle>
            <CardDescription>
              Enter your VLINKPAY credentials provided by the administrator.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Merchant Ref Code */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Merchant Ref Code <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={merchantRefCode}
                onChange={(e) => setMerchantRefCode(e.target.value)}
                placeholder="Enter merchant reference code"
                className="h-11 font-mono"
              />
              <p className="text-xs text-gray-500">
                Your unique merchant reference code from VLINKPAY
              </p>
            </div>

            {/* API Key */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                API Key <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter VLINKPAY API key"
                  className="h-11 font-mono pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Your VLINKPAY API key for authentication
              </p>
            </div>

            {/* Secret Key */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Secret Key <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type={showSecretKey ? "text" : "password"}
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="Enter VLINKPAY secret key"
                  className="h-11 font-mono pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowSecretKey(!showSecretKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Your VLINKPAY secret key for additional security
              </p>
            </div>

            {/* Sandbox Endpoint */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Sandbox Endpoint <span className="text-red-500">*</span>
              </label>
              <Input
                type="url"
                value={sandboxEndpoint}
                onChange={(e) => setSandboxEndpoint(e.target.value)}
                placeholder="https://test-web-app.vlinkpay.com"
                className="h-11"
              />
              <p className="text-xs text-gray-500">
                The base URL for VLINKPAY (sandbox: test-web-app, production: web-app)
              </p>
            </div>

            {/* Redirect URL */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Redirect URL <span className="text-green-600">(Auto-configured)</span>
              </label>
              <div className="relative">
                <Input
                  type="url"
                  value={redirectUrl}
                  readOnly
                  disabled
                  className="h-11 bg-gray-50 cursor-not-allowed font-mono text-gray-700"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-green-800 font-medium">✅ Pre-configured</p>
                  <p className="text-xs text-green-700 mt-1">
                    This URL is automatically configured to redirect users to the membership redeem section after successful payment.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSave}
                disabled={loading || !merchantRefCode.trim() || !apiKey.trim() || !secretKey.trim() || !sandboxEndpoint.trim() || !redirectUrl.trim()}
                className="bg-[#FF9800] hover:bg-[#F57C00] text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900 text-base">
              📘 Configuration Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 space-y-3">
            <div>
              <h4 className="font-semibold mb-1">Merchant Ref Code</h4>
              <p>Your unique merchant identifier provided by VLINKPAY team.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">API Key</h4>
              <p>Secret key for authenticating with VLINKPAY services. Keep this confidential. <strong>Automatically encrypted</strong> using AES-256-GCM before storage.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Secret Key</h4>
              <p>Additional secret key for enhanced security. <strong>Automatically encrypted</strong> using AES-256-GCM before storage.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Sandbox Endpoint</h4>
              <p>Use <code className="bg-blue-100 px-1 rounded">test-web-app.vlinkpay.com</code> for testing, <code className="bg-blue-100 px-1 rounded">web-app.vlinkpay.com</code> for production.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Redirect URL</h4>
              <p>After successful payment, users will be redirected to this URL. The redeem code will be sent via email.</p>
            </div>
            <p className="mt-4 pt-4 border-t border-blue-200">
              <strong>🔐 Encryption:</strong> All API keys are automatically encrypted using AES-256-GCM with your configured encryption key. No manual encryption needed!
            </p>
          </CardContent>
        </Card>

        {/* Warning Card about Timestamp */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-900 text-base">
              ⏰ Timestamp Configuration Needed
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-yellow-800 space-y-2">
            <p>
              <strong>Important:</strong> VLINKPAY requires timestamp conversion.
            </p>
            <p>
              Please provide the exact timestamp format and timezone conversion rules from VLINKPAY documentation.
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Format: Unix (seconds/ms), ISO 8601, or custom?</li>
              <li>Timezone: UTC, GMT+7, or other?</li>
              <li>Any offset calculations required?</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}