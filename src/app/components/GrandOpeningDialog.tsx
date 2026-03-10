/**
 * Grand Opening Dialog
 * 
 * Shows a popup announcing the grand opening date.
 * Auto-disables after Mar 28, 2026 (CST).
 * 
 * Used in: BookingPage (before booking flow)
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PartyPopper, ExternalLink, CalendarCheck, X, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { useLanguage } from "../context/LanguageContext";
import {
  isBeforeGrandOpening,
  GRAND_OPENING_EVENT_URL,
  getGrandOpeningDateString,
} from "../lib/grand-opening";

interface GrandOpeningDialogProps {
  onContinue: () => void;
}

export function GrandOpeningDialog({ onContinue }: GrandOpeningDialogProps) {
  const { language } = useLanguage();
  const [visible, setVisible] = useState(true);

  // Auto-disable after grand opening
  if (!isBeforeGrandOpening() || !visible) return null;

  const dateStr = getGrandOpeningDateString(language);

  const handleContinue = () => {
    setVisible(false);
    onContinue();
  };

  const handleViewEvent = () => {
    window.open(GRAND_OPENING_EVENT_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleContinue();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-gradient-to-b from-[#1a1f2e] to-[#0B0F19] rounded-2xl border border-[#FF9800]/40 shadow-[0_0_60px_rgba(255,152,0,0.15)] overflow-hidden"
          >
            {/* Decorative top bar */}
            <div className="h-1.5 bg-gradient-to-r from-[#FF9800] via-[#F7931A] to-[#FF9800]" />

            {/* Close button */}
            <button
              onClick={handleContinue}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="p-6 pt-8 text-center space-y-5">
              {/* Animated icon */}
              <motion.div
                animate={{
                  rotate: [0, -10, 10, -10, 0],
                  scale: [1, 1.1, 1, 1.1, 1],
                }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FF9800]/15 border-2 border-[#FF9800]/30"
              >
                <PartyPopper className="w-8 h-8 text-[#FF9800]" />
              </motion.div>

              {/* Headline */}
              <div className="space-y-2">
                <h2 className="text-2xl font-bold font-serif text-white leading-tight">
                  {language === "vi" ? (
                    <>
                      <span className="text-[#FF9800]">Bitcoin Nail Bar</span>
                      <br />
                      Chính thức khai trương
                    </>
                  ) : (
                    <>
                      <span className="text-[#FF9800]">Bitcoin Nail Bar</span>
                      <br />
                      Grand Opening
                    </>
                  )}
                </h2>

                {/* Date badge */}
                <motion.div
                  animate={{ scale: [1, 1.03, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF9800]/10 border border-[#FF9800]/30"
                >
                  <CalendarCheck className="w-4 h-4 text-[#FF9800]" />
                  <span className="text-[#FF9800] font-bold text-lg">{dateStr}</span>
                </motion.div>
              </div>

              {/* Description */}
              <p className="text-gray-400 text-sm leading-relaxed px-2">
                {language === "vi"
                  ? "Chúng tôi đang chuẩn bị mọi thứ thật hoàn hảo để chào đón quý khách. Hãy xem chương trình khai trương đặc biệt với nhiều ưu đãi hấp dẫn!"
                  : "We're putting the finishing touches on everything to welcome you. Check out our special grand opening program with exclusive deals and offers!"}
              </p>

              {/* CTA Buttons */}
              <div className="space-y-3 pt-2">
                {/* Primary: View Grand Opening Event */}
                <Button
                  onClick={handleViewEvent}
                  className="w-full h-12 bg-[#FF9800] hover:bg-[#F57C00] text-black font-bold text-base rounded-xl shadow-[0_0_20px_rgba(255,152,0,0.3)] transition-all hover:shadow-[0_0_30px_rgba(255,152,0,0.5)]"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  {language === "vi"
                    ? "Xem chương trình khai trương"
                    : "View Grand Opening Program"}
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>

                {/* Secondary: Continue to Booking */}
                <Button
                  onClick={handleContinue}
                  variant="outline"
                  className="w-full h-11 border-gray-600 text-[#424242] hover:bg-gray-800 hover:text-white rounded-xl transition-all"
                >
                  <CalendarCheck className="w-4 h-4 mr-2 text-[#424242]" />
                  {language === "vi"
                    ? "Tiếp tục đặt lịch"
                    : "Continue to Booking"}
                </Button>
              </div>

              {/* Footer note */}
              <p className="text-xs text-gray-600">
                {language === "vi"
                  ? "Bạn vẫn có thể đặt lịch trước cho ngày khai trương!"
                  : "You can still pre-book for the grand opening day!"}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}