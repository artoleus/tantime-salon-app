"use client";

import { useEffect, useRef, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CameraManagerProps {
  onPermissionChange: (hasPermission: boolean | null) => void;
}

export function CameraManager({ onPermissionChange }: CameraManagerProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("Camera API not supported in this browser.");
        setHasCameraPermission(false);
        onPermissionChange(false);
        toast({
          variant: "destructive",
          title: "Unsupported Browser",
          description: "Your browser does not support camera access.",
        });
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        setHasCameraPermission(true);
        onPermissionChange(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
        setHasCameraPermission(false);
        onPermissionChange(false);
        toast({
          variant: "destructive",
          title: "Camera Access Denied",
          description:
            "Please enable camera permissions in your browser settings to use this feature.",
        });
      }
    };

    getCameraPermission();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [toast, onPermissionChange]);

  return (
    <>
      <div className="w-full max-w-md p-2 border-dashed border-2 rounded-lg relative aspect-video flex items-center justify-center bg-secondary/30">
        <video
          ref={videoRef}
          className="w-full aspect-video rounded-md"
          autoPlay
          muted
          playsInline
        />
        {hasCameraPermission === false && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-background/80 rounded-md">
            <Video className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="font-semibold">Camera Not Available</p>
            <p className="text-sm text-muted-foreground">
              Check permissions and try again.
            </p>
          </div>
        )}
      </div>
      {hasCameraPermission === false && (
        <Alert variant="destructive" className="w-full max-w-md">
          <AlertTitle>Camera Access Required</AlertTitle>
          <AlertDescription>
            Please allow camera access in your browser to use this feature.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}