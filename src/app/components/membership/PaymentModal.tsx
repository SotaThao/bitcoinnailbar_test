import { useState, useEffect } from 'react';
import { X, Mail, AlertCircle, CheckCircle, Copy, ExternalLink, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useLanguage } from '../../context/LanguageContext';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentUrl: string;
  tierName: string;
  amount: number;
  onSuccess?: (redeemCode: string) => void;
}

export function PaymentModal({ 
  isOpen, 
  onClose, 
  paymentUrl, 
  tierName, 
  amount,
  onSuccess 
}: PaymentModalProps) {
  const [showIframe, setShowIframe] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [iframeUrl, setIframeUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('payment-modal-open');
    } else {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('payment-modal-open');
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('payment-modal-open');
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setShowIframe(false);
      setEmail('');
      setEmailError('');
      setIframeUrl('');
      setCopied(false);
    }
  }, [isOpen]);

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verify origin if needed
      // if (event.origin !== 'https://sandbox.vlinkpay.com') return;

      if (event.data?.type === 'payment-success') {
        handlePaymentSuccess(event.data.redeemCode);
      } else if (event.data?.type === 'close-modal') {
        console.log('📥 [MODAL] Received close-modal message from iframe');
        onClose();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onClose]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailSubmit = () => {
    if (!email.trim()) {
      setEmailError(t('payment_modal.email_form.error_required'));
      return;
    }

    if (!validateEmail(email)) {
      setEmailError(t('payment_modal.email_form.error_invalid'));
      return;
    }

    // Replace {email} placeholder in payment URL
    const urlWithEmail = paymentUrl.replace('{email}', encodeURIComponent(email));
    
    // Log URL to console
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔗 PAYMENT URL GENERATED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', email);
    console.log('💳 Tier:', tierName);
    console.log('💰 Amount:', amount);
    console.log('🔗 Payment URL:', urlWithEmail);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    setIframeUrl(urlWithEmail);
    setShowIframe(true);
  };

  const handlePaymentSuccess = (redeemCode: string) => {
    // Show success popup
    alert(
      `${t('payment_modal.success.title')}\n\n` +
      `${t('payment_modal.success.code_label')} ${redeemCode}\n\n` +
      `${t('payment_modal.success.instruction1')}\n` +
      `${t('payment_modal.success.instruction2')}`
    );

    // Close modal
    onClose();

    // Callback to parent
    if (onSuccess) {
      onSuccess(redeemCode);
    }

    // Scroll to redeem section
    setTimeout(() => {
      const redeemSection = document.getElementById('redeem-section');
      if (redeemSection) {
        redeemSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 500);
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(iframeUrl);
      console.log('✅ [COPY] Payment URL copied to clipboard:', iframeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = iframeUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        console.log('✅ [COPY] Payment URL copied to clipboard (fallback):', iframeUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Fallback: Failed to copy', err);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleOpenInNewTab = () => {
    console.log('🔗 [OPEN TAB] Opening payment URL in new tab:', iframeUrl);
    window.open(iframeUrl, '_blank', 'noopener,noreferrer');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm bg-[rgba(0,0,0,0.4)]">
      <div className="relative w-full max-w-4xl mx-4 md:mx-6 bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden mt-16 md:mt-20">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 bg-gradient-to-r from-[#FF9800] to-[#F57C00]">
          <div>
            <h2 className="text-base font-bold text-white">
              {tierName.toUpperCase()} {t('payment_modal.header.membership')}
            </h2>
            <p className="text-xs text-white/90 mt-0.5">
              {t('payment_modal.header.payment')} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-3 md:px-6 md:py-4">
          {!showIframe ? (
            // Email Collection Form
            <div className="max-w-md mx-auto space-y-6 py-6 md:py-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FF9800]/10 rounded-full mb-4">
                  <Mail className="w-8 h-8 text-[#FF9800]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {t('payment_modal.email_form.title')}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('payment_modal.email_form.subtitle')}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {t('payment_modal.email_form.label')} <span className="text-red-500">{t('payment_modal.email_form.required')}</span>
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError('');
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleEmailSubmit()}
                  placeholder={t('payment_modal.email_form.placeholder')}
                  className="h-12 text-base"
                  autoFocus
                />
                {emailError && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{emailError}</span>
                  </div>
                )}
              </div>

              <Button
                onClick={handleEmailSubmit}
                disabled={!email.trim()}
                className="w-full h-12 bg-[#FF9800] hover:bg-[#F57C00] text-white text-base font-semibold"
              >
                {t('payment_modal.email_form.button')}
              </Button>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 md:p-4">
                <div className="flex gap-2 md:gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">{t('payment_modal.notes.title')}</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>{t('payment_modal.notes.note1')}</li>
                      <li>{t('payment_modal.notes.note2')}</li>
                      <li>{t('payment_modal.notes.note3')}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Payment IFRAME
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 md:p-4">
                <p className="text-sm text-blue-800">
                  📧 {t('payment_modal.payment_iframe.sent_to')} <strong>{email}</strong>
                </p>
              </div>

              <div className="relative bg-gray-100 rounded-xl overflow-hidden h-[calc(90vh-280px)] min-h-[400px] max-h-[600px]">
                <iframe
                  src={iframeUrl}
                  className="w-full h-full border-0"
                  title="VLINKPAY Payment"
                  allow="payment"
                />
              </div>

              <p className="text-xs text-center text-gray-500">
                {t('payment_modal.payment_iframe.loading')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}