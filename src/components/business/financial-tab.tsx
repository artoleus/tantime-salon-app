"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  TrendingUp,
  Calendar
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface FinancialTabProps {
  revenueData: Array<{
    date: string;
    revenue: number;
    transactions: number;
  }>;
  prepaymentObligations: Array<{
    month: string;
    totalValue: number;
    totalHours: number;
    customerCount: number;
  }>;
  chartPeriod: '7' | '30' | '90';
  onChartPeriodChange: (period: '7' | '30' | '90') => void;
}

export function FinancialTab({ 
  revenueData, 
  prepaymentObligations, 
  chartPeriod, 
  onChartPeriodChange 
}: FinancialTabProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Cash Flow Projection
          </CardTitle>
          <CardDescription>Revenue trends over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Select value={chartPeriod} onValueChange={onChartPeriodChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Prepayment Obligations
          </CardTitle>
          <CardDescription>Outstanding customer balances</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            {prepaymentObligations.map((obligation) => (
              <div key={obligation.month} className="flex justify-between items-center p-3 rounded border mb-2">
                <div>
                  <p className="font-semibold">{new Date(obligation.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                  <p className="text-sm text-muted-foreground">{obligation.customerCount} customers</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">${obligation.totalValue.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">{obligation.totalHours.toFixed(1)} hours</p>
                </div>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}