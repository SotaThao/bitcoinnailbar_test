import { useState } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface RedeemCodeInputProps {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function RedeemCodeInput({ onSuccess, onError }: RedeemCodeInputProps) {
  const [code, setCode] = useState('');
  const [userIdentifier, setUserIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleRedeem = async () => {
    // Validate inputs
    if (!code.trim()) {
      setError('Vui lòng nhập mã redeem');
      return;
    }
    if (!userIdentifier.trim()) {
      setError('Vui lòng nhập số điện thoại hoặc email');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/redeem/validate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            code: code.toUpperCase().trim(),
            userId: userIdentifier.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to redeem code');
      }

      setSuccess(true);
      setResult(data.data);
      setCode('');
      setUserIdentifier('');
      
      if (onSuccess) {
        onSuccess(data.data);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleRedeem();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Success Message */}
      {success && result && (
        <div className="mb-6 p-4 bg-green-900/30 border border-green-700/50 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <Check className="w-5 h-5 text-green-500" />
            </div>
            <div className="flex-1">
              <h4 className="text-green-400 font-semibold mb-1">
                Kích hoạt thành công!
              </h4>
              <p className="text-sm text-gray-300 mb-2">
                {result.activeMembership?.tier.toUpperCase()} Membership đã được áp dụng
              </p>
              <p className="text-xs text-gray-400">
                Thời hạn: {new Date(result.activeMembership?.endDate).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex-1">
              <h4 className="text-red-400 font-semibold mb-1">Lỗi</h4>
              <p className="text-sm text-gray-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Input Fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Mã Redeem Code
          </label>
          <Input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            placeholder="BTCNAIL-XXXXX-XXXXX"
            className="w-full h-12 bg-[#1f2937] border-gray-700 text-white placeholder:text-gray-500 focus:border-[#FF9800] focus:ring-[#FF9800]/20 rounded-xl font-mono text-center tracking-wider"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Số điện thoại hoặc Email
          </label>
          <Input
            type="text"
            value={userIdentifier}
            onChange={(e) => setUserIdentifier(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="0901234567 hoặc email@example.com"
            className="w-full h-12 bg-[#1f2937] border-gray-700 text-white placeholder:text-gray-500 focus:border-[#FF9800] focus:ring-[#FF9800]/20 rounded-xl"
            disabled={loading}
          />
        </div>

        <Button
          onClick={handleRedeem}
          disabled={loading || !code.trim() || !userIdentifier.trim()}
          className="w-full h-12 bg-gradient-to-r from-[#FF9800] to-[#F57C00] hover:from-[#F57C00] hover:to-[#FF9800] text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Đang xử lý...
            </span>
          ) : (
            'Kích hoạt Membership'
          )}
        </Button>
      </div>

      {/* Info Text */}
      <p className="text-xs text-gray-500 text-center mt-4">
        Mã redeem có hiệu lực trong 30 ngày kể từ khi thanh toán
      </p>
    </div>
  );
}
