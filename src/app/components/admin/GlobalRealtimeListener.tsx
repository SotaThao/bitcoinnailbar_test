import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../../lib/api-client';

/**
 * Global listener for New Bookings and Check-ins.
 * Uses Polling (every 10s) to track changes in the Appointments list.
 * Compares the current list with the previous list to detect:
 * 1. New Bookings (ID not in previous list)
 * 2. Status Changes (e.g., pending -> confirmed for Check-in)
 */
export function GlobalRealtimeListener() {
  // Store the previous state of appointments (ID -> Appointment)
  const previousAppointmentsMap = useRef<Map<string, any>>(new Map());
  const isFirstLoad = useRef(true);

  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const response = await apiClient.appointments.getAll();
        
        if (response.success && Array.isArray(response.data)) {
          const currentAppointments = response.data;
          const currentMap = new Map<string, any>();
          
          // Populate current map
          currentAppointments.forEach(appt => {
            currentMap.set(appt.id, appt);
          });

          // Initial Load: Just populate the map, don't notify
          if (isFirstLoad.current) {
            previousAppointmentsMap.current = currentMap;
            isFirstLoad.current = false;
            return;
          }

          const changes: { type: 'new' | 'update'; payload: any }[] = [];
          let newBookingDetected = false;

          // Check for NEW items and STATUS changes
          for (const [id, newAppt] of currentMap) {
            const oldAppt = previousAppointmentsMap.current.get(id);

            if (!oldAppt) {
              // 1. New Booking Detected
              console.log('⚡ [GlobalListener] New Booking:', newAppt);
              handleNewBooking(newAppt);
              changes.push({ type: 'new', payload: newAppt });
              newBookingDetected = true;
            } else if (oldAppt.status !== newAppt.status) {
              // 2. Status Change Detected
              console.log(`⚡ [GlobalListener] Status Change [${id}]: ${oldAppt.status} -> ${newAppt.status}`);
              
              if (newAppt.status === 'confirmed' && oldAppt.status === 'pending') {
                 handleCheckIn(newAppt);
              }
              
              changes.push({ type: 'update', payload: newAppt });
            }
          }

          // Update Reference
          previousAppointmentsMap.current = currentMap;

          // If any changes occurred, dispatch event with details
          if (changes.length > 0) {
            // Dispatch custom event with specific changes
            // This allows listeners to update state locally without re-fetching
            const event = new CustomEvent('booking-update', { 
              detail: { changes } 
            });
            window.dispatchEvent(event);
            
            // Trigger cross-tab updates (using localStorage event)
            if (newBookingDetected) {
               localStorage.setItem('latest_booking_timestamp', new Date().toISOString());
            } else {
               localStorage.setItem('last_update_timestamp', new Date().toISOString());
            }
          }
        }
      } catch (error) {
        console.error('❌ [GlobalListener] Polling Error:', error);
      }
    };

    // Helper: Handle New Booking Notification
    const handleNewBooking = (appt: any) => {
      const customerName = appt.customerName || appt.customer_name || 'New Customer';
      const serviceNames = appt.serviceNames || appt.service_names || [];
      const servicesText = Array.isArray(serviceNames) ? serviceNames.join(', ') : 'New Service';

      toast.success(`🎉 New Booking: ${customerName}`, {
        description: `Booked: ${servicesText}`,
        duration: 8000,
        action: {
          label: 'View',
          onClick: () => window.location.href = '/admin/appointments', 
        },
      });
      playNotificationSound();
    };

    // Helper: Handle Check-in Notification
    const handleCheckIn = (appt: any) => {
      const customerName = appt.customerName || appt.customer_name || 'Customer';
      
      toast.info(`✅ Checked In: ${customerName}`, {
        description: 'Customer has arrived at the kiosk.',
        duration: 8000,
        action: {
          label: 'View',
          onClick: () => window.location.href = '/admin/appointments', 
        },
      });
      playNotificationSound();
    };

    // Helper: Play Sound
    const playNotificationSound = () => {
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {}); 
      } catch (e) {}
    };

    // Initial check
    checkForUpdates();

    // Poll every 10 seconds
    const intervalId = setInterval(checkForUpdates, 10000);

    return () => clearInterval(intervalId);
  }, []);

  return null;
}
