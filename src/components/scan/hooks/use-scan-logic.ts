"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useBookings } from "@/hooks/use-bookings";
import { SUNBEDS } from "@/types/booking";
import { findBestTimeSlot, getCurrentBookingTimeSlot } from "../utils/time-slot-utils";

interface UseScanLogicProps {
  onScanSuccess: (hoursDeducted: number) => void;
  userBalance: number;
  onInsufficientFunds: () => void;
}

export function useScanLogic({ onScanSuccess, userBalance, onInsufficientFunds }: UseScanLogicProps) {
  const { toast } = useToast();
  const [selectedSunbed, setSelectedSunbed] = useState<string>("");
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  
  const { 
    createBooking, 
    loading: bookingLoading, 
    userBookings, 
    loadAvailability 
  } = useBookings();

  // Helper function to check if user has existing booking for this time
  const hasExistingBooking = (date: string, timeSlot: string, sunbedId: string) => {
    return userBookings.some(booking => 
      booking.date === date && 
      booking.time === timeSlot && 
      booking.sunbedId === sunbedId &&
      booking.status === 'confirmed'
    );
  };

  const handleSessionStart = async () => {
    const hoursUsed = 0.25; // 15 minutes session
    
    // Check if sunbed is selected
    if (!selectedSunbed) {
      toast({
        variant: "destructive",
        title: "No Sunbed Selected",
        description: "Please select a sunbed before starting your session.",
      });
      return;
    }
    
    // Check if user has sufficient balance
    if (userBalance < hoursUsed) {
      toast({
        variant: "destructive",
        title: "Insufficient Balance",
        description: `You need ${(hoursUsed * 60).toFixed(0)} minutes but only have ${(userBalance * 60).toFixed(0)} minutes. Redirecting to purchase options...`,
      });
      onInsufficientFunds();
      return;
    }
    
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const bestTimeSlot = findBestTimeSlot(now);
    
    // Check if user already has a booking for this slot
    if (hasExistingBooking(currentDate, bestTimeSlot, selectedSunbed)) {
      toast({
        title: "Session Already Booked!",
        description: `You already have a booking for ${SUNBEDS.find(s => s.id === selectedSunbed)?.name} at ${bestTimeSlot}. Starting your pre-booked session.`,
      });
      onScanSuccess(hoursUsed);
      setSelectedSunbed(""); // Reset selection
      return;
    }
    
    try {
      // Load availability for the current date to ensure we have up-to-date data
      await loadAvailability(currentDate);
      
      console.log('Attempting to book:', {
        sunbed: selectedSunbed,
        date: currentDate,
        time: bestTimeSlot,
        duration: 15
      });
      
      const bookingSuccess = await createBooking(selectedSunbed, currentDate, bestTimeSlot, 15, true);
      
      if (bookingSuccess) {
        onScanSuccess(hoursUsed);
        const sunbed = SUNBEDS.find(s => s.id === selectedSunbed);
        
        // Calculate session end time
        const [hours, minutes] = bestTimeSlot.split(':').map(Number);
        const sessionStart = new Date(now);
        sessionStart.setHours(hours, minutes, 0, 0);
        const sessionEnd = new Date(sessionStart.getTime() + 15 * 60000);
        
        toast({
          title: "Session Started!",
          description: `${sunbed?.name} booked for ${bestTimeSlot}-${sessionEnd.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}. ${hoursUsed * 60} minutes deducted.`,
        });
        setSelectedSunbed(""); // Reset selection
      } else {
        toast({
          variant: "destructive",
          title: "Booking Failed",
          description: `Could not book ${SUNBEDS.find(s => s.id === selectedSunbed)?.name} for ${bestTimeSlot}. This slot may be taken.`,
        });
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        variant: "destructive",
        title: "Session Start Failed",
        description: "There was an error starting your session. Please try again.",
      });
    }
  };

  const getButtonText = () => {
    if (bookingLoading) return 'Starting Session...';
    if (userBalance < 0.25) return 'Insufficient Balance';
    if (!selectedSunbed) return 'Select a Sunbed';
    return 'Start 15-Minute Session';
  };

  const isButtonDisabled = () => {
    return !hasCameraPermission || userBalance < 0.25 || !selectedSunbed || bookingLoading;
  };

  return {
    // State
    selectedSunbed,
    hasCameraPermission,
    bookingLoading,
    
    // Actions
    setSelectedSunbed,
    setHasCameraPermission,
    handleSessionStart,
    getButtonText,
    isButtonDisabled,
    getBookingTimeSlot: getCurrentBookingTimeSlot,
  };
}