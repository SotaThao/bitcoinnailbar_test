import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { MembershipTier } from '../../hooks/useMembershipTiers';
import { useState } from 'react';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { PaymentModal } from '../membership/PaymentModal';

interface MembershipCardVisuals {
  icon: any;
  borderColor: string;
  bgGradient: string;
  buttonStyle: string;
  glowColor: string;
  hexColor: string;
  popular: boolean;
}

interface MembershipCardProps {
  tier: MembershipTier;
  visual: MembershipCardVisuals;
  saveText?: string | null;
  className?: string;
  previewMode?: boolean; // If true, disable animations/links
}

export function MembershipCard({ tier, visual, saveText, className, previewMode = false }: MembershipCardProps) {
  const Icon = visual.icon;
  const Container = previewMode ? 'div' : motion.div;
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');

  const animationProps = previewMode ? {} : {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true }
  };

  const handleJoinNow = async () => {
    if (previewMode) return;

    setLoadingPayment(true);

    try {
      // Create payment link
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/payment/create-link`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            planId: tier.id,
            tierName: tier.name,
            duration: tier.billing_cycle === 'year' ? 12 : tier.billing_cycle === 'month' ? 1 : 0.25,
            amount: tier.price,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create payment link');
      }

      // Open payment modal with iframe
      setPaymentUrl(data.data.paymentUrl);
      setShowPaymentModal(true);
    } catch (error: any) {
      console.error('Error creating payment:', error);
      alert('Đã xảy ra lỗi khi tạo liên kết thanh toán. Vui lòng thử lại.');
    } finally {
      setLoadingPayment(false);
    }
  };

  const handlePaymentSuccess = (redeemCode: string) => {
    console.log('Payment successful, redeem code:', redeemCode);
    // Auto-switch to redeem tab can be handled by RedeemSection
  };

  return (
    <>
      <Container
        {...animationProps}
        className={`relative group ${className}`}
      >
        <div className={`
          relative h-full flex flex-col p-6 rounded-2xl border transition-all duration-300
          ${visual.popular ? 'bg-gradient-to-br from-gray-900 via-[#1f2937] to-gray-900 border-white/70 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] z-10' : 'bg-[#0f1219] border-gray-800/50 hover:border-gray-700'}
          ${visual.popular && !previewMode ? 'md:-translate-y-4' : ''}
        `}
        style={{
          borderColor: visual.popular ? 'rgba(255,255,255,0.7)' : undefined
        }}
        >
          {/* Popular Badge */}
          {visual.popular && (
            <div className="absolute top-0 right-4 bg-white text-black text-[10px] font-bold px-3 py-1 rounded-b-lg shadow-lg">
              Most Popular
            </div>
          )}

          {/* Save Badge */}
          {saveText && (
            <div className={`
              absolute top-0 left-0 text-white text-[10px] font-bold px-3 py-1 rounded-br-lg rounded-tl-2xl shadow-lg
              ${tier.name === 'vip-crypto' ? 'bg-[#f7931a]' : 'bg-red-600'}
            `}>
              {saveText}
            </div>
          )}

          {/* Glow Effect */}
          <div 
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
            style={{ background: `radial-gradient(circle at center, ${visual.glowColor}, transparent 70%)` }}
          />

          {/* Header */}
          <div className="flex flex-col items-center pt-8 mb-8">
            <div className={`
              w-14 h-14 rounded-full flex items-center justify-center mb-6 border-2 relative
              ${visual.borderColor} ${tier.color}
            `}
            style={{ boxShadow: `0 0 15px ${visual.glowColor}` }}
            >
              <Icon className="w-6 h-6" />
            </div>
            
            <h3 className={`text-2xl font-serif font-bold mb-2 tracking-widest uppercase ${tier.color}`}>
              {tier.display_name}
            </h3>
            
            <div className="text-center relative">
              <div className="flex items-baseline justify-center gap-1 text-white" 
                   style={{ textShadow: visual.popular ? '0 0 15px rgba(255,255,255,0.6)' : undefined }}>
                <span className="text-4xl font-bold">${tier.price}</span>
                <span className="text-gray-400 text-sm">
                  {tier.billing_cycle === 'week' ? '/wk' : 
                   tier.billing_cycle === 'month' ? '/mo' : '/yr'}
                </span>
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">
                 {tier.benefits.length} Benefits
              </div>
            </div>
          </div>

          {/* Divider */}
          <div 
            className="h-px w-full mb-8" 
            style={{ background: `linear-gradient(90deg, transparent, ${visual.hexColor}40, transparent)` }}
          />

          {/* Features */}
          <ul className="space-y-4 mb-8 flex-grow">
            {tier.benefits.map((feature: string, idx: number) => (
              <li key={idx} className="flex items-start gap-3 text-sm">
                <div className={`mt-0.5 min-w-[14px] ${tier.name === 'silver' ? 'text-[#eab308]' : tier.name === 'vip-crypto' ? 'text-[#f7931a]' : tier.color}`}>
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>

          {/* Button */}
          <Button 
            variant="ghost"
            onClick={handleJoinNow}
            disabled={loadingPayment || previewMode}
            className={`w-full py-3.5 h-auto rounded-full text-sm transition-all duration-300 uppercase tracking-wide ${visual.buttonStyle}`}>
            {loadingPayment ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </span>
            ) : (
              'Join Now'
            )}
          </Button>
        </div>
        
        {/* Border glow for popular card */}
        {visual.popular && (
          <div className="absolute inset-0 rounded-2xl border-2 border-white/20 pointer-events-none -z-10 translate-y-4 blur-sm" />
        )}
      </Container>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        paymentUrl={paymentUrl}
        tierName={tier.display_name}
        amount={tier.price}
        onSuccess={handlePaymentSuccess}
      />
    </>
  );
}