"use client";

/**
 * Finds the best time slot to book based on the current time
 * If within 5 minutes of a slot, use that slot (e.g., 11:06 can use 11:00 or 11:15)
 * Otherwise, find the next available slot
 */
export function findBestTimeSlot(currentTime: Date): string {
  const currentMinutes = currentTime.getMinutes();
  const currentHour = currentTime.getHours();
  
  // Available 15-minute slots
  const slots15Min = [0, 15, 30, 45];
  
  // Check if we're within 5 minutes of any slot
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
}

/**
 * Gets the time slot that would be booked for the current moment
 */
export function getCurrentBookingTimeSlot(): string {
  const now = new Date();
  return findBestTimeSlot(now);
}