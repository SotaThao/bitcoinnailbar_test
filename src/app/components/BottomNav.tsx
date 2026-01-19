import { Link, useLocation } from 'react-router-dom';
import { Home, Sparkles, Calendar, Crown, Gift } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'motion/react';

export function BottomNav() {
  const location = useLocation();
  const { t } = useLanguage();

  // Hide BottomNav on booking page (mobile only)
  if (location.pathname === '/booking') {
    return null;
  }

  const navItems = [
    { 
      path: '/', 
      label: t('bottom_nav.home'),
      icon: Home 
    },
    { 
      path: '/services', 
      label: t('bottom_nav.services'),
      icon: Sparkles 
    },
    { 
      path: '/booking', 
      label: t('bottom_nav.booking'),
      icon: Calendar,
      isMain: true // Elevated center button
    },
    { 
      path: '/membership', 
      label: t('bottom_nav.membership'),
      icon: Crown 
    },
    { 
      path: '/egift', 
      label: t('bottom_nav.egift'),
      icon: Gift 
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0B0F19] border-t border-white/10 backdrop-blur-lg">
      <div className="relative">
        {/* Main Navigation Container */}
        <div className="flex items-end justify-around px-2 py-2 pb-safe">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            // Main elevated button (Book Appointment)
            if (item.isMain) {
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex flex-col items-center relative -mt-8"
                >
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className="relative"
                  >
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-[#FF9800] blur-xl opacity-40 rounded-full scale-110"></div>
                    
                    {/* Main Button */}
                    <div className={`
                      relative w-16 h-16 rounded-full flex items-center justify-center
                      ${isActive 
                        ? 'bg-gradient-to-br from-[#FFB74D] to-[#FF9800] shadow-[0_8px_32px_rgba(255,152,0,0.5)]' 
                        : 'bg-gradient-to-br from-[#FF9800] to-[#F57C00] shadow-[0_8px_24px_rgba(255,152,0,0.4)]'
                      }
                      transition-all duration-300
                    `}>
                      <Icon className="h-7 w-7 text-black" strokeWidth={2.5} />
                    </div>
                  </motion.div>
                  
                  {/* Label */}
                  <span className={`
                    text-[10px] font-bold mt-2 tracking-wide uppercase
                    ${isActive ? 'text-[#FF9800]' : 'text-gray-400'}
                    transition-colors
                  `}>
                    {item.label}
                  </span>
                </Link>
              );
            }

            // Regular nav items
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center gap-1 py-2 px-3 min-w-[64px]"
              >
                <div className={`
                  relative flex items-center justify-center w-10 h-10 rounded-xl
                  ${isActive 
                    ? 'bg-[#FF9800]/10 text-[#FF9800]' 
                    : 'text-gray-400'
                  }
                  transition-all duration-200
                `}>
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                  
                  {/* Active indicator dot */}
                  {isActive && (
                    <motion.div
                      layoutId="bottomNavIndicator"
                      className="absolute -bottom-1 w-1 h-1 bg-[#FF9800] rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </div>
                
                <span className={`
                  text-[9px] font-semibold tracking-wider uppercase
                  ${isActive ? 'text-[#FF9800]' : 'text-gray-400'}
                  transition-colors
                `}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}