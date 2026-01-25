import { useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  createClient,
  SupabaseClient,
} from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { useNotifications } from "@/app/context/NotificationContext";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SINGLETON: Supabase Client Instance
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
let supabaseInstance: SupabaseClient | null = null;

const getSupabaseClient = () => {
  if (!supabaseInstance) {
    console.log(
      "📡 [GlobalListener] Creating new Supabase client instance",
    );
    supabaseInstance = createClient(
      `https://${projectId}.supabase.co`,
      publicAnonKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      },
    );
  }
  return supabaseInstance;
};

/**
 * Global Realtime Listener for New Appointments
 * Subscribes to Supabase Realtime channel 'appointments'
 * Listens for 'appointment_created' events from backend
 */
export function GlobalRealtimeListener() {
  const { addNotification } = useNotifications();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    console.log(
      "📡 [GlobalListener] Initializing Supabase Realtime...",
    );

    // Get singleton Supabase client
    const supabase = getSupabaseClient();

    // Subscribe to 'appointments' channel
    const channel = supabase
      .channel("appointments")
      .on(
        "broadcast",
        { event: "appointment_created" },
        (payload) => {
          console.log(
            "⚡ [GlobalListener] Received appointment_created:",
            payload,
          );
          handleNewAppointment(payload.payload);
        },
      )
      .subscribe((status) => {
        console.log(
          "📡 [GlobalListener] Subscription status:",
          status,
        );

        if (status === "SUBSCRIBED") {
          console.log(
            "✅ [GlobalListener] Successfully subscribed to appointments channel",
          );
        } else if (status === "CHANNEL_ERROR") {
          console.error(
            "❌ [GlobalListener] Channel subscription error",
          );
        }
      });

    // Store channel reference
    channelRef.current = channel;

    // Helper: Handle New Appointment Notification
    const handleNewAppointment = (appointment: any) => {
      console.log(
        "🎉 [GlobalListener] New appointment notification:",
        appointment,
      );

      const customerName =
        appointment.customerName || "New Customer";
      const serviceNames = appointment.serviceNames || [];
      const servicesText = Array.isArray(serviceNames)
        ? serviceNames.join(", ")
        : "New Service";
      const appointmentTime = appointment.appointmentTime
        ? new Date(appointment.appointmentTime).toLocaleString(
            "en-US",
            {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            },
          )
        : "";

      // Toast notification
      toast.success(`🎉 New Booking: ${customerName}`, {
        description: `${servicesText}${appointmentTime ? ` • ${appointmentTime}` : ""}`,
        duration: 8000,
        action: {
          label: "View",
          onClick: () =>
            (window.location.href = "/admin/appointments"),
        },
      });

      // Add to notification bell
      addNotification({
        id: `appointment-${appointment.id}-${Date.now()}`,
        type: "appointment",
        title: "New Appointment",
        message: `${customerName} booked ${servicesText}`,
        timestamp: new Date().toISOString(),
        read: false,
        actionUrl: "/admin/appointments",
      });

      // Play notification sound
      playNotificationSound();

      // Trigger cross-tab update via localStorage
      localStorage.setItem(
        "latest_booking_timestamp",
        new Date().toISOString(),
      );

      // Dispatch custom event for other components
      const event = new CustomEvent("booking-update", {
        detail: { type: "new", appointment },
      });
      window.dispatchEvent(event);
    };

    // Helper: Play Sound
    const playNotificationSound = () => {
      try {
        const audio = new Audio(
          "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
        );
        audio.volume = 0.5;
        audio.play().catch(() => {
          console.log(
            "🔇 [GlobalListener] Sound play failed (user interaction required)",
          );
        });
      } catch (e) {
        console.error("❌ [GlobalListener] Sound error:", e);
      }
    };

    // Cleanup on unmount
    return () => {
      console.log(
        "🔌 [GlobalListener] Unsubscribing from realtime channel",
      );
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [addNotification]);

  return null;
}