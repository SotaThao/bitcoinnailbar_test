import { useState } from 'react';
import { motion } from 'motion/react';
import { Gift } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { EGiftCardPreview, cardColors, CardColor } from './egift/EGiftCardPreview';
import { EGiftCardForm } from './egift/EGiftCardForm';

export function EGiftCardSection() {
  const { t } = useLanguage();
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedColor, setSelectedColor] = useState<CardColor>(cardColors[0]);
  const [recipientName, setRecipientName] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const maxChars = 200;

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= maxChars) {
      setGiftMessage(text);
      setCharCount(text.length);
    }
  };

  const handleAIGenerate = () => {
    setIsGeneratingAI(true);
    // Simulate AI delay
    setTimeout(() => {
      const messages = t('egift.ai_messages') as unknown as string[] || [
        "Wishing you a relaxing day filled with pampering and joy!",
        "Treat yourself to the luxury you deserve. Enjoy!",
        "A little something to brighten your day. Best wishes!",
        "Relax, refresh, and recharge. You've earned it!",
        "Sending you love and a moment of pure bliss."
      ];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      setGiftMessage(randomMessage);
      setCharCount(randomMessage.length);
      setIsGeneratingAI(false);
    }, 1500);
  };

  return (
    <section id="egift-section" className="relative py-24 bg-gradient-to-b from-[#0B0F19] via-[#1A1F2E] to-[#0B0F19] overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#FF9800]/10 via-transparent to-transparent" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-[#FF9800]/20 rounded-full filter blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-[#F7931A]/20 rounded-full filter blur-[128px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10 mt-[-60px]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF9800]/10 border border-[#FF9800]/30 mb-6">
            <Gift className="h-4 w-4 text-[#FF9800]" />
            <span className="text-sm font-bold tracking-widest text-[#FF9800] uppercase">
              {t('egift.badge') || 'The Perfect Gift'}
            </span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-serif font-bold mb-6">
            <span className="text-white">{t('egift.send') || 'Send'} </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF9800] to-[#F7931A]">
              {t('egift.luxury') || 'LUXURY'}
            </span>
            <span className="text-white"> {t('egift.instantly') || 'Instantly'}</span>
          </h2>
          
          <p className="text-lg text-gray-300 leading-relaxed">
            {t('egift.desc') || 'Surprise your loved ones with a digital key to relaxation. Delivered instantly via Email/SMS.'}
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 max-w-7xl mx-auto items-start">
          {/* Card Preview - Order 1 on mobile, Order 1 on Desktop */}
          <div className="order-1">
            <EGiftCardPreview
              isFlipped={isFlipped}
              setIsFlipped={setIsFlipped}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              recipientName={recipientName}
              amount={customAmount || selectedAmount}
            />
          </div>

          {/* Form - Order 2 on mobile, Order 2 on Desktop */}
          <div className="order-2">
            <EGiftCardForm
              recipientName={recipientName}
              setRecipientName={setRecipientName}
              giftMessage={giftMessage}
              setGiftMessage={setGiftMessage}
              handleMessageChange={handleMessageChange}
              selectedAmount={selectedAmount}
              setSelectedAmount={setSelectedAmount}
              customAmount={customAmount}
              setCustomAmount={setCustomAmount}
              charCount={charCount}
              maxChars={maxChars}
              isGeneratingAI={isGeneratingAI}
              handleAIGenerate={handleAIGenerate}
            />
          </div>
        </div>
      </div>
    </section>
  );
}