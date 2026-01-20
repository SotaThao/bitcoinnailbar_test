import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectId, publicAnonKey } from '@utils/supabase/info';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Check, X, Calendar, Clock, User, Scissors } from 'lucide-react';
import { toast } from 'sonner';

export default function CheckInPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState<'pending' | 'confirmed' | 'cancelled' | 'completed'>('pending');

  useEffect(() => {
    if (id) {
      loadAppointment();
    }
  }, [id]);

  const loadAppointment = async () => {
    try {
      // In a real app, we would have a specific endpoint for fetching one appointment
      // For now, we fetch all and filter (not efficient but works with current backend)
      // Or better, assume the backend has a get-by-id logic if we modify it, 
      // but standard KV logic in the provided backend usually supports get by key.
      // The current backend route `GET /appointments` returns all. 
      // We should ideally add `GET /appointments/:id`.
      // Let's check if the backend supports GET by ID. 
      // It does NOT explicitly in the provided code (only PUT has :id).
      // But we can fetch all and find it, or use the KV store structure if we know it.
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/appointments`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      const data = await response.json();
      
      if (data.success) {
        const found = data.data.find((a: any) => a.id === id || a.id === `appointment:${id}`);
        if (found) {
            setAppointment(found);
            setStatus(found.status);
        } else {
            toast.error("Appointment not found");
        }
      }
    } catch (error) {
      console.error('Error loading appointment:', error);
      toast.error("Failed to load appointment details");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (newStatus: 'confirmed' | 'cancelled') => {
    setProcessing(true);
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/appointments/${appointment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      const data = await response.json();
      if (data.success) {
        setStatus(newStatus);
        setAppointment({ ...appointment, status: newStatus });
        toast.success(`Appointment ${newStatus} successfully!`);
        if (newStatus === 'cancelled') {
            setTimeout(() => navigate('/'), 2000);
        }
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error("An error occurred");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF9800]"></div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Appointment Not Found</h1>
        <Button onClick={() => navigate('/')} variant="outline" className="border-zinc-700 text-black">
          Return Home
        </Button>
      </div>
    );
  }

  const appointmentDate = new Date(appointment.appointmentTime);

  return (
    <div className="min-h-screen bg-black text-white p-4 flex items-center justify-center">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-white shadow-2xl">
        <CardHeader className="text-center border-b border-zinc-800 pb-6">
          <CardTitle className="text-3xl font-serif text-[#FF9800] mb-2">Self Check-in</CardTitle>
          <CardDescription className="text-gray-400">
            Please review your appointment details below
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Status Badge */}
          <div className="flex justify-center">
            <span className={`px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider ${
              status === 'confirmed' ? 'bg-green-500/20 text-green-500' :
              status === 'cancelled' ? 'bg-red-500/20 text-red-500' :
              status === 'completed' ? 'bg-blue-500/20 text-blue-500' :
              'bg-yellow-500/20 text-yellow-500'
            }`}>
              {status}
            </span>
          </div>

          {/* Customer Info */}
          <div className="space-y-4 bg-black/40 p-4 rounded-lg border border-zinc-800">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-[#FF9800]" />
              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-medium">{appointment.customerName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-[#FF9800]" />
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{appointmentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-[#FF9800]" />
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-medium">{appointmentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Services</h3>
            <div className="space-y-2">
              {appointment.serviceNames && Array.isArray(appointment.serviceNames) ? (
                appointment.serviceNames.map((name: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-zinc-800/50 rounded-lg">
                    <Scissors className="h-4 w-4 text-[#FF9800]" />
                    <span>{name}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No service details available</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 grid grid-cols-2 gap-4">
             {status === 'pending' || status === 'confirmed' ? (
               <>
                 <Button 
                   onClick={() => handleAction('cancelled')} 
                   disabled={processing}
                   variant="outline"
                   className="w-full border-red-500/50 text-red-500 hover:bg-red-500/10 hover:text-red-400 h-12"
                 >
                   <X className="mr-2 h-4 w-4" /> Cancel
                 </Button>
                 <Button 
                   onClick={() => handleAction('confirmed')}
                   disabled={processing || status === 'confirmed'}
                   className={`w-full h-12 font-bold ${
                     status === 'confirmed' 
                       ? 'bg-green-600 hover:bg-green-700 text-white' 
                       : 'bg-[#FF9800] hover:bg-[#FF9800]/90 text-black'
                   }`}
                 >
                   <Check className="mr-2 h-4 w-4" /> 
                   {status === 'confirmed' ? 'Checked In' : 'Confirm'}
                 </Button>
               </>
             ) : (
                <div className="col-span-2 text-center text-gray-500 py-2">
                  No actions available for this appointment.
                </div>
             )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}