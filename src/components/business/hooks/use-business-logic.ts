"use client";

import { useEffect, useState } from "react";
import { useAdmin, AdminUserData } from "@/hooks/use-admin";
import { useToast } from "@/hooks/use-toast";

export function useBusinessLogic() {
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
  }, [isAdmin, setupRealtimeListeners]);

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

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const handleBalanceFilterChange = (filter: 'all' | 'low' | 'critical') => {
    setBalanceFilter(filter);
  };

  const handleChartPeriodChange = (period: '7' | '30' | '90') => {
    setChartPeriod(period);
  };

  return {
    // State
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
    
    // Actions
    handleRefresh,
    getRowColor,
    sendPromotion,
    addHours,
    handleSearchChange,
    handleBalanceFilterChange,
    handleChartPeriodChange,
    setupRealtimeListeners,
  };
}