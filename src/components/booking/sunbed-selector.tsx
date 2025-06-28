"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { 
  Bed, 
  Zap, 
  Users, 
  Star,
} from "lucide-react";
import { SUNBEDS } from "@/types/booking";
import type { Sunbed } from "@/types/booking";

interface SunbedSelectorProps {
  selectedSunbed: string;
  onSunbedChange: (sunbedId: string) => void;
}

export function SunbedSelector({
  selectedSunbed,
  onSunbedChange,
}: SunbedSelectorProps) {
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
      <RadioGroup value={selectedSunbed} onValueChange={onSunbedChange}>
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
  );
}