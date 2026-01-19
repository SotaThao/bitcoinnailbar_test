import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Gem, 
  LogIn, 
  Scan, 
  ArrowLeft, 
  CheckCircle, 
  QrCode, 
  Smartphone, 
  Loader2, 
  AlertCircle, 
  SwitchCamera 
} from 'lucide-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import bitcoinLogo from 'figma:asset/8504cf526757125a74c4095fde998e4033127268.png';
import imgPattern from 'figma:asset/f84ad6d75c01f5865641dba32416e817dee06ff5.png';

import { QRCodeCanvas } from 'qrcode.react';

// --- PROMOTIONS DATA ---
const PROMOTIONS = [
  {
    title: "Pay with Crypto",
    description: "10% OFF INSTANTLY",
    image: "https://images.unsplash.com/photo-1524666522-3afebecf783a?auto=format&fit=crop&w=600&q=80",
    color: "from-[#f7931a]/20 to-yellow-500/20"
  },
  {
    title: "Golden Hour",
    description: "15% OFF MON-THU 12-3:30PM",
    image: "https://images.unsplash.com/photo-1765745518739-bd8225374713?auto=format&fit=crop&w=600&q=80",
    color: "from-[#996515]/20 to-[#d4af37]/20"
  },
  {
    title: "VIP Royalty",
    description: "$50 CREDIT ON SIGNUP",
    image: "https://images.unsplash.com/photo-1735480165158-e645caaf1695?auto=format&fit=crop&w=600&q=80",
    color: "from-blue-800/20 to-blue-500/20"
  }
];

// --- VISUAL COMPONENTS ---

const PromoCards = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const slides = [
    { id: 'crypto', component: <CryptoSlide /> },
    { id: 'golden', component: <GoldenHourSlide /> },
    { id: 'vip', component: <VipRoyaltySlide /> },
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center w-full max-w-3xl px-6 mt-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="flex items-center gap-4 mb-4"
      >
        <div className="h-px w-8 bg-gray-300" />
        <span className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">Current Promotions</span>
        <div className="h-px w-8 bg-gray-300" />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative w-full aspect-[3/1] min-h-[220px] rounded-xl overflow-hidden shadow-xl border border-gray-800 bg-gray-900 group"
      >
        {/* Slides */}
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full h-full"
            >
              {slides[currentIndex].component}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors z-20"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors z-20"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'w-3 bg-white' 
                  : 'w-2 bg-gray-600 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

// Slide 1: Pay With Crypto
function CryptoSlide() {
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-r from-[#111827] to-black overflow-hidden">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-20 bg-repeat"
        style={{ backgroundImage: `url('${imgPattern}')`, backgroundSize: '18px 18px' }}
      />
      {/* Orange Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#f7931a]/20 blur-[80px] rounded-full" />

      <div className="relative z-10 flex items-center justify-between w-full px-8 md:px-12 max-w-3xl">
        {/* Left Content */}
        <div className="flex flex-col items-start gap-3 max-w-md">
          {/* Badge */}
          <div className="px-2 py-0.5 rounded border border-[#f7931a] bg-[#f7931a]/20 text-[#f7931a] text-[10px] font-bold tracking-widest uppercase">
            PAYMENT 4.0
          </div>
          
          {/* Heading */}
          <div className="flex flex-col font-serif font-bold text-2xl md:text-4xl leading-tight text-white">
            <span>PAY WITH</span>
            <span className="text-[#f7931a]">CRYPTO</span>
          </div>

          {/* Description */}
          <div className="text-sm md:text-base text-gray-300 leading-snug">
            Get an instant <span className="text-white font-bold text-lg">10% OFF</span> when you pay with Bitcoin, USDT or VLinkPay.
          </div>
        </div>

        {/* Right Content - Bitcoin Icon */}
        <div className="hidden md:block transform rotate-12 relative z-10">
           {/* Glowing Shadow */}
           <div className="absolute inset-0 bg-[#f7931a] blur-[40px] opacity-40 rounded-full" />
           <motion.img 
             src={bitcoinLogo} 
             alt="Bitcoin" 
             animate={{ y: [0, -10, 0] }}
             transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
             className="w-[60px] h-[60px] md:w-[80px] md:h-[80px] object-contain drop-shadow-[0_0_10px_rgba(247,147,26,0.5)] relative z-20"
           />
        </div>
      </div>
    </div>
  );
}

// Slide 2: Golden Hour
function GoldenHourSlide() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Background Gradient */}
      <div 
        className="absolute inset-0 opacity-100"
        style={{ backgroundImage: 'linear-gradient(158deg, rgb(153, 101, 21) 0%, rgb(212, 175, 55) 50%, rgb(249, 230, 170) 100%)' }}
      >
        <div className="absolute inset-0 bg-black/10" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center text-center gap-2 md:gap-3 w-full max-w-lg border border-white/40 rounded-xl py-4 md:py-6 px-4 backdrop-blur-sm bg-white/10">
        
        {/* Heading */}
        <h2 className="font-serif font-bold text-2xl md:text-3xl text-white tracking-wide drop-shadow-md">
          GOLDEN HOUR
        </h2>

        {/* Divider */}
        <div className="w-12 h-0.5 bg-white rounded-full" />

        {/* Days */}
        <div className="text-sm md:text-base font-bold text-white tracking-wide">
          MON - THU
        </div>

        {/* Time */}
        <div className="flex items-center gap-2 text-white/90 text-sm md:text-base">
          <Clock className="w-3 h-3 md:w-4 md:h-4" />
          <span>12:00 PM - 3:30 PM</span>
        </div>

        {/* Discount */}
        <div className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">
          15% OFF
        </div>
      </div>
    </div>
  );
}

