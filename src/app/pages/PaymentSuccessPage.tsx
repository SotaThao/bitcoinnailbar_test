import { useNavigate, useSearchParams } from 'react-router';
import { CheckCircle, Loader2, XCircle, Gift, Phone } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'ready' | 'activating' | 'success' | 'error'>('processing');
  const [redeemCode, setRedeemCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [membershipData, setMembershipData] = useState<any>(null);

  useEffect(() => {
    handlePaymentCallback();
  }, []);

  const handlePaymentCallback = async () => {
    try {
      // Get redeemCode from URL params (VLinkPay redirect)
      const vlinkpayCode = searchParams.get('redeemCode');
      
      if (!vlinkpayCode) {
        setStatus('error');
        setError('Missing redeem code from payment provider');
        return;
      }

      // Get merchantOrderCode from sessionStorage
      const merchantOrderCode = sessionStorage.getItem('pending_order');

      if (!merchantOrderCode) {
        setStatus('error');
        setError('Order information not found. Please contact support.');
        return;
      }

      console.log('🎉 [PAYMENT] Completing order...');
      console.log('📦 Order Code:', merchantOrderCode);
      console.log('🎫 VLinkPay Code:', vlinkpayCode);

      // Call backend to complete order
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/payment/complete-order`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            merchantOrderCode,
            redeemCode: vlinkpayCode,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete order');
      }

      // Success - Order completed, now ready for user to redeem
      setRedeemCode(vlinkpayCode);
      setMembershipData(data.data);
      setStatus('ready');
      
      // Clear pending order
      sessionStorage.removeItem('pending_order');

    } catch (error: any) {
      console.error('❌ [PAYMENT] Error:', error);
      setStatus('error');
      setError(error.message || 'An error occurred while processing your payment');
    }
  };

  const handleActivateMembership = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter your phone number');
      return;
    }

    setStatus('activating');
    setError('');

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
            code: redeemCode,
            userId: phoneNumber.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to activate membership');
      }

      // Success!
      setStatus('success');
      setMembershipData(data.data);

      // Redirect to homepage after 5 seconds
      setTimeout(() => {
        navigate('/');
      }, 5000);

    } catch (error: any) {
      console.error('❌ [REDEEM] Error:', error);
      setStatus('ready'); // Back to ready state
      setError(error.message || 'Failed to activate membership');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
        {status === 'processing' && (
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-[#FF9800] mx-auto mb-6 animate-spin" />
            <h1 className="text-2xl font-bold text-white mb-3">
              Processing Payment...
            </h1>
            <p className="text-gray-400">
              Please wait while we confirm your payment
            </p>
          </div>
        )}

        {status === 'ready' && (
          <>
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 text-center">
              Payment Successful!
            </h1>
            <p className="text-gray-400 mb-8 text-center">
              Activate your membership now
            </p>

            <div className="space-y-6">
              {/* Redeem Code (Auto-filled, Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Redeem Code
                </label>
                <div className="relative">
                  <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FF9800]" />
                  <input
                    type="text"
                    value={redeemCode}
                    readOnly
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-10 py-3 text-white font-mono font-bold text-center tracking-wider focus:outline-none"
                  />
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                </div>
              </div>

              {/* Phone Number Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter your phone number"
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-10 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FF9800] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Membership Info */}
              {membershipData && (
                <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Tier:</span>
                    <span className="text-white font-semibold capitalize">{membershipData.membershipTier}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-2">
                    <span className="text-gray-400">Duration:</span>
                    <span className="text-white font-semibold">{membershipData.duration} months</span>
                  </div>
                </div>
              )}

              {/* CTA Button */}
              <button
                onClick={handleActivateMembership}
                disabled={!phoneNumber.trim()}
                className="w-full bg-[#FF9800] hover:bg-[#F57C00] disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Activate Membership Now
              </button>
            </div>
          </>
        )}

        {status === 'activating' && (
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-[#FF9800] mx-auto mb-6 animate-spin" />
            <h1 className="text-2xl font-bold text-white mb-3">
              Activating Membership...
            </h1>
            <p className="text-gray-400">
              Please wait while we set up your account
            </p>
          </div>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4 text-center">
              Membership Activated!
            </h1>
            <p className="text-gray-400 mb-6 text-center">
              Welcome to {membershipData?.membership?.tier} tier
            </p>

            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Phone:</span>
                <span className="text-white font-semibold">{phoneNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Status:</span>
                <span className="text-green-400 font-semibold">Active</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Valid Until:</span>
                <span className="text-white font-semibold">
                  {membershipData?.membership?.endDate 
                    ? new Date(membershipData.membership.endDate).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
            </div>

            <div className="text-center text-sm text-gray-500">
              <p>Redirecting to homepage in 5 seconds...</p>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-3 text-center">
              Payment Error
            </h1>
            <p className="text-gray-400 mb-6 text-center">
              {error}
            </p>

            <button
              onClick={() => navigate('/')}
              className="w-full px-6 py-3 bg-[#FF9800] hover:bg-[#F57C00] text-white font-semibold rounded-lg transition-colors"
            >
              Return to Homepage
            </button>
          </>
        )}
      </div>
    </div>
  );
}