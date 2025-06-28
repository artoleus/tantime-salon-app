"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users,
  Search,
  Mail,
  Plus
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminUserData } from "@/hooks/use-admin";

interface CustomersTabProps {
  filteredCustomers: AdminUserData[];
  searchTerm: string;
  balanceFilter: 'all' | 'low' | 'critical';
  onSearchChange: (term: string) => void;
  onBalanceFilterChange: (filter: 'all' | 'low' | 'critical') => void;
  onSendPromotion: (customer: AdminUserData) => void;
  onAddHours: (customer: AdminUserData) => void;
  getRowColor: (remaining: number) => string;
}

export function CustomersTab({
  filteredCustomers,
  searchTerm,
  balanceFilter,
  onSearchChange,
  onBalanceFilterChange,
  onSendPromotion,
  onAddHours,
  getRowColor,
}: CustomersTabProps) {
  return (
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
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={balanceFilter} onValueChange={onBalanceFilterChange}>
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
                        <Button size="sm" variant="outline" onClick={() => onSendPromotion(customer)}>
                          <Mail className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onAddHours(customer)}>
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
  );
}