import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import bitcoinLogo from 'figma:asset/2e1db8bc09ca3990d8353e1709360b43f3caa800.png';
import shopLogo from 'figma:asset/a0a142070a5eba3845c46a9b2c9f3045cc1462ff.png';
import bnbLogo from 'figma:asset/8504cf526757125a74c4095fde998e4033127268.png';
import imgQr from 'figma:asset/67a09cd28fc49fe9fb982254a0abba67cf925b41.png';

export interface CardColor {
  id: string;
  name: string;
  gradient: string;
  borderColor: string;
  isLight?: boolean; // For contrast ratio optimization
}

export const cardColors: CardColor[] = [
  { id: 'bitcoin-black', name: 'Bitcoin Black', gradient: 'from-[#1F2937] to-[#000000]', borderColor: '#F7931A', isLight: false },
  { id: 'platinum', name: 'Platinum', gradient: 'from-[#FFFFFF] to-[#D1D5DB]', borderColor: '#9CA3AF', isLight: true },
  { id: 'rose-gold', name: 'Rose Gold', gradient: 'from-[#F472B6] to-[#E11D48]', borderColor: '#F9A8D4', isLight: false },
  { id: 'sapphire', name: 'Sapphire', gradient: 'from-[#2563EB] to-[#312E81]', borderColor: '#60A5FA', isLight: false },
  { id: 'emerald', name: 'Emerald', gradient: 'from-[#22C55E] to-[#064E3B]', borderColor: '#4ADE80', isLight: false },
  { id: 'bronze', name: 'Bronze', gradient: 'from-[#000000] to-[#000000]', borderColor: '#D4AF37', isLight: false },
  { id: 'titanium', name: 'Titanium', gradient: 'from-[#000000] to-[#000000]', borderColor: '#E5E4E2', isLight: false },
  { id: 'obsidian', name: 'Obsidian', gradient: 'from-[#111827] to-[#111827]', borderColor: '#4B5563', isLight: false },
  { id: 'gold', name: '24K Gold', gradient: 'from-[#F9E6AA] via-[#D4AF37] to-[#996515]', borderColor: '#FEF08A', isLight: true },
  { id: 'bitcoin-orange', name: 'Bitcoin Orange', gradient: 'from-[#F97316] to-[#C2410C]', borderColor: '#FDBA74', isLight: true },
];

interface EGiftCardPreviewProps {
  isFlipped: boolean;
  setIsFlipped: (value: boolean) => void;
  selectedColor: CardColor;
  setSelectedColor: (color: CardColor) => void;
  recipientName: string;
  amount: number | string;
}

