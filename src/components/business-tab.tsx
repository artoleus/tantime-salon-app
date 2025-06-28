"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building, 
  Loader2,
  RefreshCw
} from "lucide-react";
import { BusinessMetricsCards } from "@/components/business/business-metrics-cards";
import { FinancialTab } from "@/components/business/financial-tab";
import { CustomersTab } from "@/components/business/customers-tab";
import { AnalyticsTab } from "@/components/business/analytics-tab";
import { AlertsTab } from "@/components/business/alerts-tab";
import { useBusinessLogic } from "@/components/business/hooks/use-business-logic";

export function BusinessTab() {
  const {
    isAdmin,
    loading,
    error,
    allUsersData,
    searchTerm,
    balanceFilter,
    chartPeriod,
    dailyMetrics,
    prepaymentObligations,
    revenueData,
    filteredCustomers,
    topCustomers,
    handleRefresh,
    getRowColor,
    sendPromotion,
    addHours,
    handleSearchChange,
    handleBalanceFilterChange,
    handleChartPeriodChange,
    setupRealtimeListeners,
  } = useBusinessLogic();

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-headline">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              You don't have permission to access business information.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading && allUsersData.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading business data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-headline text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={setupRealtimeListeners}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-headline font-bold flex items-center gap-2">
            <Building className="text-primary" />
            Business Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">Real-time salon management and analytics</p>
        </div>
        <Button onClick={handleRefresh} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Today's Key Metrics */}
      <BusinessMetricsCards dailyMetrics={dailyMetrics} />

      {/* Main Content Tabs */}
      <Tabs defaultValue="financial" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        {/* Financial Management Section */}
        <TabsContent value="financial" className="space-y-4">
          <FinancialTab
            revenueData={revenueData}
            prepaymentObligations={prepaymentObligations}
            chartPeriod={chartPeriod}
            onChartPeriodChange={handleChartPeriodChange}
          />
        </TabsContent>

        {/* Customer Management Section */}
        <TabsContent value="customers" className="space-y-4">
          <CustomersTab
            filteredCustomers={filteredCustomers}
            searchTerm={searchTerm}
            balanceFilter={balanceFilter}
            onSearchChange={handleSearchChange}
            onBalanceFilterChange={handleBalanceFilterChange}
            onSendPromotion={sendPromotion}
            onAddHours={addHours}
            getRowColor={getRowColor}
          />
        </TabsContent>

        {/* Analytics Section */}
        <TabsContent value="analytics" className="space-y-4">
          <AnalyticsTab
            topCustomers={topCustomers}
            revenueData={revenueData}
          />
        </TabsContent>

        {/* Alert System */}
        <TabsContent value="alerts" className="space-y-4">
          <AlertsTab
            dailyMetrics={dailyMetrics}
            filteredCustomers={filteredCustomers}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}