// Slide 3: VIP Royalty
function VipRoyaltySlide() {
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-r from-[#1e3a8a] to-black overflow-hidden">
      {/* Blue Glow */}
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#3b82f6]/20 blur-[80px] rounded-full" />

      <div className="relative z-10 flex items-center justify-between w-full px-8 md:px-12 max-w-3xl">
        {/* Left Content - Gem Icon */}
        <div className="hidden md:block opacity-80 text-[#60a5fa] transform -rotate-12">
          <Gem className="w-[100px] h-[100px] md:w-[140px] md:h-[140px]" strokeWidth={1} />
        </div>

        {/* Right Content */}
        <div className="flex flex-col items-end gap-3 max-w-md text-right w-full md:w-auto">
          {/* Badge */}
          <div className="px-2 py-0.5 rounded border border-[#3b82f6] bg-[#3b82f6]/20 text-[#93c5fd] text-[10px] font-bold tracking-widest uppercase">
            MEMBERS ONLY
          </div>
          
          {/* Heading */}
          <div className="flex flex-col font-serif font-bold text-2xl md:text-4xl leading-tight text-white">
            <div className="flex items-baseline justify-end gap-2 flex-wrap">
              <span className="text-2xl md:text-3xl">VIP</span>
              <span className="text-[#60a5fa]">ROYALTY</span>
            </div>
          </div>

          {/* Description */}
          <div className="text-sm md:text-base text-gray-300 leading-snug">
            Join our exclusive club. Get <span className="text-white font-bold">$50 CREDIT</span> instantly.
          </div>
        </div>
      </div>
    </div>
  );
}

