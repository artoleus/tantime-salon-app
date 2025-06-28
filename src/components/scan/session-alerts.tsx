"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, QrCode } from "lucide-react";

interface SessionAlertsProps {
  userBalance: number;
  selectedSunbed: string;
  getBookingTimeSlot: () => string;
}

export function SessionAlerts({
  userBalance,
  selectedSunbed,
  getBookingTimeSlot,
}: SessionAlertsProps) {
  // Insufficient balance alert (critical)
  if (userBalance < 0.25) {
    return (
      <Alert variant="destructive" className="w-full max-w-md">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Insufficient Balance</AlertTitle>
        <AlertDescription>
          You need at least 15 minutes (0.25 hours) to start a session. Purchase more time on the Profile tab.
        </AlertDescription>
      </Alert>
    );
  }

  // Low balance warning
  if (userBalance >= 0.25 && userBalance < 1) {
    return (
      <Alert className="w-full max-w-md border-yellow-500 bg-yellow-50">
        <AlertTriangle className="h-4 w-4 text-yellow-500" />
        <AlertTitle className="text-yellow-700">Low Balance Warning</AlertTitle>
        <AlertDescription className="text-yellow-600">
          You have less than 1 hour remaining. Consider purchasing more time for future sessions.
        </AlertDescription>
      </Alert>
    );
  }

  // Select sunbed prompt
  if (!selectedSunbed && userBalance >= 0.25) {
    return (
      <Alert className="w-full max-w-md border-blue-500 bg-blue-50">
        <QrCode className="h-4 w-4 text-blue-500" />
        <AlertTitle className="text-blue-700">Select Your Sunbed</AlertTitle>
        <AlertDescription className="text-blue-600">
          Choose which sunbed you want to use for your 15-minute session. Will book time slot: {getBookingTimeSlot()}
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}