export function EGiftCardPreview({
  isFlipped,
  setIsFlipped,
  selectedColor,
  setSelectedColor,
  recipientName,
  amount,
}: EGiftCardPreviewProps) {
  // Dynamic text colors for contrast ratio 4.5:1
  const textPrimary = selectedColor.isLight ? 'text-gray-900' : 'text-white';
  const textSecondary = selectedColor.isLight ? 'text-gray-700' : 'text-white/80';
  const textTertiary = selectedColor.isLight ? 'text-gray-600' : 'text-white/60';
  const textMuted = selectedColor.isLight ? 'text-gray-500' : 'text-white/40';
  const accentColor = selectedColor.isLight ? 'text-[#D97706]' : 'text-[#FFD700]'; // Amber for light, Gold for dark
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="space-y-8 h-full flex flex-col justify-center"
    >
      {/* Flip Card Container - Scaled to 70% width */}
      <div 
        className="relative w-[70%] mx-auto aspect-[1.723/1] cursor-pointer perspective-1000 @container"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          className="relative w-full h-full"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
        >
          {/* Front of Card */}
          <div 
            className="absolute inset-0 backface-hidden rounded-[4.5%] overflow-hidden shadow-2xl"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className={`w-full h-full bg-gradient-to-tl ${selectedColor.gradient} p-[5.5%] relative flex flex-col justify-between select-none shadow-inner group overflow-hidden font-mono`}>
              {/* Dot Pattern Overlay */}
              <div 
                className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay" 
                style={{ 
                  backgroundImage: 'radial-gradient(circle, #000 1.5px, transparent 1.5px)', 
                  backgroundSize: '12px 12px' 
                }} 
              />
              
              {/* Hover Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-10 left-[-100%] group-hover:left-[200%] transition-all duration-1000 ease-in-out pointer-events-none" />
              
              {/* Card Border */}
              <div className="absolute inset-0 border-[1px] border-white/20 rounded-[4.5%] pointer-events-none z-10" />
              
              {/* Top Row: Brand & Logo */}
              <div className="flex justify-between items-center relative z-10 h-[22%]">
                 <div className="flex items-center gap-[4%] h-full">
                    {/* Logo Container */}
                    <div className="w-[8cqw] h-[8cqw] rounded-full border-[0.15cqw] border-[#F7931A] bg-[#1a1a1a] flex items-center justify-center p-[3px] shadow-lg shrink-0 overflow-hidden">
                       <img src={bnbLogo} alt="Bitcoin Nail Bar Logo" className="w-full h-full object-contain" />
                    </div>
                    {/* Brand Text */}
                    <div className="flex flex-col justify-center h-full pt-[1%]">
                      <span className={`${textPrimary} text-[4.5cqw] font-serif font-bold tracking-[0.02em] leading-none mb-[3%] drop-shadow-md whitespace-nowrap`}>
                        BITCOIN NAIL BAR
                      </span>
                      <span className={`${textSecondary} text-[2cqw] tracking-[0.2em] font-medium uppercase leading-none pl-[2px]`}>
                        LUXURY GIFT CARD
                      </span>
                    </div>
                 </div>
                 
                 {/* Contactless Symbol */}
                 <div className={`h-[50%] aspect-square ${textMuted} flex items-center justify-center mr-[2%]`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full rotate-90 drop-shadow-sm">
                      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                    </svg>
                 </div>
              </div>

              {/* Middle Row: Chip & Balance */}
              <div className="flex justify-between items-center relative z-10 pl-[1%] pr-[1%] mt-[2%]">
                {/* EMV Chip */}
                <div className="w-[13%] aspect-[1.33/1] rounded-[15%] bg-gradient-to-br from-[#FEF08A] via-[#FACC15] to-[#CA8A04] relative overflow-hidden border border-[#CA8A04]/50 shadow-md group-hover:brightness-110 transition-all duration-300">
                  <div className="absolute inset-[15%] border border-black/10 rounded-[10%]" />
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-black/10" />
                  <div className="absolute left-1/3 top-0 bottom-0 w-px bg-black/10" />
                  <div className="absolute right-1/3 top-0 bottom-0 w-px bg-black/10" />
                </div>
                
                {/* Balance */}
                <div className="flex flex-col items-end mr-[1%]">
                  <span className={`${textMuted} text-[1.8cqw] font-bold tracking-[0.15em] uppercase leading-none mb-[1%]`}>
                    Balance
                  </span>
                  <div className={`flex items-start leading-none ${textPrimary} font-bold drop-shadow-md`}>
                    <span className="text-[3.5cqw] mr-[2px] mt-[4%] opacity-90">$</span>
                    <span className="text-[20px] tracking-tight">{amount}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Section: Number & Details */}
              <div className="flex flex-col justify-end relative z-10 flex-1 pb-[1%]">
                 {/* Card Number */}
                 <div className={`${textPrimary} text-[5.5cqw] font-mono tracking-[0.14em] drop-shadow-md text-left w-full pl-[1%] mb-[3%]`}>
                    4589 1234 5678 9010
                 </div>

                 {/* Bottom Row */}
                 <div className="flex justify-between items-end pl-[1%]">
                    <div className="flex flex-col items-start gap-[0.5cqw]">
                       <div className="flex items-center gap-[2cqw]">
                           {/* Valid Thru */}
                           <div className={`flex flex-col ${textTertiary} text-[1.2cqw] leading-tight uppercase tracking-[0.1em] font-bold`}>
                              <span>VALID</span>
                              <span>THRU</span>
                           </div>
                           <div className={`${textPrimary} text-[3.2cqw] font-mono font-medium tracking-widest drop-shadow-sm`}>
                              12/30
                           </div>
                       </div>
                       {/* Recipient Name */}
                       <div className={`${textPrimary} text-[3.2cqw] font-medium tracking-[0.05em] uppercase whitespace-nowrap drop-shadow-sm`}>
                          {recipientName || 'RECIPIENT NAME'}
                       </div>
                    </div>

                    <div className={`${textMuted} italic font-serif text-[3.5cqw] tracking-[0.05em] font-bold`}>
                       E-GIFT
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Back of Card */}
          <div 
            className="absolute inset-0 backface-hidden rounded-[4.5%] overflow-hidden shadow-2xl bg-[#0a0b10]"
            style={{ 
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            <div className="w-full h-full relative flex flex-col p-[4%]">
               {/* Magnetic Stripe */}
               <div className="absolute top-[6%] left-0 right-0 h-[16%] bg-[#1a1a1a]">
                  <div className="w-full h-full opacity-30" style={{ backgroundImage: "linear-gradient(90deg, #000 0%, #222 50%, #000 100%)" }} />
               </div>

               {/* Signature & CVC */}
               <div className="mt-[25%] flex items-center gap-[3%] px-[4%]">
                  <div className="flex-1 h-[32px] bg-white relative flex items-center px-2">
                     <span className="relative z-10 font-serif italic text-gray-400 text-[2.5cqw]">Authorized Signature</span>
                  </div>
                  <div className="w-[12%] h-[32px] bg-white flex items-center justify-center border border-gray-300">
                     <span className="font-mono font-bold italic text-black text-[3cqw]">982</span>
                  </div>
               </div>

               {/* Disclaimer */}
               <div className="mt-[4%] px-[4%] text-[#6b7280] text-[1.8cqw] leading-tight text-justify">
                  This card is issued by Bitcoin Nail Bar. Redeemable for services & products only. Treat this card like cash. Lost or stolen cards may not be replaced.
               </div>

               {/* Footer: Contact & QR */}
               <div className="mt-auto flex items-end justify-between px-[4%] pb-[2%] border-t border-[#1f2937] pt-[2%]">
                  <div className="space-y-[2%]">
                     <div className="flex items-center gap-2 text-[2cqw]">
                        <span className="text-[#f7931a] w-3">📞</span>
                        <span className="text-white font-bold">832-799-2748</span>
                     </div>
                     <div className="flex items-center gap-2 text-[2cqw]">
                        <span className="text-[#f7931a] w-3">📍</span>
                        <span className="text-[#9ca3af]">9793 Westheimer Rd, Houston</span>
                     </div>
                     <div className="flex items-center gap-2 text-[2cqw]">
                        <span className="text-[#f7931a] w-3">🌐</span>
                        <span className="text-[#9ca3af]">bitcoinnailbar.com</span>
                     </div>
                  </div>
                  
                  <div className="bg-white p-[1%] rounded shadow-sm w-[15%] aspect-square flex items-center justify-center">
                     <img src={imgQr} alt="QR" className="w-full h-full object-contain" />
                  </div>
               </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Flip Indicator */}
      <div className="text-center">
        <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
          <span className="inline-block w-2 h-2 bg-[#FF9800] rounded-full animate-pulse" />
          Click card to flip and see details
        </p>
      </div>

      {/* Color Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold tracking-widest text-gray-400 uppercase">
            Select Card Design
          </label>
          <span className="text-xs text-[#FF9800]">
            {selectedColor.name}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {cardColors.map((color) => (
            <button
              key={color.id}
              onClick={() => setSelectedColor(color)}
              className={`relative w-12 h-12 rounded-full bg-gradient-to-br ${color.gradient} transition-all ${
                selectedColor.id === color.id 
                  ? 'ring-2 ring-offset-2 ring-offset-[#1A1F2E] ring-white scale-110' 
                  : 'hover:scale-105'
              }`}
            >
              {selectedColor.id === color.id && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Check className="w-6 h-6 text-white drop-shadow-lg" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
