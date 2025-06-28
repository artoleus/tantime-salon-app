"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DollarSign, 
  AlertTriangle,
  Wallet,
  Activity
} from "lucide-react";

interface BusinessMetricsCardsProps {
  dailyMetrics: {
    todayRevenue: number;
    cashAvailable: number;
    activeCustomersToday: number;
    lowBalanceAlerts: number;
  };
}

export function BusinessMetricsCards({ dailyMetrics }: BusinessMetricsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">${dailyMetrics.todayRevenue.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Daily earnings</p>
        </CardContent>
      </Card>

      <Card className="border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cash Available</CardTitle>
          <Wallet className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">${dailyMetrics.cashAvailable.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Minus prepayment obligations</p>
        </CardContent>
      </Card>

      <Card className="border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Today</CardTitle>
          <Activity className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{dailyMetrics.activeCustomersToday}</div>
          <p className="text-xs text-muted-foreground">Customers active today</p>
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Low Balance Alerts</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{dailyMetrics.lowBalanceAlerts}</div>
          <p className="text-xs text-muted-foreground">Customers with less than 2 hours</p>
        </CardContent>
      </Card>
    </div>
  );
}