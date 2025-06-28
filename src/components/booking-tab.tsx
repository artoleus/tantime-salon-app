"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sun, 
  Loader2,
  AlertCircle
} from "lucide-react";
import { SunbedSelector } from "@/components/booking/sunbed-selector";
import { DateTimeSelector } from "@/components/booking/date-time-selector";
import { BookingConfirmation } from "@/components/booking/booking-confirmation";
import { UpcomingBookings } from "@/components/booking/upcoming-bookings";
import { useBookingLogic } from "@/components/booking/hooks/use-booking-logic";

export function BookingTab() {
  const {
    selectedDate,
    selectedSunbed,
    selectedTime,
    userData,
    upcomingBookings,
    loading,
    error,
    availableSlotsCount,
    canBook,
    setSelectedDate,
    setSelectedSunbed,
    setSelectedTime,
    handleBooking,
    handleCancelBooking,
    getTimeSlotStatus,
  } = useBookingLogic();

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading booking system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="book" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="book">Book Session</TabsTrigger>
          <TabsTrigger value="upcoming">My Bookings ({upcomingBookings.length})</TabsTrigger>
        </TabsList>

        {/* Booking Tab */}
        <TabsContent value="book" className="space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center gap-2">
                <Sun className="text-primary" />
                Book a Tanning Session
              </CardTitle>
              <CardDescription>
                Choose your sunbed, date, and time. You have {userData.remaining.toFixed(1)} hours remaining.
              </CardDescription>
              {!canBook && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">You need at least 0.25 hours to book a session. Please purchase more hours.</span>
                </div>
              )}
            </CardHeader>
            
            <CardContent className="grid gap-8 lg:grid-cols-2">
              {/* Left Column - Sunbed Selection */}
              <div className="space-y-6">
                <SunbedSelector
                  selectedSunbed={selectedSunbed}
                  onSunbedChange={setSelectedSunbed}
                />
              </div>

              {/* Right Column - Date and Time Selection */}
              <div className="space-y-6">
                <DateTimeSelector
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  selectedSunbed={selectedSunbed}
                  onDateChange={setSelectedDate}
                  onTimeChange={setSelectedTime}
                  getTimeSlotStatus={getTimeSlotStatus}
                  availableSlotsCount={availableSlotsCount}
                  loading={loading}
                />
              </div>
            </CardContent>

            <BookingConfirmation
              selectedDate={selectedDate}
              selectedSunbed={selectedSunbed}
              selectedTime={selectedTime}
              loading={loading}
              canUserBook={canBook}
              onBooking={handleBooking}
            />
          </Card>
        </TabsContent>

        {/* My Bookings Tab */}
        <TabsContent value="upcoming" className="space-y-4">
          <UpcomingBookings
            bookings={upcomingBookings}
            loading={loading}
            onCancelBooking={handleCancelBooking}
          />
        </TabsContent>
      </Tabs>

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
}