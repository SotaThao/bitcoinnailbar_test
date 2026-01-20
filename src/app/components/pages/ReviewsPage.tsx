import { useState, useEffect } from 'react';
import PublicLayout from '../PublicLayout';
import { SEOHead } from '../shared/SEOHead';
import { Star, ChevronDown, ThumbsUp, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { projectId, publicAnonKey } from '@utils/supabase/info';
import { format } from 'date-fns';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data as fallback
  const mockReviews = [
      { id: 1, customerName: "Sarah J.", rating: 5, comment: "Absolutely stunning place! The Bitcoin theme is so unique and the pedicure was heavenly.", date: "2024-02-15" },
      { id: 2, customerName: "Michael T.", rating: 5, comment: "Paid with BTC via Lightning Network. Super fast and easy. The staff is very professional.", date: "2024-02-10" },
      { id: 3, customerName: "Emily R.", rating: 4, comment: "Great service, a bit pricey but worth it for the luxury experience. The chairs are incredibly comfortable.", date: "2024-01-28" },
      { id: 4, customerName: "Jessica L.", rating: 5, comment: "The Diamond Gel Manicure is a must-try! My nails have never looked better. Highly recommend booking the VIP suite.", date: "2024-03-01" },
      { id: 5, customerName: "David K.", rating: 5, comment: "Finally a place where I can talk crypto while getting a foot massage. Great atmosphere!", date: "2024-02-22" },
      { id: 6, customerName: "Amanda W.", rating: 4, comment: "Love the complimentary cocktails. The technicians are very skilled with nail art.", date: "2024-02-05" },
  ];

  useEffect(() => {
    const fetchReviews = async () => {
        try {
             // In a real app, we would fetch from the API
             // For now, we simulate a delay and use mock data
             setTimeout(() => {
                 setReviews(mockReviews);
                 setLoading(false);
             }, 800);
        } catch (e) {
            setReviews(mockReviews);
            setLoading(false);
        }
    };
    fetchReviews();
  }, []);

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
        <Star key={i} className={`w-4 h-4 ${i < rating ? 'fill-[#FF9800] text-[#FF9800]' : 'text-gray-300'}`} />
    ));
  };

  return (
    <PublicLayout>
      <SEOHead
        title="Bitcoin Nail Bar Reviews"
        description="See what our clients are saying about the Bitcoin Nail Bar experience."
      />
      <div className="pt-24 pb-20 bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4">
             <div className="text-center mb-16 space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF9800]/10 border border-[#FF9800]/20 text-[#FF9800] text-xs font-bold tracking-[0.2em] uppercase">
                    <MessageCircle className="w-3 h-3" />
                    Testimonials
                </div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#0B0F19]">
                    Reviews
                </h1>
                <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                    See what our clients are saying about the Bitcoin Nail Bar experience.
                </p>
             </div>

             {/* Rating Summary */}
             <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 mb-16 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24 max-w-5xl mx-auto">
                 <div className="text-center">
                     <div className="text-7xl font-bold text-[#FF9800] font-serif">4.9</div>
                     <div className="flex justify-center gap-1 my-3">
                         {[1,2,3,4,5].map(i => <Star key={i} className="w-6 h-6 fill-[#FF9800] text-[#FF9800]" />)}
                     </div>
                     <p className="text-gray-500 font-medium">Based on 120+ Verified Reviews</p>
                 </div>
                 
                 <div className="hidden lg:block w-px h-32 bg-gray-100"></div>

                 <div className="flex flex-col gap-3 w-full max-w-md">
                     {[
                        { stars: 5, percent: 92 },
                        { stars: 4, percent: 6 },
                        { stars: 3, percent: 1 },
                        { stars: 2, percent: 0 },
                        { stars: 1, percent: 1 }
                     ].map((item) => (
                         <div key={item.stars} className="flex items-center gap-4">
                             <div className="flex items-center gap-1 w-12">
                                <span className="font-bold text-gray-700">{item.stars}</span>
                                <Star className="w-3 h-3 text-gray-400" />
                             </div>
                             <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                 <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${item.percent}%` }}
                                    transition={{ duration: 1, delay: 0.2 }}
                                    className="h-full bg-[#FF9800] rounded-full" 
                                 />
                             </div>
                             <span className="text-xs text-gray-400 w-8 text-right">{item.percent}%</span>
                         </div>
                     ))}
                 </div>
             </div>

             {/* Reviews Grid */}
             {loading ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {[1,2,3].map(i => (
                         <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse"></div>
                     ))}
                 </div>
             ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {reviews.map((review, idx) => (
                         <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                         >
                            <Card className="hover:shadow-xl transition-all duration-300 border-t-4 border-transparent hover:border-[#FF9800] h-full">
                                <CardContent className="p-8 flex flex-col h-full">
                                    <div className="mb-6 relative">
                                        <Quote className="absolute -top-2 -left-2 w-8 h-8 text-[#FF9800]/20 rotate-180" />
                                        <p className="text-gray-600 text-lg leading-relaxed italic relative z-10 pt-4">
                                            "{review.comment}"
                                        </p>
                                    </div>
                                    
                                    <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF9800] to-[#F57C00] flex items-center justify-center text-white font-bold shadow-lg shadow-[#FF9800]/30">
                                                {review.customerName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-[#0B0F19]">{review.customerName}</p>
                                                <p className="text-xs text-gray-400">{review.date}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-0.5">
                                            {renderStars(review.rating)}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                         </motion.div>
                     ))}
                 </div>
             )}
             
             <div className="mt-16 text-center">
                 <Button className="bg-[#0B0F19] text-white hover:bg-black h-12 px-8 rounded-full shadow-lg">
                    Load More Reviews
                 </Button>
             </div>
        </div>
      </div>
    </PublicLayout>
  );
}