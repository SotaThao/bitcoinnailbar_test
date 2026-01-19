import { motion } from 'motion/react';
import bitcoinLogo from 'figma:asset/2e1db8bc09ca3990d8353e1709360b43f3caa800.png';

export function BitcoinCard() {
  return (
    <motion.div 
      className="relative"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.3 }}
    >
      {/* Glow effect behind card */}
      <div 
        className="absolute inset-0 rounded-2xl blur-3xl opacity-60"
        style={{
          background: 'radial-gradient(circle, rgba(255, 152, 0, 0.6) 0%, rgba(255, 152, 0, 0.2) 50%, transparent 70%)',
        }}
      />
      
      {/* Card */}
      <motion.div 
        className="relative w-full max-w-[340px] rounded-2xl p-6 md:p-8 backdrop-blur-sm"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 30, 30, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%)',
          border: '2px solid rgba(255, 152, 0, 0.3)',
          boxShadow: '0 0 40px rgba(255, 152, 0, 0.4), inset 0 0 20px rgba(255, 152, 0, 0.1)',
          width: '340px',
          height: '214px'
        }}
        initial={{ y: 0 }}
        animate={{ 
          y: [0, -15, 0],
        }}
        whileHover={{ scale: 1.02, y: -20 }}
        transition={{
          y: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          },
          scale: {
            duration: 0.3
          }
        }}
      >
        {/* Card Header - Logo and NFC */}
        <div className="flex justify-between items-start mb-8 md:mb-12">
          <div className="flex items-center gap-2">
            <img src={bitcoinLogo} alt="Bitcoin" className="h-8 w-8 md:h-10 md:w-10" />
            <div className="text-left">
              <div className="text-white font-bold text-xs md:text-sm tracking-wider">BITCOIN NAIL BAR</div>
              <div className="text-[#FF9800] text-[10px] md:text-xs tracking-wide">THE UNDERGROUND</div>
            </div>
          </div>
          
          {/* NFC Icon */}
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="opacity-70">
            <path d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6" stroke="#FF9800" strokeWidth="2" strokeLinecap="round"/>
            <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9" stroke="#FF9800" strokeWidth="2" strokeLinecap="round"/>
            <path d="M12 12C12 12 12 12 12 12" stroke="#FF9800" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Chip */}
        <div 
          className="w-12 h-10 md:w-14 md:h-12 rounded-lg mb-6 md:mb-8"
          style={{
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
            boxShadow: '0 2px 8px rgba(255, 215, 0, 0.4)'
          }}
        />

        {/* Card Number */}
        <div className="text-white font-mono text-lg md:text-xl tracking-[0.3em] mb-6 md:mb-8">
          •••• •••• •••• ••••
        </div>

        {/* Card Footer */}
        <div className="flex justify-between items-end">
          <div>
            <div className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wider mb-1">Valid Thru</div>
            <div className="text-white text-sm md:text-base font-mono">12/30</div>
          </div>
          <div className="text-right">
            <div className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wider mb-1">Cardholder</div>
            <div className="text-white text-sm md:text-base font-medium">VIP MEMBER</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}