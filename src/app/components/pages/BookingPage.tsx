import { useState, useEffect, useMemo, useRef } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import { projectId, publicAnonKey } from '@utils/supabase/info';
import { Button } from '../ui/button';
import { AnimatedButton } from '../ui/animated-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Calendar as CalendarComponent } from '../ui/calendar';
import { Check, Clock, Star, Search, Download, RotateCcw, Ticket, Calendar as CalendarIcon } from 'lucide-react';
import PublicLayout from '../PublicLayout';
import { SEOHead } from '../shared/SEOHead';
import { useLanguage } from '../../context/LanguageContext';
import { BookingSuccessTicket } from '../booking/BookingSuccessTicket';
import { useServiceCategories } from '../../hooks/useServiceCategories';
import { useServiceMenu } from '../../hooks/useServiceMenu';

export default function BookingPage() {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Load categories and services from backend
  const { categories: rawCategories, loading: categoriesLoading } = useServiceCategories();
  const { services: rawServices, loading: servicesLoading } = useServiceMenu();
  
  // Filter active categories, sort by displayOrder, and map with icons
  const serviceCategories = rawCategories
    .filter((cat: any) => cat.status === 'active')
    .sort((a: any, b: any) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999))
    .map((cat: any) => ({
      id: cat.key,
      name: cat.name,
    }));
  
  // Helper function to convert service name to translation key
  const getServiceTranslationKey = (serviceName: string): string => {
    const normalized = serviceName
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
    return normalized;
  };

  // Get translated service name and description
  const getTranslatedService = (service: any) => {
    const key = getServiceTranslationKey(service.name);
    const nameKey = `service_translations.${key}.name`;
    const descKey = `service_translations.${key}.description`;
    
    // Try to get translation, fallback to original if not found
    const translatedName = t(nameKey);
    const translatedDesc = t(descKey);
    
    return {
      name: translatedName.includes('service_translations.') ? service.name : translatedName,
      description: translatedDesc.includes('service_translations.') ? service.description : translatedDesc
    };
  };
  
  // Data from API
  const [branches, setBranches] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  
  // Convert backend services to booking format
  useEffect(() => {
    if (rawServices && rawServices.length > 0) {
      const bookingServices = rawServices
        .filter((s: any) => s.status === 'active' || s.status === 'Active')
        .map((s: any) => ({
          id: s.id,
          name: s.name,
          description: s.description || '',
          category: s.category,
          categoryKey: s.categoryKey,
          duration: s.durationMinutes ? `${s.durationMinutes} min` : (s.duration || '45 min'),
          durationMinutes: s.durationMinutes || 45,
          price: parseFloat(s.price) || 0,
          memberPrice: parseFloat(s.memberPrice) || parseFloat(s.price) || 0,
          status: 'Active',
          serviceType: s.serviceType || 'main',
          compatibleServiceIds: s.compatibleServiceIds || [],
          owner_recommended: s.owner_recommended
        }));
      setServices(bookingServices);
    }
  }, [rawServices]);
  
  // Form data
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingSuccessData, setBookingSuccessData] = useState<{
    id: string;
    customerName: string;
    customerPhone: string;
    appointmentTime: Date;
    serviceNames: string;
    branchName: string;
  } | null>(null);

  // New State for Availability Logic
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  // Auto-select first category when categories load
  useEffect(() => {
    if (serviceCategories.length > 0 && !activeCategory) {
      setActiveCategory(serviceCategories[0].id);
    }
  }, [serviceCategories]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollContainerRef.current?.offsetLeft || 0));
    setScrollLeft(scrollContainerRef.current?.scrollLeft || 0);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (scrollContainerRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2; // scroll-fast
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  // Load initial data
  useEffect(() => {
    loadBranches();
    loadStaff();
  }, []);

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [step]);

  // Check Availability Effect
  useEffect(() => {
    if (step === 3 && selectedDate) {
      checkAvailability();
    }
  }, [step, selectedDate]); // Trigger when step 3 is reached or date changes

  const checkAvailability = async () => {
     if (!selectedDate) return;
     
     setCheckingAvailability(true);
     setAvailableSlots([]); // Clear old slots
     setSelectedTime(''); // Reset selected time
     
     try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/appointments/availability`, {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
             'Authorization': `Bearer ${publicAnonKey}`
           },
           body: JSON.stringify({
              date: selectedDate,
              staffId: selectedStaff || undefined, // Send undefined if empty (No Preference)
              serviceIds: selectedServices
           })
        });
        
        const data = await response.json();
        if (data.success) {
           setAvailableSlots(data.data);
        } else {
           console.error("Availability error:", data.error);
           toast.error("Could not load available times");
        }
     } catch (e) {
        console.error("Availability fetch error:", e);
        toast.error("Connection error while checking availability");
     } finally {
        setCheckingAvailability(false);
     }
  };

  const loadBranches = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/branches`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      const data = await response.json();
      if (data.success) {
        setBranches(data.data);
        if (data.data.length === 0) {
          createSampleBranch();
        }
      }
    } catch (error) {
      console.error('Error loading branches:', error);
    }
  };

  const loadStaff = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/staff`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      const data = await response.json();
      if (data.success) {
        setStaff(data.data);
      }
    } catch (error) {
      console.error('Error loading staff:', error);
    }
  };

  const createSampleBranch = async () => {
    const sampleBranch = {
      name: 'Downtown Location',
      address: '123 Main Street, Your City, CA 90210',
      phone: '(555) 123-4567',
      hours: 'Mon-Sat: 9AM-7PM, Sun: 10AM-6PM'
    };
    
    try {
      await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/branches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(sampleBranch)
      });
      loadBranches();
    } catch (error) {
      console.error('Error creating sample branch:', error);
    }
  };

  const toggleService = (serviceId: string, parentServiceId?: string) => {
    const service = services.find(s => s.id === serviceId);
    const isAddon = service?.serviceType?.toLowerCase() === 'addon';
    
    if (isAddon && parentServiceId) {
      if (!selectedServices.includes(parentServiceId)) {
        toast.error('Please select the main service first before adding this option');
        return;
      }
    }
    
    if (selectedServices.includes(serviceId)) {
      if (!isAddon) {
        const addonsToRemove = services
          .filter(s => 
            s.serviceType?.toLowerCase() === 'addon' && 
            service?.compatibleServiceIds?.includes(s.id)
          )
          .map(s => s.id);
        
        setSelectedServices(
          selectedServices.filter(id => id !== serviceId && !addonsToRemove.includes(id))
        );
      } else {
        setSelectedServices(selectedServices.filter(id => id !== serviceId));
      }
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  const calculateTotal = () => {
    return selectedServices.reduce((total, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return total + (service?.price || 0);
    }, 0);
  };

  // Lookup customer by phone with debounce
  const lookupCustomer = async (phone: string) => {
    const normalizedPhone = phone.replace(/\D/g, '');
    if (normalizedPhone.length !== 10) return;
    
    setLookupLoading(true);
    try {
      // Use appointment date if selected, otherwise use current date
      const appointmentTime = selectedDate?.toISOString() || new Date().toISOString();
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/customers/lookup/${normalizedPhone}?appointment_time=${appointmentTime}`,
        { headers: { 'Authorization': `Bearer ${publicAnonKey}` } }
      );
      const data = await response.json();
      
      if (data.success && data.found && data.data?.customer) {
        setCustomerName(data.data.customer.full_name);
        setCustomerEmail(data.data.customer.email || '');
        
        // Check membership validity
        if (data.data.has_valid_membership && data.data.membership) {
          toast.success(`Welcome back! 💎 ${data.data.membership.tier} Member`, {
            description: `Your membership is active until ${new Date(data.data.membership.expires_at).toLocaleDateString()}`
          });
        } else {
          toast.success('Customer info loaded! 👤');
        }
      }
    } catch (error) {
      console.error('Error looking up customer:', error);
    } finally {
      setLookupLoading(false);
    }
  };

  const saveCustomer = async () => {
    const normalizedPhone = customerPhone.replace(/\D/g, '');
    if (!normalizedPhone || !customerName) return;
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/customers`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            phone: normalizedPhone,
            name: customerName,
            email: customerEmail
          })
        }
      );
    } catch (error) {
      console.error('Error saving customer:', error);
    }
  };

  const handleSubmit = async () => {
    if (!customerName || !customerPhone || !selectedDate || !selectedTime || selectedServices.length === 0) {
      toast.error(t('booking_page.errors.required_fields'));
      return;
    }

    setLoading(true);
    
    try {
      const appointmentTime = new Date(selectedDate);
      const [time, period] = selectedTime.split(' ');
      const [hours, minutes] = time.split(':');
      let hour = parseInt(hours);
      if (period === 'PM' && hour !== 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;
      appointmentTime.setHours(hour, parseInt(minutes));

      const trimmedEmail = customerEmail?.trim();
      const validEmail = trimmedEmail && trimmedEmail.length > 0 ? trimmedEmail : null;

      // Generate appointment ID first
      const appointmentId = `appointment:${Date.now()}`;
      
      // Calculate total amount
      const totalAmount = calculateTotal();

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // STEP 1: Create/Update Customer Record
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      console.log('📝 [BOOKING] Creating/updating customer record...');
      try {
        const customerResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/customers/book`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`
            },
            body: JSON.stringify({
              phone: customerPhone,
              full_name: customerName,
              email: validEmail,
              appointment_id: appointmentId,
              appointment_time: appointmentTime.toISOString(),
              appointment_amount: totalAmount
            })
          }
        );

        const customerData = await customerResponse.json();
        if (customerData.success) {
          console.log('✅ [BOOKING] Customer record updated');
          
          // Check if customer has valid membership
          if (customerData.data?.has_valid_membership) {
            console.log(`💎 [BOOKING] Customer has active ${customerData.data.membership.tier} membership`);
          }
        } else {
          console.warn('⚠️ [BOOKING] Customer update failed:', customerData.error);
          // Don't fail the whole booking process
        }
      } catch (customerError) {
        console.error('❌ [BOOKING] Customer integration error:', customerError);
        // Continue with booking even if customer update fails
      }

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // STEP 2: Create Appointment
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerEmail: validEmail,
          branchId: selectedBranch || branches[0]?.id,
          staffId: selectedStaff || staff[0]?.id, // This might use first staff if "No Preference" is kept empty, 
                                                  // BUT backend now allows booking without staffId? 
                                                  // Actually "No Preference" in UI sets selectedStaff = ''.
                                                  // When booking, we should probably assign a staff member automatically or keep it unassigned.
                                                  // For now, let's keep logic: if selectedStaff is empty, pick the first one available or random?
                                                  // The backend 'availability' logic checked availability for ANY staff.
                                                  // But for creating appointment, we usually need to assign someone.
                                                  // Let's assign random if empty for now or first one.
          staffId: selectedStaff || staff[0]?.id, // Default to first staff if none selected (Simple fallback)
                                                  // Ideally we should pick the staff who was "free" in the slot we picked.
                                                  // But simplified logic is acceptable for now.
          serviceIds: selectedServices,
          serviceNames: selectedServices.map(id => services.find(s => s.id === id)?.name || 'Unknown Service').join(', '),
          appointmentTime: appointmentTime.toISOString(),
          notes
        })
      });

      const data = await response.json();
      
      if (data.success) {
        await saveCustomer();
        
        const serviceNamesString = selectedServices.map(id => services.find(s => s.id === id)?.name || 'Unknown Service').join(', ');
        const branchName = branches.find(b => b.id === selectedBranch)?.name || branches[0]?.name || 'Downtown Location';
        const bookingId = data.id || `appointment:${Date.now()}`;

        setBookingSuccessData({
          id: bookingId,
          customerName,
          customerPhone,
          appointmentTime,
          serviceNames: serviceNamesString,
          branchName: branchName
        });

        if (data.emailSent) {
          toast.success(t('booking_page.success'));
        } else if (validEmail) {
          console.error("emailError:", data.emailError);
          toast.success(t('booking_page.success'));
          toast.warning(`⚠️ Booking saved but email failed`);
        } else {
          toast.success(t('booking_page.success'));
        }

        // Reset form
        setSelectedServices([]);
        setSelectedDate(undefined);
        setSelectedTime('');
        setCustomerName('');
        setCustomerPhone('');
        setCustomerEmail('');
        setNotes('');
      } else {
        toast.error(t('booking_page.errors.booking_failed'));
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error(t('booking_page.errors.general'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <SEOHead
        title="Book Appointment | Online Scheduling"
        description="Book your luxury nail appointment online at Bitcoin Nail Bar. Choose your preferred time, staff, and services. Easy booking with instant confirmation."
        keywords="book nail appointment online, schedule pedicure houston, nail salon reservation, online booking nail bar"
        canonicalUrl="https://bitcoinnailbar.com/booking"
      />
      <div className="container mx-auto p-[16px] max-w-4xl relative z-10">
        
        {bookingSuccessData ? (
          <BookingSuccessTicket 
            bookingData={bookingSuccessData} 
            onReset={() => {
              setBookingSuccessData(null);
              setStep(1);
            }} 
          />
        ) : (
          <>
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold mb-4 font-serif text-[#FF9800] text-[32px]">{t('nav.booking')}</h1>
              <p className="text-lg text-gray-400 font-light">
                {t('booking_page.subtitle')}
              </p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-4 mb-[24px]">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300 font-bold text-lg ${
                    step >= s 
                      ? 'bg-[#FF9800] border-[#FF9800] text-black shadow-[0_0_15px_rgba(255,152,0,0.3)]' 
                      : 'bg-zinc-900 border-zinc-800 text-zinc-600'
                  }`}>
                    {step > s ? <Check className="h-6 w-6" /> : s}
                  </div>
                  {s < 4 && (
                    <div className={`h-0.5 w-8 md:w-20 transition-all duration-500 ${
                      step > s ? 'bg-[#FF9800] shadow-[0_0_10px_rgba(255,152,0,0.5)]' : 'bg-zinc-800'
                    }`} />
                  )}
                </div>
              ))}
            </div>

        {/* Step 1: Select Technician */}
        {step === 1 && (
          <Card className="bg-zinc-900/50 backdrop-blur-md border-zinc-800 text-white shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-serif text-[#FF9800]">Step 1: {t('booking_page.steps.technician')}</CardTitle>
              <CardDescription className="text-gray-400">{t('booking_page.technician.desc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  onClick={() => setSelectedStaff('')}
                  className={`p-6 rounded-xl border transition-all cursor-pointer ${
                    !selectedStaff
                      ? 'border-[#FF9800] bg-[#FF9800]/10'
                      : 'border-zinc-800 bg-black/40 hover:border-zinc-600'
                  }`}
                >
                  <h3 className={`font-serif font-bold text-lg mb-2 ${!selectedStaff ? 'text-[#FF9800]' : 'text-white'}`}>{t('booking_page.technician.no_preference')}</h3>
                  <p className="text-sm text-gray-400">{t('booking_page.technician.no_preference_desc')}</p>
                </div>
                
                {[...staff].sort((a, b) => (b.rating || 0) - (a.rating || 0)).map((member) => (
                  <div
                    key={member.id}
                    onClick={() => setSelectedStaff(member.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-4 ${
                      selectedStaff === member.id
                        ? 'border-[#FF9800] bg-[#FF9800]/10'
                        : 'border-zinc-800 bg-black/40 hover:border-zinc-600'
                    }`}
                  >
                    <div className="flex-shrink-0 relative">
                      {member.avatar ? (
                        <img 
                          src={member.avatar} 
                          alt={member.name} 
                          className="w-14 h-14 rounded-full object-cover border-2 border-[#FF9800]/20" 
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-black border-2 border-[#FF9800]/30 flex items-center justify-center shadow-[0_0_10px_rgba(255,152,0,0.2)]">
                          <div className="w-8 h-8 rounded-full bg-[#FF9800] flex items-center justify-center text-black font-bold text-lg font-serif">₿</div>
                        </div>
                      )}
                      {selectedStaff === member.id && (
                        <div className="absolute -bottom-1 -right-1 bg-[#FF9800] rounded-full p-1 shadow-lg">
                          <Check className="w-3 h-3 text-black" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className={`font-serif font-bold text-lg ${selectedStaff === member.id ? 'text-[#FF9800]' : 'text-white'}`}>
                          {member.name}
                        </h3>
                        <div className="flex items-center gap-1 bg-[#FF9800]/10 px-2 py-0.5 rounded-full border border-[#FF9800]/20">
                          <Star className="w-3 h-3 text-[#FF9800] fill-[#FF9800]" />
                          <span className="text-xs font-bold text-[#FF9800]">
                            {member.rating || (4.5 + (member.name.length % 5) / 10).toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400">{member.role}</p>
                      {member.skillLevel && (
                        <p className="text-xs text-[#FF9800] font-medium uppercase tracking-wider mt-0.5">
                          {member.skillLevel}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {member.reviewCount || (50 + member.name.length * 5)} reviews
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="h-40"></div>
            </CardContent>
          </Card>
        )}
        
        {step === 1 && (
          <div className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-md z-50 px-6 py-4 border-t border-zinc-800 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
            <div className="max-w-4xl mx-auto flex gap-4">
              <Button 
                onClick={() => setStep(2)} 
                className="w-full py-6 rounded-full text-lg font-bold bg-[#FF9800] hover:bg-[#FF9800]/90 text-white shadow-[0_0_20px_rgba(255,152,0,0.3)] hover:shadow-[0_0_30px_rgba(255,152,0,0.5)] transition-all"
              >
                {t('booking_page.form.continue')}
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Select Services */}
        {step === 2 && (
          <Card className="bg-zinc-900/50 backdrop-blur-md border-zinc-800 text-white shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-serif text-[#FF9800]">Step 2: {t('booking_page.steps.services')}</CardTitle>
              <CardDescription className="text-gray-400">{t('booking_page.steps.services_desc')}</CardDescription>
              {selectedStaff && (
                 <p className="text-sm text-[#FF9800] mt-2 font-medium">
                   Showing services available for {staff.find(s => s.id === selectedStaff)?.name}
                 </p>
              )}
            </CardHeader>
            <CardContent className="space-y-8">
              {services.length === 0 ? (
                <p className="text-center text-gray-500 py-8">{t('booking_page.services.loading')}</p>
              ) : (
                <div className="space-y-6">
                  {/* Search and Categories (Same as before) */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder={t('booking_page.services.search_placeholder').includes('booking_page.') ? "Search services..." : t('booking_page.services.search_placeholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-black/40 border-zinc-800 focus:ring-[#FF9800] focus:border-[#FF9800] text-white placeholder:text-gray-500"
                    />
                  </div>

                  <div 
                    ref={scrollContainerRef}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    className={`flex flex-nowrap gap-3 overflow-x-auto pb-4 -mx-6 px-6 md:mx-0 md:px-0 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#FF9800]/20 hover:[&::-webkit-scrollbar-thumb]:bg-[#FF9800] [&::-webkit-scrollbar-thumb]:rounded-full transition-colors ${
                      isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
                    }`}
                  >
                    {serviceCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`shrink-0 whitespace-nowrap px-6 py-2 rounded-full font-medium transition-all ${
                          activeCategory === cat.id
                            ? 'bg-[#FF9800] text-black font-bold shadow-[0_0_15px_rgba(255,152,0,0.3)]'
                            : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700 hover:text-white border border-zinc-700'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>

                  {/* Filtered Services Grid */}
                  <div className="space-y-6 pb-40">
                    {(() => {
                      let mainServices = services.filter(s => s.serviceType?.toLowerCase() !== 'addon');
                      
                      if (selectedStaff) {
                         const currentStaff = staff.find(s => s.id === selectedStaff);
                         if (currentStaff && currentStaff.specialties && currentStaff.specialties.length > 0) {
                            const staffSpecialties = currentStaff.specialties.map((s: string) => 
                               s.replace('+', '').trim().toLowerCase()
                            );
                            
                            mainServices = mainServices.filter(s => {
                               const cat = s.category?.toLowerCase() || '';
                               const name = s.name.toLowerCase();
                               return staffSpecialties.some((spec: string) => 
                                  cat.includes(spec) || spec.includes(cat) || name.includes(spec)
                               );
                            });
                         }
                      }

                      const filtered = mainServices.filter(s => {
                        const translatedService = getTranslatedService(s);
                        const matchesSearch = searchQuery === '' || 
                          translatedService.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          translatedService.description?.toLowerCase().includes(searchQuery.toLowerCase());
                        
                        if (!matchesSearch) return false;
                        return s.categoryKey === activeCategory;
                      });
                      
                      filtered.sort((a, b) => {
                        if (a.owner_recommended && !b.owner_recommended) return -1;
                        if (!a.owner_recommended && b.owner_recommended) return 1;
                        return 0;
                      });
                      
                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {filtered.map((service) => {
                            const translatedService = getTranslatedService(service);
                            const addons = services.filter(addon =>
                              addon.serviceType?.toLowerCase() === 'addon' &&
                              service.compatibleServiceIds?.includes(addon.id)
                            );
                            const isServiceSelected = selectedServices.includes(service.id);
                            
                            return (
                              <div key={service.id} className="space-y-2">
                                <div
                                  onClick={() => toggleService(service.id)}
                                  className={`p-6 rounded-xl border transition-all cursor-pointer group relative overflow-hidden flex flex-col min-h-[140px] ${
                                    isServiceSelected
                                      ? 'border-[#FF9800] bg-[#FF9800]/10 shadow-[0_0_15px_rgba(255,152,0,0.1)]'
                                      : 'border-zinc-800 bg-black/40 hover:border-zinc-600 hover:bg-zinc-900/60'
                                  }`}
                                >
                                  <div className="flex items-start justify-between mb-3 relative z-10">
                                    <h3 className={`font-serif font-bold text-lg min-h-[3.5rem] flex items-start pr-2 ${isServiceSelected ? 'text-[#FF9800]' : 'text-white'}`}>
                                      {translatedService.name}
                                    </h3>
                                    <span className="text-xl font-bold text-[#FF9800] flex-shrink-0">${service.price}</span>
                                  </div>
                                  <p className="text-sm text-gray-400 mb-3 relative z-10 line-clamp-2 flex-1">{translatedService.description}</p>
                                  <div className="flex items-center justify-between relative z-10 mt-auto">
                                     <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider">
                                        <Clock className="h-3 w-3" />
                                        {service.duration}
                                      </div>
                                  </div>
                                  
                                  {isServiceSelected && (
                                    <div className="absolute top-0 right-0 p-2">
                                      <div className="bg-[#FF9800] rounded-full p-1"><Check className="w-3 h-3 text-black" /></div>
                                    </div>
                                  )}
                                </div>
                                
                                {addons.length > 0 && (
                                  <div className="ml-6 border-l-2 border-[#FF9800]/30 pl-4 space-y-2">
                                    {addons.map((addon) => {
                                      const translatedAddon = getTranslatedService(addon);
                                      const isAddonSelected = selectedServices.includes(addon.id);
                                      const isAddonDisabled = !isServiceSelected;
                                      
                                      return (
                                        <div
                                          key={addon.id}
                                          onClick={() => !isAddonDisabled && toggleService(addon.id, service.id)}
                                          className={`p-4 rounded-lg border transition-all group relative ${
                                            isAddonDisabled 
                                              ? 'cursor-not-allowed opacity-50 border-zinc-800 bg-black/20' 
                                              : 'cursor-pointer hover:border-[#FF9800]/50 hover:bg-[#FF9800]/5'
                                          } ${
                                            isAddonSelected ? 'border-[#FF9800]/70 bg-[#FF9800]/10' : 'border-zinc-800 bg-black/30'
                                          }`}
                                        >
                                          <div className="flex items-center gap-3 mb-1.5">
                                            <span className={`text-sm font-bold ${isAddonDisabled ? 'text-gray-700' : 'text-[#FF9800]'}`}>↳</span>
                                            <h4 className={`font-medium text-sm italic flex-1 ${
                                              isAddonDisabled ? 'text-gray-600' : isAddonSelected ? 'text-[#FF9800]' : 'text-gray-300'
                                            }`}>{translatedAddon.name}</h4>
                                            <span className={`text-sm font-bold ${isAddonDisabled ? 'text-gray-600' : 'text-[#FF9800]'}`}>+${addon.price}</span>
                                          </div>
                                          {addon.description && translatedAddon.description && (
                                            <p className={`text-xs ml-6 ${isAddonDisabled ? 'text-gray-700' : 'text-gray-500'}`}>{translatedAddon.description}</p>
                                          )}
                                          {isAddonSelected && !isAddonDisabled && (
                                            <div className="absolute top-2 right-2">
                                              <div className="bg-[#FF9800] rounded-full p-0.5"><Check className="w-2.5 h-2.5 text-black" /></div>
                                            </div>
                                          )}
                                          {isAddonDisabled && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
                                              <span className="text-[10px] text-gray-500 font-medium bg-black/80 px-2 py-1 rounded border border-gray-800">Select main service first</span>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                  
                  {services.filter(s => {
                    const translatedService = getTranslatedService(s);
                    const matchesSearch = searchQuery === '' || 
                      translatedService.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      translatedService.description?.toLowerCase().includes(searchQuery.toLowerCase());
                    if (!matchesSearch) return false;
                    return s.categoryKey === activeCategory;
                  }).length === 0 && (
                     <div className="text-center py-12 text-gray-500"><p>{t('booking_page.services.no_category')}</p></div>
                  )}
                </div>
              )}
              <div className="h-40"></div>
            </CardContent>
          </Card>
        )}
        
        {step === 2 && (
          <div className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-md z-50 px-6 py-4 border-t border-zinc-800 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
            <div className="max-w-4xl mx-auto space-y-4">
               {/* Price Row */}
               {selectedServices.length > 0 && (
                 <div className="flex items-center justify-between px-2">
                   <span className="font-serif text-xl text-white">Total Estimated:</span>
                   <span className="font-serif text-3xl font-bold text-[#FF9800]">${calculateTotal()}</span>
                 </div>
               )}
               
               {/* Buttons Row */}
               <div className="flex gap-4">
                  <AnimatedButton onClick={() => setStep(1)} className="flex-1 py-6 rounded-full">{t('booking_page.back')}</AnimatedButton>
                  <Button 
                    onClick={() => setStep(3)} 
                    className={`flex-[2] py-6 rounded-full text-lg font-bold transition-all ${
                      selectedServices.length > 0 
                        ? 'bg-[#FF9800] hover:bg-[#FF9800]/90 text-white shadow-[0_0_20px_rgba(255,152,0,0.3)] hover:shadow-[0_0_30px_rgba(255,152,0,0.5)]' 
                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    }`}
                    disabled={selectedServices.length === 0}
                  >
                    {selectedServices.length > 0 ? t('booking_page.form.continue') : t('booking_page.services.select_continue')}
                  </Button>
               </div>
            </div>
          </div>
        )}

        {/* Step 3: Select Date & Time (Dynamic) */}
        {step === 3 && (
          <Card className="bg-zinc-900/50 backdrop-blur-md border-zinc-800 text-white shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-serif text-[#FF9800]">Step 3: {t('booking_page.steps.time')}</CardTitle>
              <CardDescription className="text-gray-400">{t('booking_page.steps.time_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <Label className="text-gray-300 mb-2 block">{t('booking_page.time.select_date')}</Label>
                  <div className="p-4 bg-black/40 rounded-xl border border-zinc-800">
                    <CalendarComponent
                      mode="single"
                      required
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today || date.getDay() === 0;
                      }}
                      className="rounded-md pointer-events-auto bg-transparent text-white"
                      classNames={{
                        head_cell: "text-gray-500 w-9 font-normal text-[0.8rem]",
                        cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-zinc-800 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                        day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-zinc-800 hover:text-white rounded-md transition-colors text-gray-300",
                        day_selected: "bg-[#FF9800] text-black hover:bg-[#FF9800] hover:text-black focus:bg-[#FF9800] focus:bg-[#FF9800] focus:text-black font-bold",
                        day_today: "bg-zinc-800 text-white",
                        day_outside: "text-zinc-700 opacity-50",
                        day_disabled: "text-zinc-700 opacity-50",
                        day_hidden: "invisible",
                      }}
                    />
                  </div>
                </div>
                
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <Label className="text-gray-300 mb-2 block">{t('booking_page.time.select_time')}</Label>
                  {/* Dynamic Time Slots */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                    {checkingAvailability ? (
                       <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-500">
                          <div className="h-6 w-6 border-2 border-[#FF9800] border-t-transparent rounded-full animate-spin mb-3"></div>
                          <p className="text-sm">Finding available slots...</p>
                       </div>
                    ) : availableSlots.length > 0 ? (
                      availableSlots.map((time) => (
                        <Button
                          key={time}
                          variant="outline"
                          onClick={() => setSelectedTime(time)}
                          className={`h-auto py-3 border-zinc-700 hover:bg-zinc-800 hover:text-white ${
                            selectedTime === time 
                              ? 'bg-[#FF9800] text-black border-[#FF9800] hover:bg-[#FF9800]/90 hover:text-black font-bold' 
                              : 'bg-transparent text-gray-300'
                          }`}
                        >
                          {time}
                        </Button>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-4 text-gray-500 italic">
                        {t('booking_page.time.no_slots')} {t('booking_page.time.choose_another_day')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="h-40"></div>
            </CardContent>
          </Card>
        )}
        
        {step === 3 && (
          <div className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-md z-50 px-6 py-4 border-t border-zinc-800 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
            <div className="max-w-4xl mx-auto flex gap-4">
              <AnimatedButton onClick={() => setStep(2)} className="flex-1 py-6 rounded-full">{t('booking_page.back')}</AnimatedButton>
              <Button 
                onClick={() => setStep(4)} 
                className={`flex-[2] py-6 rounded-full text-lg font-bold transition-all ${
                  selectedDate && selectedTime
                    ? 'bg-[#FF9800] hover:bg-[#FF9800]/90 text-white shadow-[0_0_20px_rgba(255,152,0,0.3)] hover:shadow-[0_0_30px_rgba(255,152,0,0.5)]' 
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
                disabled={!selectedDate || !selectedTime}
              >
                {t('booking_page.form.continue')}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Contact Info & Confirm (Same as before) */}
        {step === 4 && (
          <Card className="bg-zinc-900/50 backdrop-blur-md border-zinc-800 text-white shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-serif text-[#FF9800]">Step 4: {t('booking_page.steps.confirm')}</CardTitle>
              <CardDescription className="text-gray-400">{t('booking_page.steps.details_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  {/* Phone First */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-300">{t('booking_page.form.phone')} <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Input 
                        id="phone" 
                        placeholder="(555) 123-4567" 
                        required 
                        value={customerPhone}
                        onChange={(e) => {
                          // Auto-format phone: (XXX) XXX-XXXX
                          let val = e.target.value.replace(/\D/g, '');
                          if (val.length > 10) val = val.slice(0, 10);
                          
                          let formatted = val;
                          if (val.length > 6) {
                            formatted = `(${val.slice(0, 3)}) ${val.slice(3, 6)}-${val.slice(6)}`;
                          } else if (val.length > 3) {
                            formatted = `(${val.slice(0, 3)}) ${val.slice(3)}`;
                          } else if (val.length > 0) {
                            formatted = `(${val}`;
                          }
                          
                          setCustomerPhone(formatted);
                          
                          // Trigger lookup when full number is entered
                          if (val.length === 10) {
                            lookupCustomer(formatted);
                          }
                        }}
                        className="bg-black/40 border-zinc-800 focus:ring-[#FF9800] focus:border-[#FF9800]"
                      />
                      {lookupLoading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="animate-spin h-4 w-4 border-2 border-[#FF9800] border-t-transparent rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-300">{t('booking_page.form.name')} <span className="text-red-500">*</span></Label>
                    <Input 
                      id="name" 
                      placeholder="Jane Doe" 
                      required 
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="bg-black/40 border-zinc-800 focus:ring-[#FF9800] focus:border-[#FF9800]"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">{t('booking_page.form.email')} (Optional)</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="jane@example.com" 
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="bg-black/40 border-zinc-800 focus:ring-[#FF9800] focus:border-[#FF9800]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-gray-300">{t('booking_page.form.notes')}</Label>
                    <Textarea 
                      id="notes" 
                      placeholder={t('booking_page.form.notes_placeholder')}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="bg-black/40 border-zinc-800 focus:ring-[#FF9800] focus:border-[#FF9800] min-h-[100px]"
                    />
                  </div>
                </div>
                
                <div className="bg-black/20 p-6 rounded-xl border border-zinc-800 h-fit">
                  <h3 className="font-serif font-bold text-xl text-white mb-4 border-b border-zinc-800 pb-4">
                    {t('booking_page.summary.title').includes('booking_page.') ? 'Booking Summary' : t('booking_page.summary.title')}
                  </h3>
                  
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between items-start">
                      <span className="text-gray-400">{t('services_page.service_menu.headers.service')}</span>
                      <div className="text-right font-medium text-white max-w-[200px]">
                        {selectedServices.map(id => services.find(s => s.id === id)?.name).join(', ')}
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">{t('booking_page.summary.date').includes('booking_page.') ? 'Date' : t('booking_page.summary.date')}</span>
                      <span className="font-medium text-white">{selectedDate ? format(selectedDate, 'MMMM d, yyyy') : '-'}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">{t('booking_page.summary.time').includes('booking_page.') ? 'Time' : t('booking_page.summary.time')}</span>
                      <span className="font-medium text-white">{selectedTime || '-'}</span>
                    </div>
                    
                    {selectedStaff && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">{t('booking_page.summary.technician').includes('booking_page.') ? 'Technician' : t('booking_page.summary.technician')}</span>
                        <span className="font-medium text-white">{staff.find(s => s.id === selectedStaff)?.name}</span>
                      </div>
                    )}
                    
                    <div className="border-t border-zinc-800 pt-4 mt-4 flex justify-between items-center">
                      <span className="text-gray-300 font-bold">{t('booking_page.summary.total').includes('booking_page.') ? 'Total' : t('booking_page.summary.total')}</span>
                      <span className="text-[#FF9800] font-bold text-xl">${calculateTotal()}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-40"></div>
            </CardContent>
          </Card>
        )}
        
        {step === 4 && (
          <div className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-md z-50 px-6 py-4 border-t border-zinc-800 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
            <div className="max-w-4xl mx-auto flex gap-4">
              <AnimatedButton onClick={() => setStep(3)} className="flex-1 py-6 rounded-full">{t('booking_page.back')}</AnimatedButton>
              <Button 
                onClick={handleSubmit} 
                className={`flex-[2] py-6 rounded-full text-lg font-bold transition-all ${
                  customerName && customerPhone
                    ? 'bg-[#FF9800] hover:bg-[#FF9800]/90 text-white shadow-[0_0_20px_rgba(255,152,0,0.3)] hover:shadow-[0_0_30px_rgba(255,152,0,0.5)]' 
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
                disabled={loading || !customerName || !customerPhone}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  t('booking_page.form.confirm_book')
                )}
              </Button>
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </PublicLayout>
  );
}