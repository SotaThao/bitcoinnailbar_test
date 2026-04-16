/**
 * Centralized image assets configuration
 * 
 * Replaces figma:asset/ imports with actual production-ready URLs.
 * Assets are stored in /public/assets/ as PNG files.
 * TODO: Replace with actual PNG images or Cloudinary URLs.
 */

export const ASSETS = {
  // VIP Card pattern (was: figma:asset/f84ad6d75c01f5865641dba32416e817dee06ff5.png)
  vipCardPattern: '/assets/vip-card-pattern.png',
  
  // Bitcoin logo (was: figma:asset/2e1db8bc09ca3990d8353e1709360b43f3caa800.png)
  bitcoinLogo: '/assets/bitcoinnailbar_logo.webp',
  
  // Bitcoin icon orange (was: figma:asset/8504cf526757125a74c4095fde998e4033127268.png)
  bitcoinIconOrange: '/assets/bitcoinnailbar_logo.webp',
  
  // Gift card QR code (was: figma:asset/67a09cd28fc49fe9fb982254a0abba67cf925b41.png)
  giftCardQR: '/assets/gift-card-qr.png',
  
  // Hygiene - Luxury Treatments (was: figma:asset/9b76d043322193ecba98cb79a9c58c5abe8efbf0.png)
  hygieneLuxuryTreatments: '/assets/signature-treatments.png',
  
  // Hygiene - Standards (was: figma:asset/36d0ff035d3f60c47a5c81a3484dd16ff2e9a5e6.png)
  hygieneStandards: '/assets/hygiene-nail-bar.jpg',
  
  // Public layout images
  layoutHeroBg: '/assets/layout-hero-bg.png',
  layoutFeature1: '/assets/layout-feature-1.png',
  layoutFeature2: '/assets/layout-feature-2.png',
  layoutFeature3: '/assets/layout-feature-3.png',
  layoutFeature4: '/assets/layout-feature-4.png',
  
  // Services section images (currently hidden but keeping for future use)
  serviceManicure: '/assets/service-manicure.png',
  servicePedicure: '/assets/service-pedicure.png',
  serviceCombo: '/assets/service-combo.png',
  serviceSpecial: '/assets/service-special.png',
  serviceSpa: '/assets/service-spa.png',
  servicePremiumSpa: '/assets/service-premium-spa.png',
  
  // Shop logo (was: figma:asset/a0a142070a5eba3845c46a9b2c9f3045cc1462ff.png) - UNUSED
  shopLogo: '/assets/shop-logo.png',
} as const;

export type AssetKey = keyof typeof ASSETS;

export function getAsset(key: AssetKey): string {
  return ASSETS[key];
}
