import PublicLayout from '../PublicLayout';
import { Crown, Sparkles, Star, Gift, Calendar, Check } from 'lucide-react';
import { PrimaryButton } from '../PrimaryButton';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export default function VIPPage() {
  const { t } = useLanguage();

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#0B0F19] via-[#1a1a1a] to-[#0B0F19] text-white py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(255,152,0,0.1),transparent_50%)]"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-[#FF9800] bg-[#FF9800]/10">
                <Crown className="h-5 w-5 text-[#FF9800]" />
                <span className="text-[#FF9800] font-bold tracking-widest text-sm uppercase">
                  {t('home.vip_club.badge')}
                </span>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-serif font-bold">
              {t('home.vip_club.title_1')}<br />
              {t('home.vip_club.title_2')}
            </h1>

            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              {t('home.vip_club.desc_part_1')} <span className="text-white font-semibold">Bitcoin Nail Bar</span> {t('home.vip_club.desc_part_2')}
            </p>

            <div className="pt-6">
              <Link to="/booking">
                <PrimaryButton size="lg" className="gap-2">
                  <Sparkles className="h-5 w-5" />
                  Join VIP Club
                </PrimaryButton>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
                VIP Member Benefits
              </h2>
              <p className="text-xl text-gray-600">
                Experience luxury like never before
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Gift,
                  title: "Exclusive Discounts",
                  desc: "Get 15-20% off on all services year-round"
                },
                {
                  icon: Star,
                  title: "Priority Booking",
                  desc: "Skip the waitlist and book your preferred time slots"
                },
                {
                  icon: Sparkles,
                  title: "Birthday Treats",
                  desc: "Complimentary luxury service on your special day"
                },
                {
                  icon: Crown,
                  title: "VIP Lounge Access",
                  desc: "Enjoy our exclusive relaxation lounge with premium amenities"
                },
                {
                  icon: Calendar,
                  title: "Loyalty Rewards",
                  desc: "Earn points with every visit for free services"
                },
                {
                  icon: Check,
                  title: "Member Events",
                  desc: "Exclusive invites to VIP events and product launches"
                }
              ].map((benefit, i) => {
                const Icon = benefit.icon;
                return (
                  <div key={i} className="bg-white rounded-xl p-8 shadow-lg border-t-4 border-[#FF9800] hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-[#FF9800]/10 flex items-center justify-center">
                        <Icon className="h-6 w-6 text-[#FF9800]" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{benefit.title}</h3>
                    </div>
                    <p className="text-gray-600">{benefit.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#0B0F19] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
            Ready to Join?
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Fill out the form and start enjoying exclusive VIP benefits today
          </p>
          
          <div className="max-w-md mx-auto bg-[#1a1a1a] rounded-2xl p-8 border border-[#FF9800]/20">
            <form className="space-y-6">
              <div>
                <input 
                  type="text" 
                  placeholder="Full Name"
                  className="w-full bg-[#151923] border border-gray-700 rounded-lg px-4 py-4 text-white focus:outline-none focus:border-[#FF9800] transition-colors"
                />
              </div>
              <div>
                <input 
                  type="tel" 
                  placeholder="Phone Number"
                  className="w-full bg-[#151923] border border-gray-700 rounded-lg px-4 py-4 text-white focus:outline-none focus:border-[#FF9800] transition-colors"
                />
              </div>
              <div>
                <input 
                  type="email" 
                  placeholder="Email Address"
                  className="w-full bg-[#151923] border border-gray-700 rounded-lg px-4 py-4 text-white focus:outline-none focus:border-[#FF9800] transition-colors"
                />
              </div>
              
              <PrimaryButton type="button" className="w-full gap-2">
                <Crown className="h-5 w-5" />
                Join VIP Club Now
              </PrimaryButton>
            </form>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
