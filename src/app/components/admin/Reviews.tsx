import { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Star, Search, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { Input } from '../ui/input';
import { SearchInput } from '../ui/search-input';
import AdminLayout from '../AdminLayout';
import { Badge } from '../ui/badge';
import { PillTabs, PillTabsList, PillTabsTrigger } from '../ui/pill-tabs';

export default function AdminReviews() {
  const [filter, setFilter] = useState('pending');

  const reviews = [
    { 
      id: 1, 
      client: 'Alice Cooper', 
      service: 'Bitcoin Signature Pedicure', 
      rating: 5, 
      date: '2 hours ago', 
      comment: 'Absolutely amazing experience! The gold soak was luxurious.', 
      status: 'pending' 
    },
    { 
      id: 2, 
      client: 'Bob Dylan', 
      service: 'Manicure', 
      rating: 4, 
      date: '1 day ago', 
      comment: 'Great service, but the wait time was a bit long.', 
      status: 'pending' 
    },
    { 
      id: 3, 
      client: 'Freddie Mercury', 
      service: 'Nail Art', 
      rating: 5, 
      date: '3 days ago', 
      comment: 'Best nail art in Houston! Truly a queen experience.', 
      status: 'approved' 
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
           <PillTabs value={filter} onValueChange={setFilter} className="w-fit">
             <PillTabsList>
               <PillTabsTrigger value="pending">Pending (2)</PillTabsTrigger>
               <PillTabsTrigger value="approved">Approved</PillTabsTrigger>
               <PillTabsTrigger value="rejected">Rejected</PillTabsTrigger>
             </PillTabsList>
           </PillTabs>
           
           <div className="w-full sm:w-64">
              <SearchInput 
                 placeholder="Search reviews..." 
              />
           </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid gap-4">
           {reviews.filter(r => filter === 'all' || r.status === filter).map((review) => (
              <Card key={review.id} className="bg-white border-gray-100 hover:shadow-md transition-all shadow-sm">
                 <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                       
                       {/* Left: User Info & Rating */}
                       <div className="w-full md:w-64 flex-shrink-0 space-y-3">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center font-bold text-orange-600">
                                {review.client.charAt(0)}
                             </div>
                             <div>
                                <h3 className="font-bold text-gray-900 text-sm">{review.client}</h3>
                                <p className="text-xs text-gray-500">{review.date}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-1">
                             {[...Array(5)].map((_, i) => (
                                <Star 
                                   key={i} 
                                   className={`w-4 h-4 ${i < review.rating ? 'text-orange-400 fill-orange-400' : 'text-gray-200'}`} 
                                />
                             ))}
                          </div>
                          <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 font-normal">
                             {review.service}
                          </Badge>
                       </div>

                       {/* Middle: Content */}
                       <div className="flex-1 border-l border-gray-100 md:pl-6 space-y-2">
                          <div className="flex items-start gap-2">
                             <MessageSquare className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                             <p className="text-gray-600 italic">"{review.comment}"</p>
                          </div>
                       </div>

                       {/* Right: Actions */}
                       <div className="flex md:flex-col gap-2 justify-end md:justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                          {review.status === 'pending' && (
                             <>
                                <Button size="sm" className="bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 shadow-none w-full justify-start">
                                   <CheckCircle className="w-4 h-4 mr-2" /> Approve
                                </Button>
                                <Button size="sm" variant="outline" className="text-red-600 border-gray-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200 w-full justify-start">
                                   <XCircle className="w-4 h-4 mr-2" /> Reject
                                </Button>
                             </>
                          )}
                          {review.status !== 'pending' && (
                             <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase text-center border ${
                                review.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                             }`}>
                                {review.status}
                             </span>
                          )}
                       </div>

                    </div>
                 </CardContent>
              </Card>
           ))}
           {reviews.filter(r => filter === 'all' || r.status === filter).length === 0 && (
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                 <p>No reviews found in this category.</p>
              </div>
           )}
        </div>

      </div>
    </AdminLayout>
  );
}