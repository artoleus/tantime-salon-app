"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";
import { CameraManager } from "@/components/scan/camera-manager";
import { ScanSunbedSelector } from "@/components/scan/scan-sunbed-selector";
import { SessionAlerts } from "@/components/scan/session-alerts";
import { useScanLogic } from "@/components/scan/hooks/use-scan-logic";

type ScanTabProps = {
  onScanSuccess: (hoursDeducted: number) => void;
  userBalance: number;
  onInsufficientFunds: () => void;
};

export function ScanTab({ onScanSuccess, userBalance, onInsufficientFunds }: ScanTabProps) {
  const {
    selectedSunbed,
    hasCameraPermission,
    bookingLoading,
    setSelectedSunbed,
    setHasCameraPermission,
    handleSessionStart,
    getButtonText,
    isButtonDisabled,
    getBookingTimeSlot,
  } = useScanLogic({ onScanSuccess, userBalance, onInsufficientFunds });

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <QrCode className="text-primary" />
          Scan to Login
        </CardTitle>
        <CardDescription>
          Point your camera at the QR code on the tanning booth to start your
          session. Balance: {(userBalance * 60).toFixed(0)} minutes ({userBalance.toFixed(2)} hours)
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-6">
        {/* Sunbed Selection */}
        <ScanSunbedSelector
          selectedSunbed={selectedSunbed}
          onSunbedChange={setSelectedSunbed}
        />

        {/* Camera Manager */}
        <CameraManager onPermissionChange={setHasCameraPermission} />
        
        {/* Session Alerts */}
        <SessionAlerts
          userBalance={userBalance}
          selectedSunbed={selectedSunbed}
          getBookingTimeSlot={getBookingTimeSlot}
        />
      </CardContent>
      <CardFooter>
        <Button
          size="lg"
          className="w-full font-headline text-lg"
          onClick={handleSessionStart}
          disabled={isButtonDisabled()}
        >
          {getButtonText()}
        </Button>
      </CardFooter>
    </Card>
  );
}
