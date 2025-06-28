export interface Sunbed {
  id: string;
  name: string;
  type: 'standard' | 'premium' | 'standing';
  description: string;
  priceMultiplier: number; // multiplier for base price
  maxSessionTime: number; // in minutes
  features: string[];
}

export interface TimeSlot {
  time: string; // format: "HH:MM"
  available: boolean;
  sunbedId?: string;
  bookedBy?: string;
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  sunbedId: string;
  sunbedName: string;
  date: string; // YYYY-MM-DD format
  time: string; // HH:MM format
  duration: number; // in minutes (always 15 for now)
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface DailyAvailability {
  date: string;
  sunbedAvailability: {
    [sunbedId: string]: {
      [time: string]: boolean; // true = available, false = booked
    };
  };
}

export const SUNBEDS: Sunbed[] = [
  {
    id: 'standard-1',
    name: 'Standard Bed #1',
    type: 'standard',
    description: 'Classic tanning experience with UV bulbs',
    priceMultiplier: 1.0,
    maxSessionTime: 20,
    features: ['UV Bulbs', 'Fan Cooling', 'Music System']
  },
  {
    id: 'standard-2',
    name: 'Standard Bed #2',
    type: 'standard',
    description: 'Classic tanning experience with UV bulbs',
    priceMultiplier: 1.0,
    maxSessionTime: 20,
    features: ['UV Bulbs', 'Fan Cooling', 'Music System']
  },
  {
    id: 'premium-1',
    name: 'Premium Bed',
    type: 'premium',
    description: 'Enhanced tanning with high-pressure bulbs',
    priceMultiplier: 1.5,
    maxSessionTime: 15,
    features: ['High-Pressure Bulbs', 'Air Conditioning', 'Premium Sound', 'Aromatherapy']
  },
  {
    id: 'standing-1',
    name: 'Standing Booth',
    type: 'standing',
    description: 'Quick standing tan booth',
    priceMultiplier: 1.2,
    maxSessionTime: 12,
    features: ['360° Coverage', 'Quick Session', 'Hydrating Mist', 'Music System']
  }
];

// Generate time slots for a day (15-minute intervals from 9 AM to 9 PM)
export const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  const startHour = 9; // 9 AM
  const endHour = 21; // 9 PM
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(timeString);
    }
  }
  
  return slots;
};

export const TIME_SLOTS = generateTimeSlots();