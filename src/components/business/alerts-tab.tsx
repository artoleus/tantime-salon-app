"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  AlertTriangle,
  Mail,
  Users,
  TrendingUp
} from "lucide-react";
import type { AdminUserData } from "@/hooks/use-admin";

interface AlertsTabProps {
  dailyMetrics: {
    lowBalanceAlerts: number;
  };
  filteredCustomers: AdminUserData[];
}

export function AlertsTab({ dailyMetrics, filteredCustomers }: AlertsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Alert System & Notifications
        </CardTitle>
        <CardDescription>Automated customer communications and alerts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 rounded border bg-red-50">
            <h4 className="font-semibold text-red-700 mb-2">Critical Balance Alerts</h4>
            <p className="text-sm text-red-600 mb-3">{dailyMetrics.lowBalanceAlerts} customers with less than 2 hours</p>
            <Button size="sm" variant="destructive">
              <Mail className="h-3 w-3 mr-1" />
              Send Alert Emails
            </Button>
          </div>
          
          <div className="p-4 rounded border bg-yellow-50">
            <h4 className="font-semibold text-yellow-700 mb-2">Low Balance Warnings</h4>
            <p className="text-sm text-yellow-600 mb-3">{filteredCustomers.filter(c => c.remaining >= 2 && c.remaining < 5).length} customers with less than 5 hours</p>
            <Button size="sm" variant="outline">
              <Mail className="h-3 w-3 mr-1" />
              Send Reminder Emails
            </Button>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="font-semibold mb-3">Promotion Campaigns</h4>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Mail className="h-4 w-4 mr-2" />
              Send Daily Summary Email
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users className="h-4 w-4 mr-2" />
              Bulk Promotion to All Customers
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <TrendingUp className="h-4 w-4 mr-2" />
              Target High-Value Customers
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}