"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc,
  getDocs
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/auth-context';
import { Booking, DailyAvailability, SUNBEDS, TIME_SLOTS } from '@/types/booking';

export function useBookings() {
  const { user } = useAuth();
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [availability, setAvailability] = useState<{ [date: string]: DailyAvailability }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const unsubscribeRefs = useRef<(() => void)[]>([]);

  // Load user's bookings
  useEffect(() => {
    if (!user) {
      setUserBookings([]);
      return;
    }

    setLoading(true);
    setError(null);

    // Use a simple query that only requires a single field index
    const bookingsQuery = query(
      collection(db, 'bookings'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(bookingsQuery, (snapshot) => {
      const bookings: Booking[] = [];
      snapshot.forEach((doc) => {
        const booking = { id: doc.id, ...doc.data() } as Booking;
        // Filter out cancelled bookings and sort in application code
        if (booking.status !== 'cancelled') {
          bookings.push(booking);
        }
      });
      
      // Sort bookings by date and time in application code
      bookings.sort((a, b) => {
        if (a.date !== b.date) {
          return b.date.localeCompare(a.date); // Newest date first
        }
        return b.time.localeCompare(a.time); // Latest time first
      });
      
      setUserBookings(bookings);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error('Error loading bookings:', err);
      console.error('Error details:', err.code, err.message);
      
      // Provide more user-friendly error messages
      let errorMessage = 'Failed to load bookings';
      if (err.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please check your access rights.';
      } else if (err.code === 'failed-precondition') {
        errorMessage = 'Database index missing. Using simplified query.';
      }
      
      setError(errorMessage);
      setLoading(false);
    });

    unsubscribeRefs.current.push(unsubscribe);
    return () => {
      try {
        unsubscribe();
      } catch (error) {
        console.error('Error unsubscribing from bookings:', error);
      }
    };
  }, [user]);

  // Load availability for a specific date
  const loadAvailability = async (date: string) => {
    if (availability[date]) return; // Already loaded

    try {
      setLoading(true);
      
      // Query all bookings for the specific date
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('date', '==', date),
        where('status', '==', 'confirmed')
      );

      const snapshot = await getDocs(bookingsQuery);
      const dayBookings: Booking[] = [];
      snapshot.forEach((doc) => {
        dayBookings.push({ id: doc.id, ...doc.data() } as Booking);
      });

      // Create availability structure
      const dayAvailability: DailyAvailability = {
        date,
        sunbedAvailability: {}
      };

      // Initialize all sunbeds and time slots as available
      SUNBEDS.forEach(sunbed => {
        dayAvailability.sunbedAvailability[sunbed.id] = {};
        TIME_SLOTS.forEach(time => {
          dayAvailability.sunbedAvailability[sunbed.id][time] = true;
        });
      });

      // Mark booked slots as unavailable
      dayBookings.forEach(booking => {
        if (dayAvailability.sunbedAvailability[booking.sunbedId]) {
          dayAvailability.sunbedAvailability[booking.sunbedId][booking.time] = false;
        }
      });

      setAvailability(prev => ({
        ...prev,
        [date]: dayAvailability
      }));

      setError(null);
    } catch (err) {
      console.error('Error loading availability:', err);
      setError('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  // Setup real-time listener for a specific date
  const setupAvailabilityListener = useCallback((date: string) => {
    const bookingsQuery = query(
      collection(db, 'bookings'),
      where('date', '==', date),
      where('status', '==', 'confirmed')
    );

    return onSnapshot(bookingsQuery, (snapshot) => {
      const dayBookings: Booking[] = [];
      snapshot.forEach((doc) => {
        dayBookings.push({ id: doc.id, ...doc.data() } as Booking);
      });

      // Create availability structure
      const dayAvailability: DailyAvailability = {
        date,
        sunbedAvailability: {}
      };

      // Initialize all sunbeds and time slots as available
      SUNBEDS.forEach(sunbed => {
        dayAvailability.sunbedAvailability[sunbed.id] = {};
        TIME_SLOTS.forEach(time => {
          dayAvailability.sunbedAvailability[sunbed.id][time] = true;
        });
      });

      // Mark booked slots as unavailable
      dayBookings.forEach(booking => {
        if (dayAvailability.sunbedAvailability[booking.sunbedId]) {
          dayAvailability.sunbedAvailability[booking.sunbedId][booking.time] = false;
        }
      });

      setAvailability(prev => ({
        ...prev,
        [date]: dayAvailability
      }));
    }, (err) => {
      console.error('Error in availability listener:', err);
      console.error('Error details:', err.code, err.message);
      setError(`Failed to sync availability: ${err.message}`);
    });
  }, []); // Empty dependency array makes this function stable

  // Create a new booking
  const createBooking = async (
    sunbedId: string, 
    date: string, 
    time: string, 
    duration: number = 15,
    skipAvailabilityCheck: boolean = false
  ): Promise<boolean> => {
    if (!user) {
      setError('User not authenticated');
      return false;
    }

    // Check if slot is still available (skip for immediate bookings like scan sessions)
    if (!skipAvailabilityCheck) {
      const dayAvailability = availability[date];
      if (!dayAvailability || !dayAvailability.sunbedAvailability[sunbedId]?.[time]) {
        setError('Time slot is no longer available');
        return false;
      }
    }

    const sunbed = SUNBEDS.find(s => s.id === sunbedId);
    if (!sunbed) {
      setError('Invalid sunbed selected');
      return false;
    }

    try {
      setLoading(true);

      // Always check for conflicts in Firestore before creating booking
      const conflictQuery = query(
        collection(db, 'bookings'),
        where('date', '==', date),
        where('time', '==', time),
        where('sunbedId', '==', sunbedId),
        where('status', '==', 'confirmed')
      );
      
      const conflictSnapshot = await getDocs(conflictQuery);
      if (!conflictSnapshot.empty) {
        setError('Time slot is already booked by another user');
        return false;
      }

      const booking: Omit<Booking, 'id'> = {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userEmail: user.email || '',
        sunbedId,
        sunbedName: sunbed.name,
        date,
        time,
        duration,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'bookings'), booking);
      setError(null);
      return true;
    } catch (err) {
      console.error('Error creating booking:', err);
      setError('Failed to create booking');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Cancel a booking
  const cancelBooking = async (bookingId: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: 'cancelled',
        updatedAt: new Date().toISOString(),
      });

      setError(null);
      return true;
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError('Failed to cancel booking');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get available time slots for a specific sunbed and date
  const getAvailableSlots = useCallback((sunbedId: string, date: string): string[] => {
    const dayAvailability = availability[date];
    if (!dayAvailability) return [];

    const sunbedAvailability = dayAvailability.sunbedAvailability[sunbedId];
    if (!sunbedAvailability) return [];

    return TIME_SLOTS.filter(time => sunbedAvailability[time] === true);
  }, [availability]);

  // Get upcoming bookings for user
  const getUpcomingBookings = useCallback((): Booking[] => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${Math.floor(now.getMinutes() / 15) * 15}`.padStart(5, '0');

    return userBookings.filter(booking => {
      if (booking.status !== 'confirmed') return false;
      if (booking.date > today) return true;
      if (booking.date === today && booking.time >= currentTime) return true;
      return false;
    });
  }, [userBookings]);

  // Check if user can book (has remaining hours)
  const canUserBook = (userHoursRemaining: number): boolean => {
    return userHoursRemaining >= 0.25; // 15 minutes = 0.25 hours
  };

  // Cleanup listeners on unmount and sign out
  useEffect(() => {
    const cleanup = () => {
      unsubscribeRefs.current.forEach(unsubscribe => {
        try {
          unsubscribe();
        } catch (error) {
          console.error('Error cleaning up booking listener:', error);
        }
      });
      unsubscribeRefs.current = [];
      setUserBookings([]);
      setAvailability({});
      setError(null);
    };

    const handleSignOut = () => {
      cleanup();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auth:signout', handleSignOut);
    }

    return () => {
      cleanup();
      if (typeof window !== 'undefined') {
        window.removeEventListener('auth:signout', handleSignOut);
      }
    };
  }, []); // Empty dependency array prevents infinite re-renders

  return {
    userBookings,
    availability,
    loading,
    error,
    loadAvailability,
    setupAvailabilityListener,
    createBooking,
    cancelBooking,
    getAvailableSlots,
    getUpcomingBookings,
    canUserBook,
  };
}