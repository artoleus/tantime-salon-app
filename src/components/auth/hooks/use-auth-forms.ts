"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { 
  validateSignInForm, 
  validateSignUpForm, 
  SignInFormData, 
  SignUpFormData 
} from "../utils/validation";

export function useAuthForms() {
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Sign In Form State
  const [signInData, setSignInData] = useState<SignInFormData>({
    email: "",
    password: "",
  });

  // Sign Up Form State
  const [signUpData, setSignUpData] = useState<SignUpFormData>({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateSignInForm(signInData);
    if (!validation.isValid) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: validation.error,
      });
      return;
    }

    setLoading(true);
    try {
      await signIn(signInData.email, signInData.password);
      toast({
        title: "Welcome Back!",
        description: "Successfully signed in to TanTime.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign In Failed",
        description: error.message || "Invalid email or password.",
      });
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateSignUpForm(signUpData);
    if (!validation.isValid) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: validation.error,
      });
      return;
    }

    setLoading(true);
    try {
      await signUp(signUpData.email, signUpData.password, signUpData.displayName);
      toast({
        title: "Account Created!",
        description: "Welcome to TanTime! Your account has been created successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: error.message || "Failed to create account.",
      });
    }
    setLoading(false);
  };

  const updateSignInData = (field: keyof SignInFormData, value: string) => {
    setSignInData(prev => ({ ...prev, [field]: value }));
  };

  const updateSignUpData = (field: keyof SignUpFormData, value: string) => {
    setSignUpData(prev => ({ ...prev, [field]: value }));
  };

  return {
    // State
    loading,
    signInData,
    signUpData,
    
    // Actions
    handleSignIn,
    handleSignUp,
    updateSignInData,
    updateSignUpData,
  };
}