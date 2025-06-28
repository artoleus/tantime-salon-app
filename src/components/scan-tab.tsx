"use client";

import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { QrCode, Video, AlertTriangle, Bed, Star, Users } from "lucide-react";
import { SUNBEDS } from "@/types/booking";
import { useBookings } from "@/hooks/use-bookings";
import { TIME_SLOTS } from "@/types/booking";

type ScanTabProps = {
  onScanSuccess: (hoursDeducted: number) => void;
  userBalance: number;
  onInsufficientFunds: () => void;
};

export function ScanTab({ onScanSuccess, userBalance, onInsufficientFunds }: ScanTabProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | null
  >(null);
  const [selectedSunbed, setSelectedSunbed] = useState<string>("");
  
  const { createBooking, loading: bookingLoading, userBookings, getAvailableSlots, setupAvailabilityListener, loadAvailability } = useBookings();
  
  // Helper function to find the best time slot to book
  const findBestTimeSlot = (currentTime: Date) => {
    const currentMinutes = currentTime.getMinutes();
    const currentHour = currentTime.getHours();
    
    // If within 5 minutes of a slot, use that slot (e.g., 11:06 can use 11:00 or 11:15)
    const slots15Min = [0, 15, 30, 45];
    
    for (const slot of slots15Min) {
      const timeDiff = Math.abs(currentMinutes - slot);
      if (timeDiff <= 5 || (slot === 0 && currentMinutes >= 55)) {
        // If we're close to the 00 slot but it's past the hour, use next hour
        if (slot === 0 && currentMinutes >= 55) {
          return `${(currentHour + 1).toString().padStart(2, '0')}:00`;
        }
        return `${currentHour.toString().padStart(2, '0')}:${slot.toString().padStart(2, '0')}`;
      }
    }
    
    // If not within 5 minutes, find the next available slot
    const nextSlot = slots15Min.find(slot => slot > currentMinutes);
    if (nextSlot !== undefined) {
      return `${currentHour.toString().padStart(2, '0')}:${nextSlot.toString().padStart(2, '0')}`;
    } else {
      // Next slot is in the next hour
      return `${(currentHour + 1).toString().padStart(2, '0')}:00`;
    }
  };
  
  // Get the time slot that would be booked
  const getBookingTimeSlot = () => {
    const now = new Date();
    return findBestTimeSlot(now);
  };

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("Camera API not supported in this browser.");
        setHasCameraPermission(false);
        toast({
          variant: "destructive",
          title: "Unsupported Browser",
          description: "Your browser does not support camera access.",
        });
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
        setHasCameraPermission(false);
        toast({
          variant: "destructive",
          title: "Camera Access Denied",
          description:
            "Please enable camera permissions in your browser settings to use this feature.",
        });
      }
    };

    getCameraPermission();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [toast]);

  // Helper function to check if user has existing booking for this time
  const hasExistingBooking = (date: string, timeSlot: string, sunbedId: string) => {
    return userBookings.some(booking => 
      booking.date === date && 
      booking.time === timeSlot && 
      booking.sunbedId === sunbedId &&
      booking.status === 'confirmed'
    );
  };

  const handleLogin = async () => {
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

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <QrCode className="text-primary" />
          Scan to Login
        </CardTitle>
        <CardDescription>
          Point your camera at the QR code on the tanning booth to start your
          session. Balance: {(userBalance * 60).toFixed(0)} minutes ({userBalance.toFixed(2)} hours)
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-6">
        {/* Sunbed Selection */}
        <div className="w-full max-w-md space-y-3">
          <Label className="text-base font-semibold">Select Sunbed:</Label>
          <RadioGroup value={selectedSunbed} onValueChange={setSelectedSunbed}>
            <div className="grid grid-cols-2 gap-3">
              {SUNBEDS.map((sunbed) => (
                <div
                  key={sunbed.id}
                  className={`flex items-center space-x-2 p-3 rounded-lg border transition-all ${
                    selectedSunbed === sunbed.id 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  <RadioGroupItem value={sunbed.id} id={sunbed.id} />
                  <Label htmlFor={sunbed.id} className="flex items-center gap-2 cursor-pointer flex-1">
                    {sunbed.type === 'premium' ? (
                      <Star className="h-4 w-4 text-yellow-500" />
                    ) : sunbed.type === 'standing' ? (
                      <Users className="h-4 w-4 text-blue-500" />
                    ) : (
                      <Bed className="h-4 w-4 text-primary" />
                    )}
                    <span className="text-sm font-medium">{sunbed.name}</span>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        <div className="w-full max-w-md p-2 border-dashed border-2 rounded-lg relative aspect-video flex items-center justify-center bg-secondary/30">
          <video
            ref={videoRef}
            className="w-full aspect-video rounded-md"
            autoPlay
            muted
            playsInline
          />
          {hasCameraPermission === false && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-background/80 rounded-md">
              <Video className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="font-semibold">Camera Not Available</p>
              <p className="text-sm text-muted-foreground">
                Check permissions and try again.
              </p>
            </div>
          )}
        </div>
        {hasCameraPermission === false && (
          <Alert variant="destructive" className="w-full max-w-md">
            <AlertTitle>Camera Access Required</AlertTitle>
            <AlertDescription>
              Please allow camera access in your browser to use this feature.
            </AlertDescription>
          </Alert>
        )}
        {userBalance < 0.25 && (
          <Alert variant="destructive" className="w-full max-w-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Insufficient Balance</AlertTitle>
            <AlertDescription>
              You need at least 15 minutes (0.25 hours) to start a session. Purchase more time on the Profile tab.
            </AlertDescription>
          </Alert>
        )}
        {userBalance >= 0.25 && userBalance < 1 && (
          <Alert className="w-full max-w-md border-yellow-500 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <AlertTitle className="text-yellow-700">Low Balance Warning</AlertTitle>
            <AlertDescription className="text-yellow-600">
              You have less than 1 hour remaining. Consider purchasing more time for future sessions.
            </AlertDescription>
          </Alert>
        )}
        {!selectedSunbed && userBalance >= 0.25 && (
          <Alert className="w-full max-w-md border-blue-500 bg-blue-50">
            <QrCode className="h-4 w-4 text-blue-500" />
            <AlertTitle className="text-blue-700">Select Your Sunbed</AlertTitle>
            <AlertDescription className="text-blue-600">
              Choose which sunbed you want to use for your 15-minute session. Will book time slot: {getBookingTimeSlot()}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button
          size="lg"
          className="w-full font-headline text-lg"
          onClick={handleLogin}
          disabled={!hasCameraPermission || userBalance < 0.25 || !selectedSunbed || bookingLoading}
        >
          {bookingLoading ? 'Starting Session...' :
           userBalance < 0.25 ? 'Insufficient Balance' :
           !selectedSunbed ? 'Select a Sunbed' :
           'Start 15-Minute Session'}
        </Button>
      </CardFooter>
    </Card>
  );
}