const MenuQR = () => {
  const [menuMode, setMenuMode] = useState<'services-list' | 'menu-images'>('services-list');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMenuMode = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/settings/homepage-menu`,
          {
            headers: { Authorization: `Bearer ${publicAnonKey}` },
          }
        );
        const data = await response.json();
        if (data.success) {
          setMenuMode(data.data.mode);
        }
      } catch (error) {
        console.error('Failed to fetch menu mode:', error);
      }
    };

    fetchMenuMode();
  }, []);

  const handleMenuClick = () => {
    if (menuMode === 'menu-images') {
      navigate('/menu');
    } else {
      navigate('/services');
    }
  };

  return null;
};

const AnimatedBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#fdfdfd]">
    {/* Moving Orb 1 (Orange) */}
    <motion.div 
      animate={{ 
        x: [0, 50, -50, 0],
        y: [0, -50, 50, 0],
        scale: [1, 1.2, 0.9, 1],
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#ffab40]/10 rounded-full blur-[100px]"
    />
    
    {/* Moving Orb 2 (Warm White/Yellow) */}
    <motion.div 
      animate={{ 
        x: [0, -70, 70, 0],
        y: [0, 70, -70, 0],
        scale: [1, 1.1, 0.9, 1],
      }}
      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] bg-[#ffe0b2]/20 rounded-full blur-[120px]"
    />

    {/* Moving Orb 3 (Center Accent) */}
    <motion.div 
      animate={{ 
        opacity: [0.3, 0.6, 0.3],
        scale: [1, 1.5, 1],
      }}
      transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-[30%] left-[30%] w-[400px] h-[400px] bg-[#fff3e0]/30 rounded-full blur-[80px]"
    />
    
    {/* Noise Texture for "Paper" feel */}
    <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
  </div>
);

const Header = ({ onLogin }: { onLogin: () => void }) => (
  <motion.header 
    initial={{ y: -20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    className="absolute top-0 w-full flex justify-between items-center px-8 py-6 z-50"
  >
    <div className="flex items-center gap-3">
      <img 
        src={bitcoinLogo} 
        alt="Bitcoin Nail Bar" 
        className="w-12 h-12 object-contain drop-shadow-md"
      />
      <div className="flex flex-col">
        <span className="text-[#1a1a1a] font-serif font-bold text-xl leading-none tracking-tight">BITCOIN</span>
        <span className="text-[#737373] text-xs font-medium tracking-[0.2em] uppercase">Nail Bar</span>
      </div>
    </div>
    
    <button 
      onClick={onLogin} 
      className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 hover:bg-white backdrop-blur-md border border-gray-100 shadow-sm transition-all hover:shadow-md text-gray-600 hover:text-[#f7931a]"
    >
      <span className="text-sm font-medium">Staff Login</span>
      <LogIn size={16} className="group-hover:translate-x-0.5 transition-transform" />
    </button>
  </motion.header>
);

const RealTimeClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center mb-16 select-none">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative"
      >
        <h1 className="text-[100px] md:text-[140px] font-medium text-[#1a1a1a] leading-none tracking-tighter tabular-nums font-serif">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
        </h1>
      </motion.div>
      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="text-[#737373] text-lg md:text-xl font-medium tracking-[0.1em] uppercase mt-2"
      >
        {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
      </motion.p>
    </div>
  );
};

// --- LOGIC COMPONENT ---

export default function AdminCheckInPage() {
  const [viewState, setViewState] = useState<'idle' | 'active'>('idle');
  const [activeTab, setActiveTab] = useState<"scan" | "phone">("scan");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment'); // Default: back camera
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const navigate = useNavigate();

  // Cleanup
  useEffect(() => {
    return () => { cleanupScanner(); };
  }, []);

  const cleanupScanner = async () => {
    if (scannerRef.current) {
      if (scannerRef.current.isScanning) {
        try { await scannerRef.current.stop(); } catch (e) { console.error(e); }
      }
      scannerRef.current.clear();
      scannerRef.current = null;
    }
  };

  // Camera Logic
  useEffect(() => {
    let isMounted = true;
    
    const startScanner = async () => {
      if (viewState !== 'active' || activeTab !== 'scan' || result) return;
      
      // Wait for DOM element to be ready (with polling)
      let element = null;
      let attempts = 0;
      const maxAttempts = 20; // 2 seconds total
      
      while (!element && attempts < maxAttempts) {
        element = document.getElementById("reader");
        if (!element) {
          await new Promise(r => setTimeout(r, 100));
          attempts++;
        }
      }
      
      if (!element) {
        console.error('Reader element not found after', attempts, 'attempts');
        return;
      }

      console.log('Reader element found after', attempts * 100, 'ms');

      try {
        await cleanupScanner();
        
        // Show loading state
        if (isMounted) setCameraPermission(null);
        
        console.log('Starting camera...');
        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;
        
        await html5QrCode.start(
          { 
             facingMode: facingMode,
             width: { min: 640, ideal: 1280, max: 1920 },
             height: { min: 480, ideal: 720, max: 1080 } 
          }, 
          { 
            fps: 15, // Keep at 15 for performance
            qrbox: 280, // Increased from 250 to 280
            formatsToSupport: [ Html5QrcodeSupportedFormats.QR_CODE ],
          },
          (decodedText) => { if (isMounted) onScanSuccess(decodedText); },
          () => {} 
        );
        
        console.log('Camera started successfully');
        if (isMounted) setCameraPermission(true);
      } catch (err: any) {
        console.error('Camera init error:', err);
        if (isMounted) {
          setCameraPermission(false);
          setError("Please allow camera access in your browser settings.");
        }
      }
    };

    if (viewState === 'active' && activeTab === 'scan') {
      console.log('Triggering camera start - viewState:', viewState, 'activeTab:', activeTab);
      startScanner();
    } else {
      cleanupScanner();
    }

    return () => { 
      isMounted = false;
    };
  }, [viewState, activeTab, result, facingMode]);

  // Auto Reset
  useEffect(() => {
    if (result) {
      const timer = setTimeout(() => handleReset(), 30000); // 30 seconds to idle
      return () => clearTimeout(timer);
    }
  }, [result]);

  const handleReset = () => {
    setResult(null);
    setPhoneNumber('');
    setViewState('idle');
    cleanupScanner();
  };

  const handleNextCustomer = () => {
    setResult(null);
    setPhoneNumber('');
    setActiveTab('scan');
    // Keep viewState as 'active' to stay in check-in mode
  };

  const onScanSuccess = (decodedText: string) => {
    if (scannerRef.current?.isScanning) scannerRef.current.pause();
    try {
        const data = JSON.parse(decodedText);
        handleCheckIn({ appointmentId: data.id || decodedText, phoneNumber: data.phone });
    } catch {
        handleCheckIn({ appointmentId: decodedText });
    }
  };

  const handleCheckIn = async (params: any) => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 [CHECK-IN] Sending request with params:', params);
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/check-in`;
      console.log('🔍 [CHECK-IN] URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
        body: JSON.stringify(params)
      });
      
      console.log('🔍 [CHECK-IN] Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [CHECK-IN] Server error:', errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ [CHECK-IN] Response data:', data);
      
      if (data.success) {
        setResult(data.data);
        // Play success sound here if needed
      } else {
        throw new Error(data.error || 'Check-in failed');
      }
    } catch (err: any) {
      console.error('❌ [CHECK-IN] Full error:', err);
      const errorMessage = err.message || 'Failed to connect to server. Please check your internet connection.';
      setError(errorMessage);
      toast.error(errorMessage);
      scannerRef.current?.resume();
    } finally {
      setLoading(false);
    }
  };

  const onPhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length < 4) {
      toast.error("Please enter a valid phone number");
      return;
    }
    handleCheckIn({ phoneNumber });
  };

  return (
    <div className="min-h-screen bg-[#fafafa] relative overflow-y-auto overflow-x-hidden font-sans text-[#1a1a1a] select-none">
      <AnimatedBackground />
      <Header onLogin={() => navigate('/admin/dashboard')} />

      <AnimatePresence mode="wait">
        
        {/* === IDLE SCREEN === */}
        {viewState === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(20px)" }}
            transition={{ duration: 0.5, ease: "circOut" }}
            className="flex flex-col items-center justify-center min-h-screen relative z-10 p-4"
          >
            <div className="flex flex-col items-center">
              <RealTimeClock />
              
              <div className="relative group">
                 {/* Pulse Ring */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[#FF9800] to-[#FFC107] rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                
                <button 
                  onClick={() => setViewState('active')}
                  className="relative px-12 py-6 bg-gradient-to-r from-[#FF9800] to-[#FFB74D] rounded-full shadow-[0px_10px_40px_-10px_rgba(255,152,0,0.4)] flex items-center gap-4 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#FF9800]">
                    <Scan className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xl font-bold text-white tracking-tight">Tap to Check-in</span>
                    <span className="text-sm text-white/90 font-medium">Have your QR code ready</span>
                  </div>
                </button>
              </div>
            </div>

            <PromoCards />
            
            <MenuQR />

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="absolute bottom-10 flex flex-col items-center gap-2"
            >
              <div className="w-1 h-12 rounded-full bg-gradient-to-b from-gray-200 to-transparent" />
              <span className="text-[10px] font-medium tracking-widest text-gray-400 uppercase">Touch screen to start</span>
            </motion.div>
          </motion.div>
        )}

        {/* === ACTIVE SCREEN === */}
        {viewState === 'active' && (
          <motion.div
            key="active"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="min-h-screen flex flex-col items-center justify-center p-4 z-20 relative"
          >
            {/* Back Button */}
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="absolute top-24 left-8 z-30"
            >
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleReset}
                className="w-12 h-12 rounded-full bg-white/60 hover:bg-white backdrop-blur shadow-sm border border-white/50"
              >
                <ArrowLeft className="h-6 w-6 text-gray-700" />
              </Button>
            </motion.div>

            {/* Main Card */}
            <div className="w-full max-w-[480px] mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 font-serif">Welcome Guest</h2>
                <p className="text-gray-500 mt-2">Identify yourself to begin</p>
              </div>

              <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-white/60 overflow-hidden p-2">
                
                {result ? (
                   // SUCCESS STATE
                  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                    <motion.div 
                      initial={{ scale: 0, rotate: -45 }} 
                      animate={{ scale: 1, rotate: 0 }}
                      type="spring"
                      className="mb-6 rounded-full bg-green-100 p-5 ring-4 ring-green-50 shadow-inner"
                    >
                      <CheckCircle className="h-16 w-16 text-green-600" strokeWidth={2.5} />
                    </motion.div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">Checked In!</h3>
                    <p className="text-sm text-gray-500 mb-6">Have a seat, we'll be right with you.</p>
                    
                    <div className="w-full bg-white/60 rounded-2xl border border-white/50 p-6 shadow-sm mb-6">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Customer</p>
                      <p className="text-xl text-[#FF9800] font-bold mb-4">{result.customerName}</p>
                      <div className="h-px w-full bg-gray-100 mb-4" />
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm">Service</span>
                        <span className="font-semibold text-gray-900 text-sm">
                          {result.serviceNames?.join(", ") || "Standard Service"}
                        </span>
                      </div>
                    </div>

                    <motion.button
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3, type: "spring" }}
                      onClick={handleNextCustomer}
                      className="w-full px-8 py-4 bg-gradient-to-r from-[#FF9800] to-[#FFB74D] rounded-2xl shadow-lg hover:shadow-xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] text-white font-bold text-base"
                    >
                      <Scan className="w-5 h-5" />
                      <span>Check-in Next Customer</span>
                    </motion.button>

                    <p className="text-xs text-gray-400 mt-4">Auto-return to home in 30 seconds</p>
                  </div>
                ) : (
                  // INTERACTION STATE
                  <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
                    <div className="px-6 pt-6 pb-2">
                      <TabsList className="grid w-full grid-cols-2 p-1 bg-gray-100/50 rounded-2xl h-14">
                        <TabsTrigger 
                          value="scan" 
                          className="rounded-xl h-12 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-[#FF9800] data-[state=active]:shadow-sm transition-all"
                        >
                          <QrCode className="w-4 h-4 mr-2" /> Scan Ticket
                        </TabsTrigger>
                        <TabsTrigger 
                          value="phone" 
                          className="rounded-xl h-12 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-[#FF9800] data-[state=active]:shadow-sm transition-all"
                        >
                          <Smartphone className="w-4 h-4 mr-2" /> Phone Number
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <div className="p-2 min-h-[420px] flex flex-col relative">
                      <TabsContent value="scan" className="mt-0 flex-1 flex flex-col items-center justify-center p-4">
                        <div className="relative w-full aspect-square max-w-[300px] bg-black rounded-[2rem] overflow-hidden shadow-2xl ring-4 ring-white/50">
                          {/* Force video to cover to prevent whitespace */}
                          <style>{`
                            #reader video { 
                              object-fit: cover !important; 
                              width: 100% !important; 
                              height: 100% !important; 
                              border-radius: 2rem;
                            }
                          `}</style>
                          <div id="reader" className="w-full h-full"></div>
                          
                          {cameraPermission && (
                            <>
                              {/* Switch Camera Button - Floating Top Right */}
                              <motion.button
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3, type: "spring" }}
                                onClick={async () => {
                                  await cleanupScanner();
                                  setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
                                }}
                                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-black/70 transition-all shadow-lg pointer-events-auto"
                              >
                                <SwitchCamera className="w-5 h-5" />
                              </motion.button>

                              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                {/* Visual Frame - Matches qrbox: 280 exactly */}
                                <div className="relative w-[280px] h-[280px]">
                                  {/* Orange Corner Frames */}
                                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#FF9800] rounded-tl-lg shadow-[0_0_15px_rgba(255,152,0,0.6)]"></div>
                                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#FF9800] rounded-tr-lg shadow-[0_0_15px_rgba(255,152,0,0.6)]"></div>
                                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#FF9800] rounded-bl-lg shadow-[0_0_15px_rgba(255,152,0,0.6)]"></div>
                                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#FF9800] rounded-br-lg shadow-[0_0_15px_rgba(255,152,0,0.6)]"></div>
                                  
                                  {/* Laser Scanning Line */}
                                  <div className="absolute top-[50%] left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-[#FF9800] to-transparent shadow-[0_0_20px_#FF9800] animate-[scan_2s_ease-in-out_infinite]" />
                                </div>
                              </div>
                            </>
                          )}

                          {!cameraPermission && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90 text-white p-6 text-center">
                              {cameraPermission === null ? (
                                <>
                                  <Loader2 className="h-10 w-10 animate-spin text-[#FF9800] mb-4" />
                                  <p className="text-base font-semibold mb-1">Activating Camera</p>
                                  <p className="text-xs text-gray-400">Please allow camera access when prompted</p>
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
                                  <p className="text-base font-semibold mb-1">Camera Access Denied</p>
                                  <p className="text-xs text-gray-400 mb-4">Please enable camera in your browser settings</p>
                                  <Button size="sm" variant="secondary" className="mt-2" onClick={() => window.location.reload()}>Try Again</Button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                        <p className="mt-6 text-sm font-medium text-gray-400">Point camera at your QR ticket</p>
                      </TabsContent>

                      <TabsContent value="phone" className="mt-0 flex-1 flex flex-col items-center justify-center px-8 h-full">
                        <form onSubmit={onPhoneSubmit} className="space-y-6 w-full -translate-y-[50px]">
                          <div className="space-y-4">
                            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider pl-1 block text-left">Enter Phone Number</label>
                            <Input
                              type="tel"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              placeholder="(555) 123-4567"
                              className="h-16 text-2xl text-center font-bold tracking-widest bg-gray-50 border-transparent focus:bg-white focus:border-[#FF9800]/50 rounded-2xl transition-all shadow-inner placeholder:text-gray-400 mt-[0px] mr-[0px] mb-[60px] ml-[0px]"
                              autoFocus
                            />
                          </div>
                          <Button 
                            type="submit" 
                            disabled={loading || phoneNumber.length < 4}
                            className="w-full h-14 rounded-2xl text-lg font-bold bg-gradient-to-r from-[#FF9800] to-[#FFB74D] hover:shadow-lg hover:shadow-orange-500/30 transition-all text-white border-0"
                          >
                            {loading ? <Loader2 className="animate-spin" /> : "Find Booking"}
                          </Button>
                        </form>
                      </TabsContent>
                    </div>
                  </Tabs>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes scan {
          0%, 100% { top: 20%; opacity: 0; }
          10% { opacity: 1; }
          50% { top: 80%; }
          90% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}