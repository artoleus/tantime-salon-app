"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bed, 
  CalendarDays, 
  Clock, 
  Sun, 
  Zap, 
  Users, 
  Star,
  X,
  CheckCircle,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useBookings } from "@/hooks/use-bookings";
import { useUserData } from "@/hooks/use-user-data";
import { SUNBEDS, TIME_SLOTS } from "@/types/booking";
import type { Sunbed } from "@/types/booking";

export function BookingTab() {
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

  const getSunbedIcon = (type: Sunbed['type']) => {
    switch (type) {
      case 'premium':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'standing':
        return <Users className="h-4 w-4 text-blue-500" />;
      default:
        return <Bed className="h-4 w-4 text-primary" />;
    }
  };

  const getSunbedColor = (type: Sunbed['type']) => {
    switch (type) {
      case 'premium':
        return 'border-yellow-200 bg-yellow-50';
      case 'standing':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-primary/20 bg-primary/5';
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

  const handleTimeSelection = useCallback((time: string) => {
    setSelectedTime(time);
  }, []);

  const availableSlotsCount = useMemo(() => {
    if (!selectedSunbed) return 0;
    return getAvailableTimesForSunbed(selectedSunbed).length;
  }, [selectedSunbed, getAvailableTimesForSunbed]);

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
              {!canUserBook(userData.remaining) && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">You need at least 0.25 hours to book a session. Please purchase more hours.</span>
                </div>
              )}
            </CardHeader>
            
            <CardContent className="grid gap-8 lg:grid-cols-2">
              {/* Left Column - Sunbed Selection & Time */}
              <div className="space-y-6">
                {/* Sunbed Selection */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-headline flex items-center gap-2">
                      <Zap className="text-primary" />
                      Select Sunbed
                    </Label>
                    <Button variant="link" size="sm" className="text-xs text-muted-foreground p-0 h-auto">
                      View Details & Safety Info →
                    </Button>
                  </div>
                  <RadioGroup value={selectedSunbed} onValueChange={setSelectedSunbed}>
                    <div className="space-y-2">
                      {SUNBEDS.map((sunbed) => (
                        <div
                          key={sunbed.id}
                          className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                            selectedSunbed === sunbed.id 
                              ? 'border-primary bg-primary/10' 
                              : 'border-border hover:border-primary/40'
                          }`}
                        >
                          <RadioGroupItem value={sunbed.id} id={sunbed.id} />
                          <Label htmlFor={sunbed.id} className="flex items-center gap-2 cursor-pointer flex-1">
                            {getSunbedIcon(sunbed.type)}
                            <span className="font-medium">{sunbed.name}</span>
                            {sunbed.priceMultiplier !== 1 && (
                              <Badge variant="secondary" className="text-xs">
                                {sunbed.priceMultiplier}x
                              </Badge>
                            )}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                {/* Time Selection */}
                {selectedSunbed && selectedDate && (
                  <div className="space-y-4">
                    <Label className="text-lg font-headline flex items-center gap-2">
                      <Clock className="text-primary" />
                      Available Times
                    </Label>
                    <ScrollArea className="h-64 p-4 border rounded-lg bg-secondary/20">
                      <div className="grid grid-cols-3 gap-2">
                        {TIME_SLOTS.map((time) => {
                          const status = getTimeSlotStatus(time, selectedSunbed);
                          const isSelected = selectedTime === time;
                          
                          return (
                            <Button
                              key={time}
                              variant={isSelected ? "default" : "outline"}
                              size="sm"
                              disabled={status !== 'available' || loading}
                              onClick={() => handleTimeSelection(time)}
                              className={`
                                ${status === 'booked' ? 'opacity-50 cursor-not-allowed' : ''}
                                ${status === 'past' ? 'opacity-30 cursor-not-allowed' : ''}
                              `}
                            >
                              {time}
                              {status === 'booked' && <X className="ml-1 h-3 w-3" />}
                            </Button>
                          );
                        })}
                      </div>
                      {availableSlotsCount === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No available slots for this date. Please try another date.
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                )}
              </div>

              {/* Right Column - Calendar */}
              <div className="space-y-4 flex flex-col items-center">
                <Label className="text-lg font-headline flex items-center gap-2">
                  <CalendarDays className="text-primary" />
                  Select Date
                </Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border shadow-inner bg-secondary/30"
                  disabled={(day) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return day < today;
                  }}
                />
                
                {selectedDate && (
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Selected: {selectedDate.toLocaleDateString()}
                    </p>
                    {selectedSunbed && (
                      <p className="text-sm">
                        Available slots: {availableSlotsCount}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>

            <CardFooter>
              <Button 
                size="lg" 
                className="w-full font-headline text-lg" 
                onClick={handleBooking}
                disabled={!selectedDate || !selectedSunbed || !selectedTime || loading || !canUserBook(userData.remaining)}
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
          </Card>
        </TabsContent>

        {/* My Bookings Tab */}
        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">My Upcoming Bookings</CardTitle>
              <CardDescription>
                Manage your scheduled tanning sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingBookings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No upcoming bookings.</p>
                  <p className="text-sm">Book a session to get started!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => {
                    const sunbed = SUNBEDS.find(s => s.id === booking.sunbedId);
                    return (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-primary/10">
                            {sunbed && getSunbedIcon(sunbed.type)}
                          </div>
                          <div>
                            <p className="font-semibold">{booking.sunbedName}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(booking.date).toLocaleDateString()} at {booking.time}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Duration: {booking.duration} minutes
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{booking.status}</Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={loading}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
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