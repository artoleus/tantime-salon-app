"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { AdminUserData } from "@/hooks/use-admin";

interface AnalyticsTabProps {
  topCustomers: AdminUserData[];
  revenueData: Array<{
    date: string;
    revenue: number;
    transactions: number;
  }>;
}

export function AnalyticsTab({ topCustomers, revenueData }: AnalyticsTabProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Top Customers by Spending</CardTitle>
          <CardDescription>Your most valuable customers</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            {topCustomers.map((customer, index) => {
              const totalSpent = customer.purchaseHistory.reduce((sum, p) => sum + p.amount, 0);
              return (
                <div key={customer.userId} className="flex justify-between items-center p-3 rounded border mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{customer.displayName}</p>
                      <p className="text-sm text-muted-foreground">{customer.purchaseHistory.length} purchases</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${totalSpent.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{customer.remaining.toFixed(1)} hrs left</p>
                  </div>
                </div>
              );
            })}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction Volume</CardTitle>
          <CardDescription>Daily transaction counts</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="transactions" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}