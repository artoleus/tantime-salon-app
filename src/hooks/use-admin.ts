"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { collection, getDocs, query, orderBy, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/auth-context';
import { UserData } from './use-user-data';

export interface AdminUserData extends UserData {
  userId: string;
  email: string;
  displayName: string;
  lastLoginAt?: string;
  lastVisit?: string;
}

export interface DailyMetrics {
  todayRevenue: number;
  cashAvailable: number;
  activeCustomersToday: number;
  lowBalanceAlerts: number;
}

export interface PrepaymentObligation {
  month: string;
  totalHours: number;
  totalValue: number;
  customerCount: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  transactions: number;
}

export function useAdmin() {
  const { user } = useAuth();
  const [allUsersData, setAllUsersData] = useState<AdminUserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const unsubscribeRefs = useRef<(() => void)[]>([]);

  // Check if current user is admin
  const isAdmin = useCallback(() => {
    if (!user?.email) return false;
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
    return adminEmails.includes(user.email);
  }, [user?.email]);

  // Setup real-time listeners for all users data
  const setupRealtimeListeners = useCallback(() => {
    if (!isAdmin()) {
      setError('Unauthorized: Admin access required');
      return;
    }

    setLoading(true);
    setError(null);

    // Clear existing listeners
    unsubscribeRefs.current.forEach(unsubscribe => unsubscribe());
    unsubscribeRefs.current = [];

    try {
      const usersQuery = query(collection(db, 'users'), orderBy('lastUpdated', 'desc'));
      
      const unsubscribe = onSnapshot(usersQuery, (querySnapshot) => {
        const users: AdminUserData[] = [];
        querySnapshot.forEach((doc) => {
          const userData = doc.data() as UserData;
          users.push({
            ...userData,
            userId: doc.id,
            email: userData.email || 'Unknown',
            displayName: userData.displayName || 'Anonymous User',
            lastVisit: userData.purchaseHistory.length > 0 ? userData.purchaseHistory[0].date : userData.createdAt,
          });
        });
        
        setAllUsersData(users);
        setLoading(false);
        setError(null);
      }, (err) => {
        console.error('Error in real-time listener:', err);
        setError('Failed to listen to user data changes');
        setLoading(false);
      });

      unsubscribeRefs.current = [unsubscribe];
    } catch (err) {
      console.error('Error setting up listeners:', err);
      setError('Failed to setup real-time listeners');
      setLoading(false);
    }
  }, [isAdmin]);

  // Fetch all users data (fallback method)
  const fetchAllUsers = useCallback(async () => {
    if (!isAdmin()) {
      setError('Unauthorized: Admin access required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const usersQuery = query(collection(db, 'users'), orderBy('lastUpdated', 'desc'));
      const querySnapshot = await getDocs(usersQuery);
      
      const users: AdminUserData[] = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data() as UserData;
        users.push({
          ...userData,
          userId: doc.id,
          email: userData.email || 'Unknown',
          displayName: userData.displayName || 'Anonymous User',
          lastVisit: userData.purchaseHistory.length > 0 ? userData.purchaseHistory[0].date : userData.createdAt,
        });
      });

      setAllUsersData(users);
    } catch (err) {
      console.error('Error fetching users data:', err);
      setError('Failed to fetch users data');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  // Get today's key metrics
  const getDailyMetrics = useCallback((): DailyMetrics => {
    const today = new Date().toISOString().split('T')[0];
    
    const todayRevenue = allUsersData.reduce((sum, user) => 
      sum + user.purchaseHistory
        .filter(purchase => purchase.date === today)
        .reduce((daySum, purchase) => daySum + purchase.amount, 0), 0
    );

    const totalPrepayments = allUsersData.reduce((sum, user) => 
      sum + (user.remaining * 10), 0 // Assuming $10 per hour
    );

    const totalRevenue = allUsersData.reduce((sum, user) => 
      sum + user.purchaseHistory.reduce((userSum, purchase) => userSum + purchase.amount, 0), 0
    );

    const cashAvailable = totalRevenue - totalPrepayments;

    const activeCustomersToday = allUsersData.filter(user => 
      user.purchaseHistory.some(purchase => purchase.date === today) ||
      user.hoursUsedThisMonth > 0
    ).length;

    const lowBalanceAlerts = allUsersData.filter(user => user.remaining < 2).length;

    return {
      todayRevenue,
      cashAvailable,
      activeCustomersToday,
      lowBalanceAlerts,
    };
  }, [allUsersData]);

  // Get prepayment obligations by month
  const getPrepaymentObligations = useCallback((): PrepaymentObligation[] => {
    const obligations: { [key: string]: PrepaymentObligation } = {};
    
    allUsersData.forEach(user => {
      if (user.remaining > 0) {
        const currentMonth = new Date().toISOString().substring(0, 7);
        
        if (!obligations[currentMonth]) {
          obligations[currentMonth] = {
            month: currentMonth,
            totalHours: 0,
            totalValue: 0,
            customerCount: 0,
          };
        }
        
        obligations[currentMonth].totalHours += user.remaining;
        obligations[currentMonth].totalValue += user.remaining * 10;
        obligations[currentMonth].customerCount += 1;
      }
    });

    return Object.values(obligations);
  }, [allUsersData]);

  // Get revenue trend data
  const getRevenueData = useCallback((days: number = 30): RevenueData[] => {
    const revenueMap: { [key: string]: { revenue: number; transactions: number } } = {};
    
    // Initialize last N days
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      revenueMap[dateStr] = { revenue: 0, transactions: 0 };
    }

    // Aggregate revenue by date
    allUsersData.forEach(user => {
      user.purchaseHistory.forEach(purchase => {
        if (revenueMap[purchase.date]) {
          revenueMap[purchase.date].revenue += purchase.amount;
          revenueMap[purchase.date].transactions += 1;
        }
      });
    });

    return Object.entries(revenueMap)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [allUsersData]);

  // Get business statistics
  const getBusinessStats = useCallback(() => {
    const totalUsers = allUsersData.length;
    const totalRevenue = allUsersData.reduce((sum, user) => 
      sum + user.purchaseHistory.reduce((userSum, purchase) => userSum + purchase.amount, 0), 0
    );
    const totalHoursSold = allUsersData.reduce((sum, user) => 
      sum + user.purchaseHistory.reduce((userSum, purchase) => userSum + purchase.hours, 0), 0
    );
    const totalHoursUsed = allUsersData.reduce((sum, user) => sum + user.hoursUsedThisMonth, 0);

    return {
      totalUsers,
      totalRevenue,
      totalHoursSold,
      totalHoursUsed,
      activeUsers: allUsersData.filter(user => user.remaining > 0).length,
    };
  }, [allUsersData]);

  // Filter customers by various criteria
  const filterCustomers = useCallback((searchTerm: string = '', balanceFilter: 'all' | 'low' | 'critical' = 'all') => {
    return allUsersData.filter(user => {
      const matchesSearch = !searchTerm || 
        user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesBalance = balanceFilter === 'all' || 
        (balanceFilter === 'critical' && user.remaining < 2) ||
        (balanceFilter === 'low' && user.remaining < 5 && user.remaining >= 2);
      
      return matchesSearch && matchesBalance;
    });
  }, [allUsersData]);

  // Get top customers by spending
  const getTopCustomers = useCallback((limit: number = 10) => {
    return [...allUsersData]
      .sort((a, b) => {
        const aTotal = a.purchaseHistory.reduce((sum, p) => sum + p.amount, 0);
        const bTotal = b.purchaseHistory.reduce((sum, p) => sum + p.amount, 0);
        return bTotal - aTotal;
      })
      .slice(0, limit);
  }, [allUsersData]);

  // Cleanup listeners on unmount and sign out
  useEffect(() => {
    const cleanup = () => {
      unsubscribeRefs.current.forEach(unsubscribe => {
        try {
          unsubscribe();
        } catch (error) {
          console.error('Error cleaning up admin listener:', error);
        }
      });
      unsubscribeRefs.current = [];
      setAllUsersData([]);
      setError(null);
    };

    const handleSignOut = () => {
      cleanup();
    };

    window.addEventListener('auth:signout', handleSignOut);

    return () => {
      cleanup();
      window.removeEventListener('auth:signout', handleSignOut);
    };
  }, []); // Empty dependency array prevents infinite loops

  return {
    isAdmin,
    allUsersData,
    loading,
    error,
    fetchAllUsers,
    setupRealtimeListeners,
    getBusinessStats,
    getDailyMetrics,
    getPrepaymentObligations,
    getRevenueData,
    filterCustomers,
    getTopCustomers,
  };
}