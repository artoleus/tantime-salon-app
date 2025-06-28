"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/auth-context';

export interface UserData {
  hoursUsedThisMonth: number;
  remaining: number;
  purchaseHistory: Array<{
    id: string;
    date: string;
    hours: number;
    amount: number;
  }>;
  email?: string;
  displayName?: string;
  createdAt: string;
  lastUpdated: string;
}

const defaultUserData: UserData = {
  hoursUsedThisMonth: 0,
  remaining: 0,
  purchaseHistory: [],
  createdAt: new Date().toISOString(),
  lastUpdated: new Date().toISOString(),
};

export function useUserData() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Reset state when no user
    if (!user) {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      setUserData(null);
      setLoading(false);
      setError(null);
      return;
    }

    // Set up user data listener
    const setupUserData = async () => {
      try {
        console.log('Setting up user data for:', user.uid, user.email);
        setLoading(true);
        setError(null);

        const userDocRef = doc(db, 'users', user.uid);

        // Set up real-time listener
        const unsubscribe = onSnapshot(
          userDocRef,
          async (docSnapshot) => {
            try {
              if (docSnapshot.exists()) {
                console.log('User document exists, loading data...');
                const data = docSnapshot.data() as UserData;
                setUserData(data);
              } else {
                console.log('Creating new user document...');
                const newUserData = {
                  ...defaultUserData,
                  email: user.email || '',
                  displayName: user.displayName || '',
                };
                await setDoc(userDocRef, newUserData);
                setUserData(newUserData);
              }
              setLoading(false);
              setError(null);
            } catch (err) {
              console.error('Error in user data snapshot handler:', err);
              setError(`Failed to handle user data: ${err instanceof Error ? err.message : 'Unknown error'}`);
              setLoading(false);
            }
          },
          (err) => {
            console.error('Error in user data listener:', err);
            setError(`Failed to listen to user data: ${err instanceof Error ? err.message : 'Unknown error'}`);
            setLoading(false);
          }
        );

        unsubscribeRef.current = unsubscribe;
      } catch (err) {
        console.error('Error setting up user data:', err);
        setError(`Failed to setup user data: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setLoading(false);
      }
    };

    setupUserData();

    // Cleanup function
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [user?.uid]); // Only depend on user ID to prevent infinite loops

  // Cleanup on sign out
  useEffect(() => {
    const cleanup = () => {
      if (unsubscribeRef.current) {
        try {
          unsubscribeRef.current();
        } catch (error) {
          console.error('Error cleaning up user data listener:', error);
        }
        unsubscribeRef.current = null;
      }
      setUserData(null);
      setError(null);
    };

    const handleSignOut = () => {
      cleanup();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auth:signout', handleSignOut);
    }

    return () => {
      cleanup();
      if (typeof window !== 'undefined') {
        window.removeEventListener('auth:signout', handleSignOut);
      }
    };
  }, []);

  const updateUserData = useCallback(async (updates: Partial<UserData>) => {
    if (!user || !userData) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const updatedData = {
        ...updates,
        lastUpdated: new Date().toISOString(),
      };
      
      await updateDoc(userDocRef, updatedData);
    } catch (err) {
      console.error('Error updating user data:', err);
      setError('Failed to update user data');
    }
  }, [user, userData]);

  const addPurchase = useCallback(async (hours: number, amount: number) => {
    if (!userData) return;

    const newPurchase = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      hours,
      amount,
    };

    await updateUserData({
      remaining: userData.remaining + hours,
      purchaseHistory: [newPurchase, ...userData.purchaseHistory],
    });
  }, [userData, updateUserData]);

  const deductHours = useCallback(async (hoursUsed: number) => {
    if (!userData) return;

    await updateUserData({
      remaining: Math.max(0, userData.remaining - hoursUsed),
      hoursUsedThisMonth: userData.hoursUsedThisMonth + hoursUsed,
    });
  }, [userData, updateUserData]);

  return {
    userData,
    loading,
    error,
    updateUserData,
    addPurchase,
    deductHours,
  };
}