import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '/utils/supabase/info';

export interface Notification {
  id: string;
  type: 'membership' | 'promotion' | 'payment' | 'redeem';
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  metadata?: {
    code?: string;
    amount?: number;
    tier?: string;
    orderCode?: string;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  isPolling: boolean;
  togglePolling: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEY = 'admin-notifications';
const POLLING_INTERVAL = 15000; // 15 seconds
const MAX_NOTIFICATIONS = 50;
const NOTIFICATION_EXPIRY_DAYS = 7;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isPolling, setIsPolling] = useState(true);
  const previousCodesRef = useRef<string[]>([]);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check if current route is admin route
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Load notifications from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        const notifications = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        }));
        
        // Filter out expired notifications (older than 7 days)
        const now = new Date();
        const filtered = notifications.filter((n: Notification) => {
          const daysDiff = Math.floor((now.getTime() - n.timestamp.getTime()) / (1000 * 60 * 60 * 24));
          return daysDiff < NOTIFICATION_EXPIRY_DAYS;
        });
        
        setNotifications(filtered);
      } catch (e) {
        console.error('Failed to parse notifications from localStorage', e);
      }
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    }
  }, [notifications]);

  // Polling service for new redeem codes - ONLY on admin routes
  useEffect(() => {
    // ✅ ONLY poll when on admin routes AND polling is enabled
    if (isAdminRoute && isPolling) {
      console.log('🔔 [NOTIFICATIONS] Starting polling (admin route detected)');
      
      // Initial fetch
      checkForNewCodes();
      
      // Poll every 15 seconds
      pollingIntervalRef.current = setInterval(() => {
        checkForNewCodes();
      }, POLLING_INTERVAL);
    } else {
      // Stop polling when not on admin routes
      if (pollingIntervalRef.current) {
        console.log('🔕 [NOTIFICATIONS] Stopping polling (not on admin route)');
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [isAdminRoute, isPolling]);

  const checkForNewCodes = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/admin/redeem-codes`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        const codes = result.data;
        
        // ✅ FILTER: Only track PENDING codes (đã thanh toán, chờ sử dụng)
        const pendingCodes = codes.filter((c: any) => c.status === 'pending');
        const currentCodes = pendingCodes.map((c: any) => c.code);
        
        // Detect new codes (only if we have previous data)
        if (previousCodesRef.current.length > 0) {
          const newCodes = pendingCodes.filter((c: any) => 
            !previousCodesRef.current.includes(c.code)
          );
          
          // Add notification for each new PENDING code
          newCodes.forEach((code: any) => {
            addNotification({
              type: 'membership',
              title: 'New Membership Purchase!',
              description: `${code.membershipTier.toUpperCase()} - ${code.duration} months - $${code.amount}`,
              metadata: {
                code: code.code,
                amount: code.amount,
                tier: code.membershipTier,
                orderCode: code.merchantOrderCode,
              },
            });
            
            // Play sound
            playNotificationSound();
            
            // Show toast - ONLY when on admin routes
            if (isAdminRoute) {
              toast.success('🎉 New Membership Purchase!', {
                description: `${code.membershipTier.toUpperCase()} - ${code.duration} months - $${code.amount}`,
                duration: 5000,
              });
            }
          });
        }
        
        previousCodesRef.current = currentCodes;
      }
    } catch (error) {
      console.error('Failed to check for new codes:', error);
    }
  };

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.1;
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (e) {
      // Ignore audio errors
    }
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };

    setNotifications((prev) => {
      const updated = [newNotification, ...prev];
      // Keep only the latest MAX_NOTIFICATIONS
      return updated.slice(0, MAX_NOTIFICATIONS);
    });
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
  };

  const clearAll = () => {
    setNotifications([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const togglePolling = () => {
    setIsPolling((prev) => !prev);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
        isPolling,
        togglePolling,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}