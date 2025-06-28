"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAdmin, AdminUserData } from "@/hooks/use-admin";
import { useToast } from "@/hooks/use-toast";
import { 
  Building, 
  DollarSign, 
  Users, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  Search,
  Filter,
  Mail,
  Plus,
  Loader2,
  RefreshCw,
  Eye,
  Clock,
  Wallet,
  Activity
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export function BusinessTab() {
  const { 
    isAdmin, 
    allUsersData, 
    loading, 
    error, 
    setupRealtimeListeners,
    getDailyMetrics,
    getPrepaymentObligations,
    getRevenueData,
    filterCustomers,
    getTopCustomers
  } = useAdmin();
  
  const { toast } = useToast();
  
  // Local state for filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [balanceFilter, setBalanceFilter] = useState<'all' | 'low' | 'critical'>('all');
  const [chartPeriod, setChartPeriod] = useState<'7' | '30' | '90'>('30');

  useEffect(() => {
    if (isAdmin) {
      setupRealtimeListeners();
    }
  }, [isAdmin]);

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

  const dailyMetrics = getDailyMetrics();
  const prepaymentObligations = getPrepaymentObligations();
  const revenueData = getRevenueData(parseInt(chartPeriod));
  const filteredCustomers = filterCustomers(searchTerm, balanceFilter);
  const topCustomers = getTopCustomers(5);

  const handleRefresh = () => {
    setupRealtimeListeners();
    toast({
      title: "Data Refreshed",
      description: "Business data has been updated.",
    });
  };

  const getRowColor = (remaining: number) => {
    if (remaining < 2) return "bg-red-50 border-red-200";
    if (remaining < 5) return "bg-yellow-50 border-yellow-200";
    return "";
  };

  const sendPromotion = (customer: AdminUserData) => {
    toast({
      title: "Promotion Sent",
      description: `Promotional email sent to ${customer.displayName}`,
    });
  };

  const addHours = (customer: AdminUserData) => {
    toast({
      title: "Add Hours",
      description: `Opening add hours dialog for ${customer.displayName}`,
    });
  };

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
                  <Select value={chartPeriod} onValueChange={(value: '7' | '30' | '90') => setChartPeriod(value)}>
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
                  {prepaymentObligations.map((obligation, index) => (
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
        </TabsContent>

        {/* Customer Management Section */}
        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Customer Management
              </CardTitle>
              <CardDescription>Search, filter, and manage all customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={balanceFilter} onValueChange={(value: 'all' | 'low' | 'critical') => setBalanceFilter(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Customers</SelectItem>
                    <SelectItem value="low">Low Balance (less than 5 hrs)</SelectItem>
                    <SelectItem value="critical">Critical (less than 2 hrs)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Hours Remaining</TableHead>
                      <TableHead>Last Visit</TableHead>
                      <TableHead>Total Spent</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => {
                      const totalSpent = customer.purchaseHistory.reduce((sum, p) => sum + p.amount, 0);
                      return (
                        <TableRow key={customer.userId} className={getRowColor(customer.remaining)}>
                          <TableCell>
                            <div>
                              <p className="font-semibold">{customer.displayName}</p>
                              <p className="text-xs text-muted-foreground">{customer.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{customer.remaining.toFixed(1)}</span>
                              {customer.remaining < 2 && <Badge variant="destructive">Critical</Badge>}
                              {customer.remaining >= 2 && customer.remaining < 5 && <Badge variant="secondary">Low</Badge>}
                            </div>
                          </TableCell>
                          <TableCell>
                            {customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString() : 'Never'}
                          </TableCell>
                          <TableCell className="font-semibold">${totalSpent.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => sendPromotion(customer)}>
                                <Mail className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => addHours(customer)}>
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Section */}
        <TabsContent value="analytics" className="space-y-4">
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
        </TabsContent>

        {/* Alert System */}
        <TabsContent value="alerts" className="space-y-4">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}