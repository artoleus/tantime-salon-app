"use client";

import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { 
  CheckCircle,
  Loader2,
  AlertCircle
} from "lucide-react";

interface BookingConfirmationProps {
  selectedDate: Date | undefined;
  selectedSunbed: string;
  selectedTime: string;
  loading: boolean;
  canUserBook: boolean;
  onBooking: () => void;
}

export function BookingConfirmation({
  selectedDate,
  selectedSunbed,
  selectedTime,
  loading,
  canUserBook,
  onBooking,
}: BookingConfirmationProps) {
  const isFormComplete = selectedDate && selectedSunbed && selectedTime;
  const isDisabled = !isFormComplete || loading || !canUserBook;

  return (
    <CardFooter>
      <Button 
        size="lg" 
        className="w-full font-headline text-lg" 
        onClick={onBooking}
        disabled={isDisabled}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Booking...
          </>
        ) : (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Book Session (15 min)
          </>
        )}
      </Button>
    </CardFooter>
  );
}