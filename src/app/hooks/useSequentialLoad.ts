import { useState, useEffect } from 'react';

interface SequentialLoadOptions {
  hasPromotionModal: boolean;
  modalRendered: boolean;
}

export function useSequentialLoad({ hasPromotionModal, modalRendered }: SequentialLoadOptions) {
  const [loadCryptoTicker, setLoadCryptoTicker] = useState(false);
  const [loadChatbot, setLoadChatbot] = useState(false);

  useEffect(() => {
    if (hasPromotionModal) {
      // Scenario 1: Có Modal
      // Đợi modal render xong → CryptoTicker → Chatbot
      if (modalRendered) {
        // Load CryptoTicker sau khi modal đã render (300ms delay)
        const cryptoTimer = setTimeout(() => {
          setLoadCryptoTicker(true);
        }, 300);

        // Load Chatbot sau CryptoTicker (thêm 500ms)
        const chatbotTimer = setTimeout(() => {
          setLoadChatbot(true);
        }, 800);

        return () => {
          clearTimeout(cryptoTimer);
          clearTimeout(chatbotTimer);
        };
      }
    } else {
      // Scenario 2: Không có Modal
      // Load CryptoTicker ngay → Chatbot sau 500ms
      setLoadCryptoTicker(true);
      
      const chatbotTimer = setTimeout(() => {
        setLoadChatbot(true);
      }, 500);

      return () => clearTimeout(chatbotTimer);
    }
  }, [hasPromotionModal, modalRendered]);

  return {
    loadCryptoTicker,
    loadChatbot,
  };
}
