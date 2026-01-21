import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Minimize2, Sparkles, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { projectId, publicAnonKey } from '@utils/supabase/info';
import { useLanguage } from '../context/LanguageContext';
import ReactMarkdown from 'react-markdown';
import { QRCodeSVG } from 'qrcode.react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isTicket?: boolean;
  ticketData?: any;
}

interface Service {
  id: string;
  name: string;
  regular_price?: number;
  price?: number;
  member_price?: number;
  description?: string;
  bookingCount: number;
  isOwnerRecommended: boolean;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const { t, language } = useLanguage();
  
  // Always start fresh - no localStorage persistence
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '' } // Will be set by useEffect with correct language
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [chatbotAvatar, setChatbotAvatar] = useState('');

  // Bubble state
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleText, setBubbleText] = useState("");

  // Hide chatbot when payment modal is open
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    const checkPaymentModal = () => {
      setIsPaymentModalOpen(document.body.classList.contains('payment-modal-open'));
    };

    // Check on mount and set up observer
    checkPaymentModal();
    
    const observer = new MutationObserver(checkPaymentModal);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  // Fetch chatbot avatar on mount
  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/settings/chatbot-avatar`,
          {
            headers: { Authorization: `Bearer ${publicAnonKey}` },
          }
        );
        const data = await response.json();
        if (data.success && data.data.avatar) {
          setChatbotAvatar(data.data.avatar);
        }
      } catch (error) {
        console.error('Failed to fetch chatbot avatar:', error);
        // Avatar will remain empty and show MessageCircle icon instead
      }
    };
    fetchAvatar();
  }, []);

  // Fetch services on mount
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/services`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        });
        const data = await response.json();
        if (data.success) {
          setServices(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch services for chatbot:', error);
      }
    };
    fetchServices();
  }, []);

  // Set welcome message on mount and language change
  useEffect(() => {
    setMessages([
      { 
        role: 'assistant', 
        content: t('chatbot.welcome')
      }
    ]);
  }, [language, t]);

  const bubbleMessages = t('chatbot.bubbles') as string[];

  useEffect(() => {
    if (isOpen) {
      setShowBubble(false);
      return;
    }

    // Don't run if no bubbles defined (safety check)
    if (!bubbleMessages || bubbleMessages.length === 0) return;

    let currentIndex = 0;

    const showBubbleSequence = () => {
      setBubbleText(bubbleMessages[currentIndex]);
      setShowBubble(true);
      currentIndex = (currentIndex + 1) % bubbleMessages.length;
      
      // Hide after 6 seconds
      setTimeout(() => {
        setShowBubble(false);
      }, 6000);
    };

    // Initial delay 3s
    const initialTimer = setTimeout(showBubbleSequence, 3000);

    // Repeat every 20s
    const intervalTimer = setInterval(showBubbleSequence, 20000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, [isOpen, language, bubbleMessages]); // Re-run when language changes

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Prepare messages for API (exclude the initial greeting if needed, or include it)
      const apiMessages = messages.concat({ role: 'user', content: userMessage }).map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ messages: apiMessages, language })
      });

      const data = await response.json();

      if (data.success) {
        // Check if there's ticket data (booking confirmed)
        if (data.ticketData) {
          console.log("🎫 [CHATBOT] Received ticketData from backend:", {
            hasQrCodeUrl: !!data.ticketData.qrCodeUrl,
            qrCodeUrl: data.ticketData.qrCodeUrl?.substring(0, 50) + "...",
            customerName: data.ticketData.customerName,
            appointmentTime: data.ticketData.appointmentTime
          });
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: data.message,
            isTicket: true,
            ticketData: data.ticketData
          }]);
        } else {
          setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
        }
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm having a bit of trouble connecting to the network right now. Please try again in a moment!" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && !isPaymentModalOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed right-4 bottom-[154px] md:bottom-24 z-50 w-[350px] md:w-[400px] h-[500px] bg-[#1a1f2e] border border-[#FF9800]/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden font-sans"
            style={{ boxShadow: '0 10px 40px -10px rgba(255, 152, 0, 0.3)' }}
          >
            {/* Header */}
            <div className="bg-[#0B0F19] p-4 flex items-center justify-between border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#FF9800] flex items-center justify-center bg-[#FF9800]">
                    {chatbotAvatar ? (
                      <ImageWithFallback src={chatbotAvatar} alt="AI Assistant" className="w-full h-full object-cover" />
                    ) : (
                      <MessageCircle className="w-6 h-6 text-black" />
                    )}
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0B0F19] rounded-full"></span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Bitcoin Nail Assistant</h3>
                  <p className="text-xs text-[#FF9800] flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> {t('chatbot.online')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white" onClick={() => setIsOpen(false)}>
                  <Minimize2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white" onClick={() => setIsOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#151923]">
              {messages.map((msg, index) => {
                // Debug log for ticket messages
                if (msg.isTicket) {
                  console.log(`🎫 [CHATBOT RENDER] Message ${index} is ticket:`, {
                    hasTicketData: !!msg.ticketData,
                    ticketData: msg.ticketData
                  });
                }
                
                return (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.isTicket && msg.ticketData ? (
                    // Ticket display
                    <div className="w-full max-w-[90%] bg-[#0B0F19] rounded-xl border border-[#FF9800]/30 overflow-hidden">
                      {/* Ticket Header */}
                      <div className="h-1 bg-gradient-to-r from-[#FF9800] to-[#F7931A]" />
                      
                      <div className="p-4 space-y-3">
                        {/* Success Message */}
                        <div className="text-center">
                          <div className="inline-flex items-center justify-center p-2 rounded-full bg-green-500/20 text-green-500 mb-2">
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <h4 className="text-[#FF9800] font-bold text-sm">Booking Confirmed!</h4>
                        </div>

                        {/* QR Code */}
                        {msg.ticketData.qrCodeUrl ? (
                          <div className="flex justify-center py-2">
                            <div className="bg-white p-3 rounded-lg">
                              <img src={msg.ticketData.qrCodeUrl} alt="QR Code" className="w-24 h-24" />
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-center py-2">
                            <div className="bg-white p-3 rounded-lg">
                              <QRCodeSVG 
                                value={JSON.stringify({
                                  id: msg.ticketData.id,
                                  phone: msg.ticketData.customerPhone,
                                  name: msg.ticketData.customerName,
                                  time: msg.ticketData.appointmentTime
                                })}
                                size={96}
                                level="Q"
                              />
                            </div>
                          </div>
                        )}

                        {/* Booking Details */}
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-400">ID:</span>
                            <span className="text-white font-mono">
                              #{msg.ticketData.id.split(':')[1]?.substring(0, 8).toUpperCase() || 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Name:</span>
                            <span className="text-white">{msg.ticketData.customerName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Phone:</span>
                            <span className="text-white">{msg.ticketData.customerPhone}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Service:</span>
                            <span className="text-white text-right">{msg.ticketData.serviceNames}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Time:</span>
                            <span className="text-white">
                              {new Date(msg.ticketData.appointmentTime).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-700">
                          Show this QR code at check-in
                        </div>
                      </div>

                      {/* AI Message below ticket */}
                      {msg.content && (
                        <div className="px-4 pb-4">
                          <div className="bg-[#2a3040] rounded-lg px-3 py-2 text-xs text-gray-100 border border-gray-700">
                            <ReactMarkdown
                              components={{
                                p: ({node, ...props}) => <p className="mb-1 last:mb-0" {...props} />,
                                strong: ({node, ...props}) => <span className="font-bold text-[#FF9800]" {...props} />,
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Regular message
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[#FF9800] text-black font-medium rounded-tr-none'
                          : 'bg-[#2a3040] text-gray-100 rounded-tl-none border border-gray-700'
                      }`}
                    >
                      <ReactMarkdown
                        components={{
                          ul: ({node, ...props}) => <ul className="list-disc pl-4 space-y-1 my-2" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal pl-4 space-y-1 my-2" {...props} />,
                          li: ({node, ...props}) => <li className="pl-1" {...props} />,
                          strong: ({node, ...props}) => <span className={`font-bold ${msg.role === 'assistant' ? 'text-[#FF9800]' : ''}`} {...props} />,
                          p: ({node, ...props}) => <p className="mb-2 last:mb-0 whitespace-pre-wrap" {...props} />,
                          a: ({node, ...props}) => <a className="underline hover:text-blue-300" target="_blank" rel="noopener noreferrer" {...props} />,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              );
              })}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#2a3040] rounded-2xl rounded-tl-none px-4 py-3 border border-gray-700 flex items-center gap-1">
                    <motion.div
                      className="w-2 h-2 bg-[#FF9800] rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-[#FF9800] rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-[#FF9800] rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                    />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-[#0B0F19] border-t border-gray-800">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('chatbot.input_placeholder')}
                  className="bg-[#151923] border-gray-700 text-white focus-visible:ring-[#FF9800] placeholder:text-gray-500"
                />
                <Button 
                  onClick={handleSend} 
                  disabled={!input.trim() || isLoading}
                  className="bg-[#FF9800] hover:bg-[#F57C00] text-black"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBubble && !isOpen && !isPaymentModalOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8, x: 0 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            className="fixed right-6 bottom-[178px] md:bottom-24 z-50 bg-white text-black px-4 py-3 rounded-xl shadow-[0_0_20px_rgba(255,152,0,0.3)] border-2 border-[#FF9800] max-w-[200px] pointer-events-none"
          >
            <p className="text-sm font-bold font-serif leading-tight">{bubbleText}</p>
            {/* Speech Bubble Tail */}
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white transform rotate-45 border-r-2 border-b-2 border-[#FF9800]"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      {!isPaymentModalOpen && (
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed right-6 bottom-[106px] md:bottom-6 z-50 w-16 h-16 rounded-full bg-[#FF9800] shadow-lg flex items-center justify-center overflow-hidden border-4 border-[#FF9800]/50"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: chatbotAvatar ? 1 : 0, 
            scale: chatbotAvatar ? 1 : 0,
            boxShadow: chatbotAvatar ? ["0 0 0 0 rgba(255, 152, 0, 0.7)", "0 0 0 20px rgba(255, 152, 0, 0)"] : "0 0 0 0 rgba(255, 152, 0, 0)",
          }}
          transition={{
            boxShadow: {
              duration: 1.5,
              repeat: Infinity,
              }
          }}
        >
          {chatbotAvatar ? (
            <div className="relative w-full h-full">
              <ImageWithFallback 
                src={chatbotAvatar} 
                alt="Chat" 
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <MessageCircle className="w-8 h-8 text-black" />
          )}
        </motion.button>
      )}
    </>
  );
}