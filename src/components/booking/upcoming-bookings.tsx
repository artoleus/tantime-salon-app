"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bed, 
  CalendarDays, 
  Users, 
  Star,
} from "lucide-react";
import { SUNBEDS } from "@/types/booking";
import type { Sunbed, Booking } from "@/types/booking";

interface UpcomingBookingsProps {
  bookings: Booking[];
  loading: boolean;
  onCancelBooking: (bookingId: string) => void;
}

export function UpcomingBookings({
  bookings,
  loading,
  onCancelBooking,
}: UpcomingBookingsProps) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">My Upcoming Bookings</CardTitle>
        <CardDescription>
          Manage your scheduled tanning sessions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {bookings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No upcoming bookings.</p>
            <p className="text-sm">Book a session to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
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
                      onClick={() => onCancelBooking(booking.id)}
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
  );
}