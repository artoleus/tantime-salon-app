"use client";

import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { BookingTab } from "@/components/booking-tab";
import { OverviewTab } from "@/components/overview-tab";
import { ProfileTab } from "@/components/profile-tab";
import { ScanTab } from "@/components/scan-tab";
import { BusinessTab } from "@/components/business-tab";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Home as HomeIcon, Calendar, User, QrCode, Building } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useUserData } from "@/hooks/use-user-data";
import { useAdmin } from "@/hooks/use-admin";
import { AuthScreen } from "@/components/auth-screen";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { userData, loading: dataLoading, error: dataError, addPurchase, deductHours } = useUserData();
  const { isAdmin } = useAdmin();
  const [activeTab, setActiveTab] = useState("overview");

  const handlePurchase = async (sessions: number, amount: number) => {
    // Convert sessions to hours for storage (1 session = 0.25 hours)
    const hours = sessions * 0.25;
    await addPurchase(hours, amount);
  };

  const handleScanSuccess = async (hoursDeducted: number) => {
    await deductHours(hoursDeducted);
  };

  const handleInsufficientFunds = () => {
    // Redirect to profile tab for purchasing more sessions
    setActiveTab("profile");
  };

  // Show loading while authentication or data is loading
  if (authLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Loading TanTime...</p>
        </div>
      </div>
    );
  }

  // Show authentication screen if not authenticated
  if (!user) {
    return <AuthScreen />;
  }

  // Show error if userData failed to load
  if (!userData && !dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-headline">Data Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Failed to load user data. This might be a permissions issue or Firebase configuration problem.
            </p>
            {dataError && (
              <div className="text-xs text-red-600 bg-red-50 p-3 rounded-lg">
                <p className="font-semibold">Error Details:</p>
                <p>{dataError}</p>
              </div>
            )}
            <div className="flex gap-2 justify-center">
              <Button onClick={() => window.location.reload()}>Retry</Button>
              <Button variant="outline" onClick={signOut}>Sign Out</Button>
            </div>
            <p className="text-xs text-muted-foreground">
              User: {user?.email}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-background p-4 md:p-8">
      <div className="w-full max-w-4xl">
        <AppHeader />
        <main>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className={`grid w-full ${isAdmin() ? 'grid-cols-5' : 'grid-cols-4'} bg-secondary mb-6 rounded-lg h-16`}>
              <TabsTrigger
                value="overview"
                className="text-sm md:text-base h-12 flex items-center justify-center gap-2"
              >
                <HomeIcon className="h-5 w-5" />
                <span className="hidden md:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger
                value="booking"
                className="text-sm md:text-base h-12 flex items-center justify-center gap-2"
              >
                <Calendar className="h-5 w-5" />
                <span className="hidden md:inline">Booking</span>
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="text-sm md:text-base h-12 flex items-center justify-center gap-2"
              >
                <User className="h-5 w-5" />
                <span className="hidden md:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger
                value="scan"
                className="text-sm md:text-base h-12 flex items-center justify-center gap-2"
              >
                <QrCode className="h-5 w-5" />
                <span className="hidden md:inline">Scan</span>
              </TabsTrigger>
              {isAdmin() && (
                <TabsTrigger
                  value="business"
                  className="text-sm md:text-base h-12 flex items-center justify-center gap-2"
                >
                  <Building className="h-5 w-5" />
                  <span className="hidden md:inline">Business</span>
                </TabsTrigger>
              )}
            </TabsList>
            <TabsContent value="overview">
              <OverviewTab
                overviewData={{
                  sessionsUsedThisMonth: Math.round((userData?.hoursUsedThisMonth || 0) / 0.25),
                  remainingSessions: Math.round((userData?.remaining || 0) / 0.25),
                }}
                onPurchaseClick={() => setActiveTab("profile")}
              />
            </TabsContent>
            <TabsContent value="booking">
              <BookingTab />
            </TabsContent>
            <TabsContent value="profile">
              <ProfileTab 
                onPurchase={handlePurchase} 
                purchaseHistory={(userData?.purchaseHistory || []).map(item => ({
                  ...item,
                  sessions: Math.round(item.hours / 0.25) // Convert hours to sessions for display
                }))} 
              />
            </TabsContent>
            <TabsContent value="scan">
              <ScanTab 
                onScanSuccess={handleScanSuccess} 
                userBalance={userData?.remaining || 0}
                onInsufficientFunds={handleInsufficientFunds}
              />
            </TabsContent>
            {isAdmin() && (
              <TabsContent value="business">
                <BusinessTab />
              </TabsContent>
            )}
          </Tabs>
        </main>
      </div>
    </div>
  );
}
