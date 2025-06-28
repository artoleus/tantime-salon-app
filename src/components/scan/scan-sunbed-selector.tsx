"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Bed, Star, Users } from "lucide-react";
import { SUNBEDS } from "@/types/booking";

interface ScanSunbedSelectorProps {
  selectedSunbed: string;
  onSunbedChange: (sunbedId: string) => void;
}

export function ScanSunbedSelector({
  selectedSunbed,
  onSunbedChange,
}: ScanSunbedSelectorProps) {
  const getSunbedIcon = (type: string) => {
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
    <div className="w-full max-w-md space-y-3">
      <Label className="text-base font-semibold">Select Sunbed:</Label>
      <RadioGroup value={selectedSunbed} onValueChange={onSunbedChange}>
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
                {getSunbedIcon(sunbed.type)}
                <span className="text-sm font-medium">{sunbed.name}</span>
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
}