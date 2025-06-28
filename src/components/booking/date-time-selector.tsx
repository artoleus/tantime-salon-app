"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CalendarDays, 
  Clock, 
  X,
} from "lucide-react";
import { TIME_SLOTS } from "@/types/booking";

interface DateTimeSelectorProps {
  selectedDate: Date | undefined;
  selectedTime: string;
  selectedSunbed: string;
  onDateChange: (date: Date | undefined) => void;
  onTimeChange: (time: string) => void;
  getTimeSlotStatus: (time: string, sunbedId: string) => 'available' | 'booked' | 'past';
  availableSlotsCount: number;
  loading: boolean;
}

export function DateTimeSelector({
  selectedDate,
  selectedTime,
  selectedSunbed,
  onDateChange,
  onTimeChange,
  getTimeSlotStatus,
  availableSlotsCount,
  loading,
}: DateTimeSelectorProps) {
  const handleTimeSelection = useCallback((time: string) => {
    onTimeChange(time);
  }, [onTimeChange]);

  return (
    <div className="space-y-6">
      {/* Calendar Section */}
      <div className="space-y-4 flex flex-col items-center">
        <Label className="text-lg font-headline flex items-center gap-2">
          <CalendarDays className="text-primary" />
          Select Date
        </Label>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onDateChange}
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
  );
}