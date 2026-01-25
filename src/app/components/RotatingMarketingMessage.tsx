/**
 * ROTATING MARKETING MESSAGE
 * Displays rotating promotional messages while chatbot is loading
 * Messages rotate every 2-3 seconds
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Wallet, Tag, Gift } from 'lucide-react';

// Marketing messages với icons
const MARKETING_MESSAGES = [
  {
    text: "💎 Members get 20% off on all services!",
    icon: Sparkles,
    color: "#FF9800"
  },
  {
    text: "₿ Pay with Bitcoin & get extra rewards",
    icon: Wallet,
    color: "#F7931A"
  },
  {
    text: "🎁 First-time customers: 15% discount",
    icon: Gift,
    color: "#4CAF50"
  },
  {
    text: "✨ Premium nail art starting at $30",
    icon: Tag,
    color: "#9C27B0"
  },
  {
    text: "🔥 Same-day booking available now!",
    icon: Sparkles,
    color: "#FF5722"
  },
  {
    text: "💳 Crypto payments = Instant confirmation",
    icon: Wallet,
    color: "#00BCD4"
  },
];

export function RotatingMarketingMessage() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Rotate message every 2.5 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % MARKETING_MESSAGES.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const currentMessage = MARKETING_MESSAGES[currentIndex];

  return (
    <div className="flex justify-start">
      <div className="bg-[#2a3040] rounded-2xl rounded-tl-none px-4 py-3 border border-gray-700 min-w-[250px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <span 
              className="text-sm font-medium"
              style={{ color: currentMessage.color }}
            >
              {currentMessage.text}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}