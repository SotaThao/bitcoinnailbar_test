import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2, XCircle, Gift, Phone, Sparkles } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

export default function RedeemMembershipStandalonePage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'ready' | 'activating' | 'success' | 'error'>('processing');
  const [redeemCode, setRedeemCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [membershipData, setMembershipData] = useState<any>(null);

  useEffect(() => {
    handlePaymentCallback();
  }, []);

  // Format phone number to US format: (xxx) xxx-xxxx
  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/\D/g, '');
    const limitedPhone = phoneNumber.slice(0, 10);
    
    if (limitedPhone.length <= 3) {
      return limitedPhone;
    } else if (limitedPhone.length <= 6) {
      return `(${limitedPhone.slice(0, 3)}) ${limitedPhone.slice(3)}`;
    } else {
      return `(${limitedPhone.slice(0, 3)}) ${limitedPhone.slice(3, 6)}-${limitedPhone.slice(6)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
    // Clear error when user starts typing
    if (phoneError) {
      setPhoneError('');
    }
  };

  const handlePaymentCallback = async () => {
    try {
      // Get redeemCode from URL params (VLinkPay redirect)
      const vlinkpayCode = searchParams.get('redeemCode');
      
      if (!vlinkpayCode) {
        setStatus('error');
        setError('Missing redeem code from payment provider');
        return;
      }

      console.log('🎫 [PAYMENT] VLinkPay Code from URL:', vlinkpayCode);

      // Get merchantOrderCode from sessionStorage (optional - fallback to server search)
      const merchantOrderCode = sessionStorage.getItem('pending_order');

      if (merchantOrderCode) {
        console.log('📦 [PAYMENT] Using merchantOrderCode from sessionStorage:', merchantOrderCode);
      } else {
        console.log('⚠️ [PAYMENT] sessionStorage not available - server will search for order');
      }

      console.log('🎉 [PAYMENT] Completing order...');

      // Call backend to complete order (with retry)
      let lastError = null;
      let success = false;
      
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(`🔄 [PAYMENT] Attempt ${attempt}/3...`);
          
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/payment/complete-order`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${publicAnonKey}`,
              },
              body: JSON.stringify({
                merchantOrderCode: merchantOrderCode || undefined, // Optional
                redeemCode: vlinkpayCode,
              }),
            }
          );

          const data = await response.json();
          
          console.log('📥 [PAYMENT] Response:', data);

          if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to complete order');
          }

          // Success!
          success = true;
          setRedeemCode(vlinkpayCode);
          setMembershipData(data.data);
          setStatus('ready');
          
          // Clear pending order if exists
          if (merchantOrderCode) {
            sessionStorage.removeItem('pending_order');
          }
          
          console.log('✅ [PAYMENT] Order completed successfully!');
          break;
          
        } catch (err: any) {
          lastError = err;
          console.error(`❌ [PAYMENT] Attempt ${attempt} failed:`, err.message);
          
          if (attempt < 3) {
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          }
        }
      }
      
      if (!success) {
        throw lastError || new Error('Failed to complete order after 3 attempts');
      }

    } catch (error: any) {
      console.error('❌ [PAYMENT] Error:', error);
      setStatus('error');
      setError(error.message || 'An error occurred while processing your payment');
    }
  };

  const handleActivateMembership = async () => {
    console.log('🚀 [ACTIVATE] Starting membership activation...');
    console.log('📞 [ACTIVATE] Phone Number:', phoneNumber);
    console.log('🎫 [ACTIVATE] Redeem Code:', redeemCode);
    
    // Validate phone number is not empty
    if (!phoneNumber.trim()) {
      console.warn('⚠️ [ACTIVATE] Phone number is empty');
      setPhoneError('Please enter your phone number');
      return;
    }

    // Validate phone number format (must have 10 digits)
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    if (digitsOnly.length !== 10) {
      console.warn('⚠️ [ACTIVATE] Phone number is incomplete');
      setPhoneError('Please enter a valid 10-digit phone number');
      return;
    }

    setStatus('activating');
    setError('');
    setPhoneError('');

    try {
      console.log('📡 [ACTIVATE] Sending request to backend...');
      console.log('📦 [ACTIVATE] Request payload:', {
        code: redeemCode,
        userId: phoneNumber.trim()
      });

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

      console.log('📥 [ACTIVATE] Response status:', response.status, response.statusText);

      const data = await response.json();
      console.log('📥 [ACTIVATE] Response data:', data);

      if (!response.ok || !data.success) {
        console.error('❌ [ACTIVATE] Backend returned error:', data.error);
        throw new Error(data.error || 'Failed to activate membership');
      }

      // Success!
      console.log('✅ [ACTIVATE] Membership activated successfully!');
      console.log('🎉 [ACTIVATE] Membership data:', data.data);
      
      setStatus('success');
      setMembershipData(data.data);

    } catch (error: any) {
      console.error('❌ [ACTIVATE] Error caught:', error);
      console.error('❌ [ACTIVATE] Error message:', error.message);
      console.error('❌ [ACTIVATE] Error stack:', error.stack);
      
      setStatus('ready'); // Back to ready state
      setError(error.message || 'Failed to activate membership');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#1a1a2e] to-black flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#FF9800]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
          {status === 'processing' && (
            <div className="p-12 text-center">
              <Loader2 className="w-20 h-20 text-[#FF9800] mx-auto mb-6 animate-spin" />
              <h1 className="text-2xl font-bold text-white mb-3">
                Processing Payment...
              </h1>
              <p className="text-gray-400">
                Please wait while we confirm your payment
              </p>
            </div>
          )}

          {status === 'ready' && (
            <div className="p-8 md:p-12">
              {/* Success Icon */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/50">
                    <CheckCircle className="w-14 h-14 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 text-center">
                Payment Successful!
              </h1>
              <p className="text-gray-400 mb-10 text-center text-lg">
                Complete your membership activation
              </p>

              {/* Form */}
              <div className="space-y-6">
                {/* Redeem Code */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Your Redeem Code
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FF9800] to-amber-500 rounded-xl blur opacity-25 group-hover:opacity-40 transition-opacity" />
                    <div className="relative bg-gray-900/90 border-2 border-[#FF9800]/30 rounded-xl px-3 md:px-5 py-3 md:py-4 flex items-center gap-2 md:gap-3">
                      <Gift className="w-5 h-5 md:w-6 md:h-6 text-[#FF9800] flex-shrink-0" />
                      <input
                        type="text"
                        value={redeemCode}
                        readOnly
                        className="flex-1 bg-transparent border-none text-white font-mono font-bold text-sm md:text-lg text-center focus:outline-none tracking-wider"
                      />
                      <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-400 flex-shrink-0" />
                    </div>
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Phone Number <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${phoneError ? 'text-red-400' : 'text-gray-400'}`} />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      placeholder="(555) 123-4567"
                      className={`w-full bg-gray-900/50 border-2 ${phoneError ? 'border-red-500/50 focus:border-red-500' : 'border-gray-700/50 hover:border-gray-600 focus:border-[#FF9800]'} rounded-xl px-12 py-4 text-white placeholder-gray-500 focus:outline-none transition-all`}
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                )}

                {/* Phone Error Message */}
                {phoneError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-red-300 text-sm">{phoneError}</p>
                  </div>
                )}

                {/* Membership Info */}
                {membershipData && (
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-5">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-400 text-sm">Membership Tier</span>
                      <span className="text-white font-bold capitalize text-lg">{membershipData.membershipTier}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Duration</span>
                      <span className="text-white font-bold">{membershipData.duration} months</span>
                    </div>
                  </div>
                )}

                {/* CTA Button */}
                <button
                  onClick={handleActivateMembership}
                  disabled={!phoneNumber.trim()}
                  className="w-full relative group overflow-hidden rounded-xl p-1 transition-all"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FF9800] via-amber-500 to-[#FF9800] animate-gradient-x" />
                  <div className="relative bg-gradient-to-r from-[#FF9800] to-amber-500 hover:from-[#F57C00] hover:to-amber-600 disabled:from-gray-600 disabled:to-gray-700 py-3 md:py-5 px-6 md:px-8 rounded-lg font-bold text-white text-base md:text-lg shadow-xl disabled:cursor-not-allowed transition-all transform group-hover:scale-[1.02] active:scale-[0.98]">
                    Activate Membership Now
                  </div>
                </button>
              </div>
            </div>
          )}

          {status === 'activating' && (
            <div className="p-12 text-center">
              <Loader2 className="w-20 h-20 text-[#FF9800] mx-auto mb-6 animate-spin" />
              <h1 className="text-2xl font-bold text-white mb-3">
                Activating Membership...
              </h1>
              <p className="text-gray-400">
                Please wait while we set up your account
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="p-8 md:p-12 text-center">
              {/* Success Animation */}
              <div className="mb-8">
                <div className="relative inline-block">
                  <div className="w-28 h-28 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/50 animate-bounce">
                    <CheckCircle className="w-16 h-16 text-white" />
                  </div>
                  <div className="absolute inset-0 w-28 h-28 bg-green-400 rounded-full animate-ping opacity-20" />
                </div>
              </div>

              <h1 className="text-4xl font-bold text-white mb-4">
                Welcome to {membershipData?.membership?.tier || 'VIP'} Tier!
              </h1>
              <p className="text-gray-400 text-lg mb-10">
                Your membership has been activated
              </p>

              {/* Membership Details */}
              <div className="bg-gradient-to-r from-gray-900/90 to-gray-800/90 border border-gray-700/50 rounded-2xl p-6 mb-8 space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-gray-700/50">
                  <span className="text-gray-400">Phone Number</span>
                  <span className="text-white font-bold">{phoneNumber}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-700/50">
                  <span className="text-gray-400">Status</span>
                  <span className="flex items-center gap-2 text-green-400 font-bold">
                    <CheckCircle className="w-5 h-5" />
                    Active
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Valid Until</span>
                  <span className="text-white font-bold">
                    {membershipData?.membership?.endDate 
                      ? new Date(membershipData.membership.endDate).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Success Message */}
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
                <p className="text-green-300 font-medium">
                  🎉 You can now enjoy all the benefits of your membership!
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Book Now CTA - Primary */}
                <a
                  href="/booking"
                  className="flex-1 relative group overflow-hidden rounded-xl p-1 transition-all"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FF9800] via-amber-500 to-[#FF9800] animate-gradient-x" />
                  <div className="relative bg-gradient-to-r from-[#FF9800] to-amber-500 hover:from-[#F57C00] hover:to-amber-600 py-4 px-6 rounded-lg font-bold text-white text-lg shadow-xl transition-all transform group-hover:scale-[1.02] active:scale-[0.98] text-center">
                    📅 Book Now
                  </div>
                </a>

                {/* Go to Homepage - Secondary */}
                <a
                  href="/"
                  className="flex-1 py-4 px-6 bg-gray-700/50 hover:bg-gray-600/50 border-2 border-gray-600/50 hover:border-gray-500 text-white font-bold rounded-xl transition-all text-center text-lg"
                >
                  🏠 Go to Homepage
                </a>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="p-8 md:p-12 text-center">
              <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-14 h-14 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-3">
                Payment Error
              </h1>
              <p className="text-gray-400 mb-8">
                {error}
              </p>
              <a
                href="/"
                className="inline-block px-8 py-4 bg-[#FF9800] hover:bg-[#F57C00] text-white font-bold rounded-xl transition-colors"
              >
                Return to Homepage
              </a>
            </div>
          )}
        </div>

        {/* Bitcoin Nail Bar Branding */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            Powered by <span className="text-[#FF9800] font-semibold">Bitcoin Nail Bar</span>
          </p>
        </div>
      </div>
    </div>
  );
}