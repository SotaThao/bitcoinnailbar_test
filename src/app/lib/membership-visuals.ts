import { Star, Crown, Gem, Bitcoin } from 'lucide-react';

export interface TierVisual {
  icon: any;
  borderColor: string;
  bgGradient: string;
  buttonStyle: string;
  glowColor: string;
  hexColor: string;
  popular: boolean;
}

export const TIER_VISUALS: Record<string, TierVisual> = {
  'silver': {
    icon: Star,
    borderColor: 'border-gray-500',
    bgGradient: 'from-gray-900 to-black',
    buttonStyle: 'border border-gray-500 text-gray-300 hover:bg-gray-800',
    glowColor: 'rgba(156, 163, 175, 0.5)',
    hexColor: '#d1d5db',
    popular: false
  },
  'gold': {
    icon: Crown,
    borderColor: 'border-[#eab308]',
    bgGradient: 'from-gray-900 to-black',
    buttonStyle: 'bg-gradient-to-r from-[#f7931a] to-[#ffab2e] text-black font-bold border-none hover:shadow-[0_0_20px_rgba(247,147,26,0.5)]',
    glowColor: 'rgba(234, 179, 8, 0.5)',
    hexColor: '#eab308',
    popular: false
  },
  'platinum': {
    icon: Gem,
    borderColor: 'border-white',
    bgGradient: 'from-gray-900 to-black',
    buttonStyle: 'bg-white text-black font-bold border-none hover:shadow-[0_0_20px_rgba(255,255,255,0.5)]',
    glowColor: 'rgba(255, 255, 255, 0.5)',
    hexColor: '#ffffff',
    popular: true
  },
  'vip-crypto': {
    icon: Bitcoin,
    borderColor: 'border-[#f7931a]',
    bgGradient: 'from-gray-900 to-black',
    buttonStyle: 'border border-[#f7931a] text-[#f7931a] hover:bg-[#f7931a]/10',
    glowColor: 'rgba(247, 147, 26, 0.5)',
    hexColor: '#f7931a',
    popular: false
  }
};