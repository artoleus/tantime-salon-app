"use client";

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { isValid: false, error: "Email is required" };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Please enter a valid email address" };
  }
  
  return { isValid: true };
}

export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: "Password is required" };
  }
  
  if (password.length < 6) {
    return { isValid: false, error: "Password must be at least 6 characters long" };
  }
  
  return { isValid: true };
}

export function validateDisplayName(displayName: string): ValidationResult {
  if (!displayName) {
    return { isValid: false, error: "Display name is required" };
  }
  
  if (displayName.length < 2) {
    return { isValid: false, error: "Display name must be at least 2 characters long" };
  }
  
  return { isValid: true };
}

export function validatePasswordMatch(password: string, confirmPassword: string): ValidationResult {
  if (password !== confirmPassword) {
    return { isValid: false, error: "Passwords do not match" };
  }
  
  return { isValid: true };
}

export interface SignInFormData {
  email: string;
  password: string;
}

export interface SignUpFormData {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function validateSignInForm(data: SignInFormData): ValidationResult {
  if (!data.email || !data.password) {
    return { isValid: false, error: "Please fill in all fields" };
  }
  
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) {
    return emailValidation;
  }
  
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.isValid) {
    return passwordValidation;
  }
  
  return { isValid: true };
}

export function validateSignUpForm(data: SignUpFormData): ValidationResult {
  if (!data.displayName || !data.email || !data.password || !data.confirmPassword) {
    return { isValid: false, error: "Please fill in all fields" };
  }
  
  const nameValidation = validateDisplayName(data.displayName);
  if (!nameValidation.isValid) {
    return nameValidation;
  }
  
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) {
    return emailValidation;
  }
  
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.isValid) {
    return passwordValidation;
  }
  
  const passwordMatchValidation = validatePasswordMatch(data.password, data.confirmPassword);
  if (!passwordMatchValidation.isValid) {
    return passwordMatchValidation;
  }
  
  return { isValid: true };
}