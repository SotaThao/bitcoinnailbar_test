import PublicLayout from '../PublicLayout';
import { SEOHead } from '../shared/SEOHead';
import { HeroSection } from '../organisms/HeroSection';
import { FeaturesSection } from '../organisms/FeaturesSection';
import { BitcoinSection } from '../organisms/BitcoinSection';
import { EGiftCardSection } from '../sections/EGiftCardSection';
import { HygieneSection } from '../organisms/HygieneSection';
import { ServicesSection } from '../organisms/ServicesSection';
import { PromotionsSection } from '../organisms/PromotionsSection';
import { MembershipSection } from '../organisms/MembershipSection';
import { CareerSection } from '../organisms/CareerSection';
import { GallerySection } from '../organisms/GallerySection';
import { CtaSection } from '../organisms/CtaSection';
import { MapSection } from '../organisms/MapSection';
import { ServiceMenu } from './ServiceMenu';

/**
 * HomePage Component
 * 
 * Main landing page for Bitcoin Nail Bar website.
 * Follows Atomic Design pattern with organism-level sections.
 * Each section is wrapped with ID for anchor navigation.
 * 
 * @returns {JSX.Element} Complete homepage with all sections
 */
export default function HomePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NailSalon",
    "name": "Bitcoin Nail Bar",
    "image": "https://images.unsplash.com/photo-1632345031435-8727f68979a6?auto=format&fit=crop&q=80",
    "description": "Luxury nail salon in Houston accepting Bitcoin. Experience premium manicures, pedicures, and spa services.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "9793 Westheimer Rd A",
      "addressLocality": "Houston",
      "addressRegion": "TX",
      "postalCode": "77042",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 29.735324,
      "longitude": -95.540653
    },
    "url": "https://bitcoinnailbar.com",
    "telephone": "+13468024906",
    "priceRange": "$$",
    "paymentAccepted": ["Cash", "Credit Card", "Bitcoin", "Cryptocurrency"],
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "20:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "09:00",
        "closes": "19:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Sunday",
        "opens": "10:00",
        "closes": "18:00"
      }
    ]
  };

  return (
    <PublicLayout>
      <SEOHead
        title="Luxury Nail Salon in Houston | Accept Bitcoin"
        description="Welcome to Bitcoin Nail Bar, Houston's premier luxury nail salon accepting Bitcoin. Experience top-tier manicures, pedicures, and spa services in a modern atmosphere."
        keywords="nail salon houston, bitcoin nail bar, crypto friendly business, luxury nails houston, pedicure houston, manicure houston"
        canonicalUrl="https://bitcoinnailbar.com/"
        structuredData={structuredData}
      />
      {/* Hero with Bitcoin card design */}
      <HeroSection />
      
      {/* Why choose us features */}
      <FeaturesSection />
      
      {/* Bitcoin payment acceptance */}
      <BitcoinSection />
      
      {/* Navigable sections with IDs */}
      <div id="promotions">
        <PromotionsSection />
      </div>
      
      <div id="egift">
        <EGiftCardSection />
      </div>
      
      <div id="membership">
        <MembershipSection />
      </div>
      
      {/* Hygiene & Safety */}
      <HygieneSection />
      
      {/* Services overview */}
      <ServicesSection />
      
      {/* Detailed service menu */}
      <div id="services">
        <ServiceMenu />
      </div>
      
      {/* Career opportunities */}
      <div id="careers">
        <CareerSection />
      </div>
      
      {/* Photo gallery */}
      <div id="gallery">
        <GallerySection />
      </div>
      
      {/* Call-to-action */}
      <CtaSection />
      
      {/* Location map */}
      <MapSection />
    </PublicLayout>
  );
}