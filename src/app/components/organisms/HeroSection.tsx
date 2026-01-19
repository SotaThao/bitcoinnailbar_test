import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Bitcoin, Paintbrush, Star, Hand, Lock, Heart, CreditCard, Calendar } from 'lucide-react';
import { PrimaryButton } from '../PrimaryButton';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { useLanguage } from '../../context/LanguageContext';
import { FloatingIcon } from '../molecules/FloatingIcon';
import imgImage from 'figma:asset/f84ad6d75c01f5865641dba32416e817dee06ff5.png';

export function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative bg-black text-white min-h-[85vh] md:min-h-screen flex items-start md:items-center overflow-hidden pt-28 pb-10 md:py-24 lg:py-32">
      {/* Side Navigation (Desktop) */}


      {/* Language Switcher & Booking Button */}


      {/* Gradient Blurs - Adjusted for mobile */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-[rgba(247,147,26,0.1)] rounded-full blur-[40px] md:blur-[50px]" />
      <div className="absolute left-0 bottom-0 w-[200px] h-[200px] md:w-[300px] md:h-[300px] bg-[rgba(59,130,246,0.05)] rounded-full blur-xl md:blur-2xl" />

      {/* Content Container */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
        <div className="grid md:grid-cols-2 gap-10 md:gap-12 lg:gap-20 items-center -mt-20 md:-mt-30">
          
          {/* Left Content - Text & CTA (Shows first on Mobile) */}
          <motion.div 
            className="space-y-3 md:space-y-8 text-center md:text-left order-1 md:order-1 pt-0 md:pt-0 pr-[0px] pb-[0px] pl-[0px]"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div 
              className="inline-flex items-center gap-2 md:gap-3 px-3 py-1.5 md:px-5 md:py-2.5 rounded-full backdrop-blur-md border border-[#f7931a] mx-auto md:mx-0"
              style={{
                background: 'rgba(0, 0, 0, 0.6)',
                boxShadow: '0px 0px 15px 0px rgba(247, 147, 26, 0.3)'
              }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Bitcoin className="h-3 w-3 md:h-3.5 md:w-3.5 text-[#f7931a]" />
              <span className="text-[10px] md:text-xs font-bold tracking-wider uppercase text-white">
                {t('home.badge')}
              </span>
            </motion.div>

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-1 md:space-y-2"
            >
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif leading-tight">
                <span className="text-white">{t('home.hero_unlock') || 'Unlock'} </span>
                <span className="text-[#d4af37]">{t('home.hero_vip_status') || 'VIP Status'}</span>
              </h1>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif leading-tight text-[#f7931a]">
                {t('home.hero_get_rewards') || 'Get Rewards'}
              </h2>
            </motion.div>

            {/* Description */}
            <motion.p 
              className="text-xs sm:text-sm md:text-lg lg:text-xl text-gray-300 leading-relaxed max-w-md md:max-w-xl font-semibold mx-auto md:mx-0 px-2 md:px-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {t('home.hero_desc_new_1') || 'Elevate your beauty experience with our'} <span className="text-white font-bold">{t('home.hero_membership_program') || 'Membership Program'}</span>. {t('home.hero_enjoy_up_to') || 'Enjoy up to'} <span className="text-[#f7931a] font-bold">{t('home.hero_cashback_20') || '20% Cashback'}</span>, {t('home.hero_priority_access') || 'priority booking, and exclusive access.'}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-2 md:gap-5 justify-center md:justify-start pt-1 px-4 md:px-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Link to="/#membership" className="w-full sm:w-auto">
                <motion.button
                  className="w-full sm:w-auto px-6 py-2.5 md:px-10 md:py-4 rounded-full font-bold text-xs md:text-lg text-black border-2 border-[#f7931a] uppercase"
                  style={{
                    backgroundImage: 'linear-gradient(46.3281deg, rgb(247, 147, 26) 0%, rgb(255, 171, 46) 100%)',
                    boxShadow: '0px 0px 20px 0px rgba(247, 147, 26, 0.4)'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t('home.cta_view_packages') || 'VIEW PACKAGES'}
                </motion.button>
              </Link>
              <Link to="/promotions" className="w-full sm:w-auto">
                <motion.button
                  className="relative w-full sm:w-auto px-6 py-2.5 md:px-10 md:py-4 rounded-full font-bold text-xs md:text-lg text-white border-2 border-white backdrop-blur-sm flex items-center gap-2 justify-center uppercase overflow-hidden group"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="absolute inset-0 bg-white transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out"></span>
                  <span className="relative z-10 group-hover:text-black transition-colors duration-300">
                    {t('nav.promotions') || 'PROMOTIONS'}
                  </span>
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Content - Card Section (Shows second on Mobile) */}
          <motion.div 
            className="relative flex items-center justify-center h-[280px] sm:h-[350px] md:h-[600px] order-2 md:order-2 -mt-3 md:mt-0"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Central Gradient Blur - Adjusted size for mobile */}
            <div 
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-64 md:h-64 rounded-full opacity-20 blur-2xl"
              style={{
                backgroundImage: 'linear-gradient(45deg, rgb(247, 147, 26) 0%, rgb(253, 224, 71) 100%)'
              }}
            />

            {/* Floating Icons */}
            <div className="block">
              {/* Gold Bitcoin - Top Right */}
              <FloatingIcon 
                delay={0} 
                duration={3.5} 
                yOffset={20}
                className="absolute -top-6 -right-4 scale-50 sm:scale-75 lg:scale-100 lg:-top-12 lg:-right-12"
                glowColor="rgba(212, 175, 55, 0.6)"
              >
                <motion.div 
                  className="w-16 h-16 rounded-full backdrop-blur-md flex items-center justify-center border-2 border-[#d4af37]"
                  style={{
                    background: 'rgba(0, 0, 0, 0.6)',
                    boxShadow: '0px 0px 30px 0px rgba(212, 175, 55, 0.6), inset 0px 0px 20px 2px rgba(212, 175, 55, 0.2)'
                  }}
                  animate={{ rotate: [12, 12] }}
                >
                  <Bitcoin className="w-9 h-9 text-[#d4af37]" />
                </motion.div>
              </FloatingIcon>

              {/* Orange % - Bottom Left */}
              <FloatingIcon 
                delay={1} 
                duration={3.8} 
                yOffset={18}
                className="absolute bottom-4 -left-4 scale-50 sm:scale-75 lg:scale-100 lg:bottom-9 lg:-left-12"
                glowColor="rgba(247, 147, 26, 0.6)"
              >
                <motion.div 
                  className="w-14 h-14 rounded-full backdrop-blur-md flex items-center justify-center border-2 border-[#f7931a]"
                  style={{
                    background: 'rgba(0, 0, 0, 0.6)',
                    boxShadow: '0px 0px 30px 0px rgba(247, 147, 26, 0.6), inset 0px 0px 20px 2px rgba(247, 147, 26, 0.2)'
                  }}
                  animate={{ rotate: [348, 348] }}
                >
                  <span className="text-2xl font-black text-[#f7931a]">%</span>
                </motion.div>
              </FloatingIcon>

              {/* Pink Hand - Right Side */}
              <FloatingIcon 
                delay={1.5} 
                duration={4} 
                yOffset={22}
                className="absolute top-[20%] -right-6 scale-50 sm:scale-75 lg:scale-100 lg:top-[25%] lg:-right-20"
                glowColor="rgba(236, 72, 153, 0.8)"
              >
                <motion.div 
                  className="w-16 h-16 rounded-2xl backdrop-blur-md flex items-center justify-center border-2 border-[#ec4899]"
                  style={{
                    background: 'rgba(0, 0, 0, 0.6)',
                    boxShadow: '0px 0px 30px 0px rgba(236, 72, 153, 0.8), inset 0px 0px 20px 2px rgba(236, 72, 153, 0.2)'
                  }}
                  animate={{ rotate: [6, 6] }}
                >
                  <Hand className="w-7 h-7 text-[#f472b6]" />
                </motion.div>
              </FloatingIcon>

              {/* Purple Lock - Right Lower */}
              <FloatingIcon 
                delay={2} 
                duration={3.6} 
                yOffset={16}
                className="absolute bottom-[30%] -right-4 scale-50 sm:scale-75 lg:scale-100 lg:bottom-[35%] lg:-right-14"
                glowColor="rgba(168, 85, 247, 0.8)"
              >
                <motion.div 
                  className="w-12 h-12 rounded-xl backdrop-blur-md flex items-center justify-center border-2 border-[#a855f7]"
                  style={{
                    background: 'rgba(0, 0, 0, 0.6)',
                    boxShadow: '0px 0px 30px 0px rgba(168, 85, 247, 0.8), inset 0px 0px 20px 2px rgba(168, 85, 247, 0.2)'
                  }}
                  animate={{ rotate: [348, 348] }}
                >
                  <Lock className="w-6 h-6 text-[#c084fc]" />
                </motion.div>
              </FloatingIcon>

              {/* Teal Paint - Top Left */}
              <FloatingIcon 
                delay={0.8} 
                duration={3.3} 
                yOffset={20}
                className="absolute -top-2 -left-2 scale-50 sm:scale-75 lg:scale-100 lg:-top-3 lg:-left-3"
                glowColor="rgba(45, 212, 191, 0.8)"
              >
                <motion.div 
                  className="w-14 h-14 rounded-full backdrop-blur-md flex items-center justify-center border-2 border-[#2dd4bf]"
                  style={{
                    background: 'rgba(0, 0, 0, 0.6)',
                    boxShadow: '0px 0px 30px 0px rgba(45, 212, 191, 0.8), inset 0px 0px 20px 2px rgba(45, 212, 191, 0.2)'
                  }}
                  animate={{ rotate: [45, 45] }}
                >
                  <Paintbrush className="w-6 h-6 text-[#2dd4bf]" />
                </motion.div>
              </FloatingIcon>

              {/* Large Orange Bitcoin - Middle Left */}
              <FloatingIcon 
                delay={1.2} 
                duration={4.2} 
                yOffset={24}
                className="absolute top-1/2 -left-8 -translate-y-1/2 scale-50 sm:scale-75 lg:scale-100 lg:-left-16"
                glowColor="rgba(247, 147, 26, 0.6)"
              >
                <motion.div 
                  className="w-20 h-20 rounded-full backdrop-blur-md flex items-center justify-center border-2 border-[#f7931a]"
                  style={{
                    background: 'rgba(0, 0, 0, 0.6)',
                    boxShadow: '0px 0px 30px 0px rgba(247, 147, 26, 0.6), inset 0px 0px 20px 2px rgba(247, 147, 26, 0.2)'
                  }}
                  animate={{ rotate: [348, 348] }}
                >
                  <Bitcoin className="w-9 h-9 text-[#f7931a]" />
                </motion.div>
              </FloatingIcon>

              {/* Green Heart - Bottom Right */}
              <FloatingIcon 
                delay={0.5} 
                duration={3.7} 
                yOffset={18}
                className="absolute bottom-[20%] right-10 scale-50 sm:scale-75 lg:scale-100 lg:bottom-[25%] lg:right-20"
                glowColor="rgba(74, 222, 128, 0.8)"
              >
                <motion.div 
                  className="w-14 h-14 rounded-lg backdrop-blur-md flex items-center justify-center border-2 border-[#4ade80]"
                  style={{
                    background: 'rgba(0, 0, 0, 0.6)',
                    boxShadow: '0px 0px 30px 0px rgba(74, 222, 128, 0.8), inset 0px 0px 20px 2px rgba(74, 222, 128, 0.2)'
                  }}
                  animate={{ rotate: [12, 12] }}
                >
                  <Heart className="w-6 h-6 text-[#4ade80] fill-[#4ade80]" />
                </motion.div>
              </FloatingIcon>

              {/* Blue Star - Top Center */}
              <FloatingIcon 
                delay={1.8} 
                duration={3.9} 
                yOffset={17}
                className="absolute top-4 left-4 scale-50 sm:scale-75 lg:scale-100 lg:top-10 lg:left-20"
                glowColor="rgba(96, 165, 250, 0.8)"
              >
                <motion.div 
                  className="w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center border-2 border-[#60a5fa]"
                  style={{
                    background: 'rgba(0, 0, 0, 0.6)',
                    boxShadow: '0px 0px 30px 0px rgba(96, 165, 250, 0.8), inset 0px 0px 20px 2px rgba(96, 165, 250, 0.2)'
                  }}
                  animate={{ rotate: [354, 354] }}
                >
                  <Star className="w-5 h-5 text-[#60a5fa] fill-[#60a5fa]" />
                </motion.div>
              </FloatingIcon>
            </div>

            {/* Gold Card (Background) - Rotated */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:top-[20%] md:left-[48%] md:translate-y-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  y: [0, -10, 0]
                }}
                transition={{
                  opacity: { duration: 0.8, delay: 0.2 },
                  scale: { duration: 0.8, delay: 0.2 },
                  y: {
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.6
                  }
                }}
              >
                <motion.div
                  className="w-[60vw] max-w-[220px] md:w-[75vw] md:max-w-[360px]"
                  style={{
                    height: 'auto',
                    aspectRatio: '358/234',
                    rotate: -6
                  }}
                >
                  {/* Background Container */}
                  <div 
                    className="relative rounded-xl border border-[rgba(234,179,8,0.5)] overflow-hidden"
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundImage: 'linear-gradient(149.871deg, rgb(17, 18, 23) 0%, rgb(0, 0, 0) 100%)',
                      boxShadow: '0px 25px 50px -12px rgba(0,0,0,0.25)'
                    }}
                  >
                    {/* Pattern */}
                    <div 
                      className="absolute inset-[0.9px] opacity-30"
                      style={{
                        backgroundImage: `url('${imgImage}')`,
                        backgroundSize: '24px 22px',
                        backgroundRepeat: 'repeat',
                        backgroundPosition: 'top left'
                      }}
                    />

                    {/* Content */}
                    <div className="relative flex flex-col justify-between p-[6%] h-full">
                       {/* Top Row */}
                       <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                             {/* Icon Circle */}
                             <div className="w-[12%] aspect-square rounded-full border border-[#eab308] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] flex items-center justify-center">
                                <span className="text-[#eab308] text-[2.5cqw] md:text-sm">₿</span>
                             </div>
                             {/* Text */}
                             <div className="flex flex-col">
                                <span className="text-[#eab308] font-serif font-bold text-[2.5cqw] md:text-[9px] tracking-[0.225px] leading-tight">GOLD</span>
                                <span className="text-[#9ca3af] font-sans font-bold text-[1.25cqw] md:text-[4.5px] tracking-[0.9px] leading-tight">{t('nav.membership') || 'MEMBERSHIP'}</span>
                             </div>
                          </div>
                          {/* Wifi */}
                          <div className="text-[#6b7280]">
                            <svg viewBox="0 0 24 24" fill="none" className="w-[5cqw] h-[5cqw] md:w-6 md:h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                              <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                              <path d="M12 20h.01" />
                            </svg>
                          </div>
                       </div>

                       {/* Number */}
                       <div className="text-[#9ca3af] font-mono text-[2.5cqw] md:text-[9px] tracking-[1.35px]">
                          **** **** **** 8888
                       </div>

                       {/* Footer */}
                       <div className="flex justify-between items-end">
                          <div>
                             <div className="text-[#6b7280] font-sans text-[1cqw] md:text-[3.6px] tracking-[0.36px] uppercase">{t('home.card_valid_thru') || 'VALID THRU'}</div>
                             <div className="text-[#9ca3af] font-mono font-bold text-[2cqw] md:text-[7.2px]">12/25</div>
                          </div>
                          <div className="backdrop-blur-sm bg-[rgba(234,179,8,0.2)] border border-[rgba(234,179,8,0.3)] rounded-[4px] px-[3%] py-[2%]">
                             <div className="text-[#eab308] font-sans font-bold text-[2.5cqw] md:text-[9px] uppercase">{t('home.card_10_off') || '10% OFF'}</div>
                          </div>
                       </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* Main Black Card - Center (No Rotation) */}
            <motion.div 
              className="relative z-10"
              initial={{ opacity: 0, scale: 0.9, y: 0 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                y: [0, -12, 0]
              }}
              transition={{
                opacity: { duration: 0.8, delay: 0.3 },
                scale: { duration: 0.8, delay: 0.3 },
                y: {
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.8
                }
              }}
            >
              <div 
                className="relative rounded-[12px] p-[6%] border border-[rgba(247,147,26,0.5)] overflow-hidden"
                style={{
                  width: '75vw',
                  maxWidth: '360px',
                  height: 'auto',
                  aspectRatio: '398/260',
                  backgroundImage: 'linear-gradient(149.871deg, rgb(10, 10, 10) 0%, rgb(26, 26, 26) 100%)',
                  boxShadow: '0px 0px 50px 0px rgba(247, 147, 26, 0.3)'
                }}
              >
                {/* Background Pattern */}
                <div 
                   className="absolute inset-[0.9px] opacity-40" 
                   style={{ 
                      backgroundImage: `url('${imgImage}')`, 
                      backgroundSize: '24px 22px', 
                      backgroundRepeat: 'repeat',
                      backgroundPosition: 'top left'
                   }} 
                />
                
                {/* Content Container */}
                <div className="relative flex flex-col justify-between h-full">
                   {/* Header */}
                   <div className="flex justify-between items-start">
                      <div className="flex items-center gap-[3%]">
                         {/* Logo Icon */}
                         <div className="w-[12%] aspect-square rounded-full backdrop-blur-[2px] bg-black/80 flex items-center justify-center border border-[#f7931a] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)]">
                            <Bitcoin className="w-[60%] h-[60%] text-[#f7931a]" />
                         </div>
                         {/* Text */}
                         <div className="flex flex-col">
                            <div className="text-[2.5cqw] md:text-[10px] font-bold font-serif tracking-[0.25px] bg-gradient-to-b from-[#fef9c3] via-[#fde047] to-[#ca8a04] text-transparent bg-clip-text leading-tight whitespace-nowrap">
                               BITCOIN NAIL BAR
                            </div>
                            <div className="text-[1.25cqw] md:text-[5px] font-bold font-sans tracking-[1px] text-white/80 leading-tight">
                               {t('home.card_vip_membership') || 'VIP MEMBERSHIP'}
                            </div>
                         </div>
                      </div>
                      {/* Wifi Icon */}
                      <div className="opacity-80 text-[#9ca3af]">
                          <svg viewBox="0 0 24 24" fill="none" className="w-[6cqw] h-[6cqw] md:w-6 md:h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                              <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                              <path d="M12 20h.01" />
                          </svg>
                      </div>
                   </div>

                   {/* Chip */}
                   <div className="relative w-[12%] aspect-[48/36] rounded-[6px] border border-[rgba(253,224,71,0.5)]"
                        style={{ backgroundImage: 'linear-gradient(143.13deg, rgb(254, 240, 138) 0%, rgb(250, 204, 21) 50%, rgb(202, 138, 4) 100%)' }}>
                       <div className="absolute inset-0 shadow-[inset_0px_2px_4px_1px_rgba(0,0,0,0.05)] rounded-[6px]" />
                       <div className="absolute inset-0 flex items-center justify-center p-[1px]">
                           <div className="w-[40%] h-[45%] border border-[rgba(0,0,0,0.2)] rounded-[2px]" />
                       </div>
                   </div>

                   {/* Bottom Section */}
                   <div className="space-y-[4%]">
                      {/* Number */}
                      <div className="font-mono text-white text-[2.5cqw] md:text-[10px] tracking-[1.5px] whitespace-nowrap">
                         8888 8888 8888 8888
                      </div>

                      {/* Footer Row */}
                      <div className="flex justify-between items-end">
                         <div>
                            <div className="text-[#d1d5db] text-[1cqw] md:text-[4px] uppercase tracking-[0.4px]">{t('home.card_valid_thru') || 'VALID THRU'}</div>
                            <div className="text-white text-[2cqw] md:text-[8px] font-mono font-bold">12/30</div>
                         </div>
                         <div className="flex flex-col items-end gap-[4px]">
                            <div className="text-[#e5e7eb] text-[1.5cqw] md:text-[6px] font-serif italic uppercase tracking-[0.6px]">{t('home.card_cashback') || 'CASHBACK'}</div>
                            <div className="backdrop-blur-sm bg-[rgba(0,0,0,0.4)] border border-[rgba(247,147,26,0.3)] rounded-[4px] px-[9px] py-[6px]">
                               <span className="text-[#f7931a] font-mono font-bold text-[2.5cqw] md:text-[10px]">20%</span>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>

            {/* Design Your Card Button */}
            <motion.div
              className="absolute bottom-6 md:bottom-12 left-1/2 -translate-x-1/2 z-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Link to="/booking">
                <motion.button
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById('egift-section');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="relative top-10 md:-top-10 inline-flex items-center justify-center gap-2 px-5 py-2.5 md:px-8 md:py-3.5 rounded-full backdrop-blur-md border border-[rgba(247,147,26,0.6)] text-[#f7931a] font-bold text-xs md:text-sm whitespace-nowrap min-w-max uppercase"
                  style={{
                    background: 'rgba(0, 0, 0, 0.6)',
                    boxShadow: '0px 0px 25px 0px rgba(247, 147, 26, 0.3)'
                  }}
                  whileHover={{ scale: 1.05, boxShadow: '0 0 35px rgba(247, 147, 26, 0.5)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  {t('home.cta_design_card') || 'DESIGN YOUR CARD'}
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}