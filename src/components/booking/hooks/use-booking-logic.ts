"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useBookings } from "@/hooks/use-bookings";
import { useUserData } from "@/hooks/use-user-data";
import { SUNBEDS } from "@/types/booking";

export function useBookingLogic() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSunbed, setSelectedSunbed] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [activeListener, setActiveListener] = useState<(() => void) | null>(null);
  
  const { toast } = useToast();
  const { userData } = useUserData();
  const {
    userBookings,
    availability,
    loading,
    error,
    setupAvailabilityListener,
    createBooking,
    cancelBooking,
    getAvailableSlots,
    getUpcomingBookings,
    canUserBook,
  } = useBookings();

  const dateString = selectedDate?.toISOString().split('T')[0] || '';
  const upcomingBookings = getUpcomingBookings();

  // Setup real-time listener for selected date
  useEffect(() => {
    if (dateString && selectedDate) {
      // Cleanup previous listener
      if (activeListener) {
        activeListener();
        setActiveListener(null);
      }

      // Setup new listener
      const unsubscribe = setupAvailabilityListener(dateString);
      setActiveListener(() => unsubscribe);

      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [dateString]); // Removed setupAvailabilityListener to prevent infinite loops

  // Reset selections when date changes
  useEffect(() => {
    setSelectedTime("");
  }, [dateString]);

  const handleBooking = async () => {
    if (!selectedDate || !selectedSunbed || !selectedTime) {
      toast({
        title: "Incomplete Booking",
        description: "Please select a sunbed, date, and time.",
        variant: "destructive",
      });
      return;
    }

    if (!userData || !canUserBook(userData.remaining)) {
      toast({
        title: "Insufficient Hours",
        description: "You need at least 0.25 hours (15 minutes) to book a session.",
        variant: "destructive",
      });
      return;
    }

    const success = await createBooking(selectedSunbed, dateString, selectedTime);
    
    if (success) {
      const sunbed = SUNBEDS.find(s => s.id === selectedSunbed);
      toast({
        title: "Booking Confirmed!",
        description: `Your ${sunbed?.name} is booked for ${selectedDate.toLocaleDateString()} at ${selectedTime}.`,
      });
      setSelectedTime("");
      setSelectedSunbed("");
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    const success = await cancelBooking(bookingId);
    if (success) {
      toast({
        title: "Booking Cancelled",
        description: "Your booking has been successfully cancelled.",
      });
    }
  };

  const getAvailableTimesForSunbed = useCallback((sunbedId: string): string[] => {
    return getAvailableSlots(sunbedId, dateString);
  }, [getAvailableSlots, dateString]);

  const getTimeSlotStatus = useCallback((time: string, sunbedId: string): 'available' | 'booked' | 'past' => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${Math.floor(now.getMinutes() / 15) * 15}`.padStart(5, '0');
    
    // Check if time is in the past for today
    if (dateString === today && time <= currentTime) {
      return 'past';
    }

    const dayAvailability = availability[dateString];
    if (!dayAvailability) return 'available';

    const isAvailable = dayAvailability.sunbedAvailability[sunbedId]?.[time];
    return isAvailable ? 'available' : 'booked';
  }, [dateString, availability]);

  const availableSlotsCount = useMemo(() => {
    if (!selectedSunbed) return 0;
    return getAvailableTimesForSunbed(selectedSunbed).length;
  }, [selectedSunbed, getAvailableTimesForSunbed]);

  const canBook = userData ? canUserBook(userData.remaining) : false;

  return {
    // State
    selectedDate,
    selectedSunbed,
    selectedTime,
    userData,
    upcomingBookings,
    loading,
    error,
    availableSlotsCount,
    canBook,
    
    // Actions
    setSelectedDate,
    setSelectedSunbed,
    setSelectedTime,
    handleBooking,
    handleCancelBooking,
    getTimeSlotStatus,
  };
}