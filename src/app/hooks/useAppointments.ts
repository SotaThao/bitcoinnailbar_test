/**
 * Custom hook for managing appointments data
 * Provides loading state, error handling, and CRUD operations
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../lib/api-client';
import type { Appointment } from '../lib/admin-types';

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAppointments = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError(null);
    }

    try {
      const response = await apiClient.appointments.getAll();

      if (response.success && response.data) {
        // Sort by appointment time (newest first)
        const sorted = response.data.sort((a: any, b: any) =>
          new Date(b.appointmentTime).getTime() - new Date(a.appointmentTime).getTime()
        );
        setAppointments(sorted);
      } else {
        const errorMsg = response.error || 'Failed to load appointments';
        if (!silent) setError(errorMsg);
        // Only show toast error if not silent, to avoid nagging background errors
        if (!silent) toast.error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'An error occurred while loading appointments';
      if (!silent) setError(errorMsg);
      if (!silent) toast.error(errorMsg);
      console.error('Error loading appointments:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  const updateAppointmentStatus = useCallback(async (appointmentId: string, newStatus: string) => {
    try {
      const response = await apiClient.appointments.update(appointmentId, { status: newStatus });

      if (response.success) {
        // Update local state immediately for optimistic UI
        setAppointments((prev) =>
          prev.map((appt) =>
            appt.id === appointmentId ? { ...appt, status: newStatus as any } : appt
          )
        );
        toast.success(`Appointment ${newStatus}`);
        return true;
      } else {
        toast.error(response.error || 'Failed to update appointment');
        return false;
      }
    } catch (error: any) {
      console.error('Error updating appointment:', error);
      toast.error('An error occurred while updating appointment');
      return false;
    }
  }, []);

  useEffect(() => {
    // Initial load (show spinner)
    loadAppointments();

    // Listen for global polling updates (from GlobalRealtimeListener)
    const handleBookingUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      
      // If event has specific changes, apply them locally to avoid re-fetch
      if (customEvent.detail && customEvent.detail.changes) {
        console.log('⚡ [useAppointments] Applying local updates:', customEvent.detail.changes);
        
        setAppointments((prev) => {
          let newPrev = [...prev];
          
          customEvent.detail.changes.forEach((change: any) => {
            if (change.type === 'new') {
              // Add if not exists
              if (!newPrev.find(p => p.id === change.payload.id)) {
                newPrev.unshift(change.payload); 
              }
            } else if (change.type === 'update') {
              // Update existing
              newPrev = newPrev.map(p => p.id === change.payload.id ? change.payload : p);
            }
          });

          // Re-sort by appointment time (newest first)
          return newPrev.sort((a: any, b: any) => 
            new Date(b.appointmentTime).getTime() - new Date(a.appointmentTime).getTime()
          );
        });
      } else {
        // Fallback: Silent reload
        console.log('⚡ [useAppointments] Generic update signal, silent reloading...');
        loadAppointments(true);
      }
    };

    // Listen for local storage changes (cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'latest_booking_timestamp' || e.key === 'last_update_timestamp') {
        console.log('⚡ [useAppointments] Storage change detected, silent reloading...');
        loadAppointments(true);
      }
    };

    window.addEventListener('booking-update', handleBookingUpdate);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('booking-update', handleBookingUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadAppointments]);

  return {
    appointments,
    loading,
    error,
    refetch: () => loadAppointments(false), // Manual refetch shows spinner
    updateStatus: updateAppointmentStatus,
  };
}
