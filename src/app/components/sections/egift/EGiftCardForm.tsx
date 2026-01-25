import { motion } from "motion/react";
import {
  Lock,
  Zap,
  Edit3,
  Sparkles,
  Loader2,
  Check,
} from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { toast } from "sonner";

export const amounts = [
  { value: 50, label: "$50" },
  { value: 100, label: "$100" },
  { value: 200, label: "$200" },
  { value: 500, label: "$500" },
];

interface EGiftCardFormProps {
  recipientName: string;
  setRecipientName: (name: string) => void;
  giftMessage: string;
  setGiftMessage: (msg: string) => void;
  handleMessageChange: (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => void;
  selectedAmount: number;
  setSelectedAmount: (amount: number) => void;
  customAmount: string;
  setCustomAmount: (amount: string) => void;
  charCount: number;
  maxChars: number;
  isGeneratingAI: boolean;
  handleAIGenerate: () => void;
}

export function EGiftCardForm({
  recipientName,
  setRecipientName,
  giftMessage,
  handleMessageChange,
  selectedAmount,
  setSelectedAmount,
  customAmount,
  setCustomAmount,
  charCount,
  maxChars,
  isGeneratingAI,
  handleAIGenerate,
}: EGiftCardFormProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="space-y-6"
    >
      {/* Recipient Name */}
      <div className="space-y-2">
        <label className="text-xs font-bold tracking-widest text-gray-400 uppercase flex items-center gap-2">
          <Edit3 className="w-3 h-3" />
          Recipient Name
        </label>
        <Input
          type="text"
          placeholder="Enter recipient's name..."
          value={recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
          className="bg-[#111827] border-gray-700 text-white placeholder:text-gray-500 focus:border-[#FF9800] focus:ring-[#FF9800]/20 h-12"
        />
      </div>

      {/* Gift Message */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold tracking-widest text-gray-400 uppercase">
            Gift Message
          </label>
          <span className="text-xs text-gray-500">
            {charCount}/{maxChars}
          </span>
        </div>
        <div className="relative">
          <Textarea
            placeholder="Write a sweet note..."
            value={giftMessage}
            onChange={handleMessageChange}
            rows={4}
            className="bg-[#111827] border-gray-700 text-white placeholder:text-gray-500 focus:border-[#FF9800] focus:ring-[#FF9800]/20 resize-none pr-12 pb-10"
          />

          {/* AI Write Button */}
          <button
            onClick={handleAIGenerate}
            disabled={isGeneratingAI}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FF9800]/10 hover:bg-[#FF9800]/20 border border-[#FF9800]/30 transition-all group"
          >
            {isGeneratingAI ? (
              <Loader2 className="w-3.5 h-3.5 text-[#FF9800] animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-[#FF9800] group-hover:scale-110 transition-transform" />
            )}
            <span className="text-xs font-bold text-[#FF9800] tracking-wide">
              {isGeneratingAI ? "WRITING..." : "AI WRITE"}
            </span>
          </button>
        </div>
      </div>

      {/* Amount Selection */}
      <div className="space-y-3">
        <label className="text-xs font-bold tracking-widest text-gray-400 uppercase">
          Select Amount
        </label>

        <div className="grid grid-cols-4 gap-3">
          {amounts.map((amount) => (
            <button
              key={amount.value}
              onClick={() => {
                setSelectedAmount(amount.value);
                setCustomAmount("");
              }}
              className={`h-12 rounded-lg font-bold transition-all ${
                selectedAmount === amount.value && !customAmount
                  ? "bg-[#FF9800] text-[#0B0F19] shadow-[0_0_20px_rgba(255,152,0,0.4)]"
                  : "bg-[#111827] text-gray-300 border border-gray-700 hover:border-[#FF9800]/50"
              }`}
            >
              {amount.label}
            </button>
          ))}
        </div>

        {/* Custom Amount */}
        <div className="relative">
          <Input
            type="number"
            placeholder="Custom"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              if (e.target.value) setSelectedAmount(0);
            }}
            className="bg-[#111827] border-gray-700 text-white placeholder:text-gray-500 focus:border-[#FF9800] focus:ring-[#FF9800]/20 h-12 pl-8"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            $
          </span>
        </div>
      </div>

      {/* Purchase Button - Toast Notification */}
      <Button
        size="lg"
        onClick={() => {
          toast.custom(
            (t) => (
              <div className="bg-black border border-[#FF9800] rounded-xl px-8 py-4 shadow-[0_0_50px_rgba(255,152,0,0.5)] flex items-center gap-4 min-w-[320px] justify-center">
                <div className="w-6 h-6 rounded-full bg-[#FF9800] flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-black stroke-[3]" />
                </div>
                <span className="text-white font-medium text-lg tracking-wide">
                  Proceeding to Checkout...
                </span>
              </div>
            ),
            { duration: 3000 },
          );
        }}
        className="w-full h-14 bg-[#FF9800] hover:bg-[#F7931A] text-white font-bold text-lg tracking-wide shadow-[0_0_30px_rgba(255,152,0,0.3)] hover:shadow-[0_0_50px_rgba(255,152,0,0.5)] transition-all rounded-full"
      >
        Purchase E-Gift Card
      </Button>

      {/* Security Info */}
      <div className="flex items-center justify-center gap-6 pt-4 border-t border-gray-800">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Lock className="w-4 h-4 text-[#FF9800]" />
          Secure Payment
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Zap className="w-4 h-4 text-[#FF9800]" />
          Instant Delivery
        </div>
      </div>
    </motion.div>
  );
}