import React from 'react';
import PublicLayout from '../PublicLayout';
import { SEOHead } from '../shared/SEOHead';
import { useLanguage } from '../../context/LanguageContext';
import { MapPin, Phone, Mail, Clock, Navigation } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { PrimaryButton } from '../PrimaryButton';

export default function LocationsPage() {
  const { t } = useLanguage();

  return (
    <PublicLayout>
      <SEOHead
        title="Our Locations | Houston Headquarters"
        description="Visit Bitcoin Nail Bar at our flagship Houston location on Westheimer Rd. 10,000 SQFT of luxury, private suites, and a full cocktail bar."
        keywords="nail salon location houston, westheimer rd nail salon, bitcoin nail bar address, nail salon near me 77042"
        canonicalUrl="https://bitcoinnailbar.com/locations"
      />
      <div className="pt-24 pb-12 bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-center mb-12 text-[#0B0F19]">
                {t('nav.locations')}
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {/* Info Card */}
                <Card className="shadow-xl border-t-4 border-[#FF9800] bg-white h-full">
                    <CardContent className="p-8 space-y-8 h-full flex flex-col justify-between">
                        <div>
                            <div className="mb-6">
                                <h2 className="text-3xl font-serif font-bold text-[#0B0F19] mb-2">Houston Headquarters</h2>
                                <p className="text-[#FF9800] font-medium tracking-wide text-sm uppercase">Flagship Location</p>
                            </div>
                            
                            <p className="text-gray-500 mb-8 leading-relaxed">
                                Experience the future of beauty in our flagship 10,000 SQFT facility. 
                                Featuring private VIP suites, a full cocktail bar, and state-of-the-art ventilation systems.
                            </p>
                            
                            <div className="space-y-6">
                                <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                    <div className="p-2 bg-[#FF9800]/10 rounded-full">
                                        <MapPin className="w-5 h-5 text-[#FF9800]" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-1">Address</p>
                                        <p className="text-gray-600 font-medium">9793 Westheimer Rd<br/>Houston, TX 77042</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                    <div className="p-2 bg-[#FF9800]/10 rounded-full">
                                        <Phone className="w-5 h-5 text-[#FF9800]" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-1">Phone</p>
                                        <p className="text-gray-600 font-medium">(555) 123-4567</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                    <div className="p-2 bg-[#FF9800]/10 rounded-full">
                                        <Mail className="w-5 h-5 text-[#FF9800]" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-1">Email</p>
                                        <p className="text-gray-600 font-medium">hello@bitcoinnailbar.com</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                    <div className="p-2 bg-[#FF9800]/10 rounded-full">
                                        <Clock className="w-5 h-5 text-[#FF9800]" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-1">Opening Hours</p>
                                        <div className="text-gray-600 font-medium space-y-1">
                                            <div className="flex justify-between gap-8">
                                                <span>Mon - Fri:</span>
                                                <span>9:00 AM - 8:00 PM</span>
                                            </div>
                                            <div className="flex justify-between gap-8">
                                                <span>Saturday:</span>
                                                <span>9:00 AM - 7:00 PM</span>
                                            </div>
                                            <div className="flex justify-between gap-8">
                                                <span>Sunday:</span>
                                                <span>10:00 AM - 6:00 PM</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                             <a href="https://maps.google.com/?q=9793+Westheimer+Rd,+Houston,+TX+77042" target="_blank" rel="noopener noreferrer" className="block w-full">
                                <PrimaryButton className="w-full h-12 text-base shadow-lg shadow-[#FF9800]/20 gap-2">
                                    <Navigation className="w-4 h-4" />
                                    Get Directions
                                </PrimaryButton>
                             </a>
                        </div>
                    </CardContent>
                </Card>

                {/* Map */}
                <div className="h-[500px] lg:h-full min-h-[500px] rounded-2xl overflow-hidden shadow-2xl border border-gray-200 relative group">
                     <iframe 
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3464.218583489376!2d-95.54580668489196!3d29.74232298199321!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8640c30656087751%3A0x629555132715783!2s9793%20Westheimer%20Rd%2C%20Houston%2C%20TX%2077042!5e0!3m2!1sen!2sus!4v1709669547631!5m2!1sen!2sus" 
                        width="100%" 
                        height="100%" 
                        style={{ border: 0 }} 
                        allowFullScreen 
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade"
                        className="grayscale hover:grayscale-0 transition-all duration-700"
                    ></iframe>
                    
                    {/* Floating badge on map */}
                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-lg text-xs font-bold text-[#0B0F19] border border-gray-200 pointer-events-none">
                        Houston, TX
                    </div>
                </div>
            </div>
        </div>
      </div>
    </PublicLayout>
  );
}
