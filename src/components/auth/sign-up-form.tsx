"use client";

import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { PasswordInput } from "./password-input";
import type { SignUpFormData } from "./utils/validation";

interface SignUpFormProps {
  formData: SignUpFormData;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onDisplayNameChange: (displayName: string) => void;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onConfirmPasswordChange: (confirmPassword: string) => void;
}

export function SignUpForm({
  formData,
  loading,
  onSubmit,
  onDisplayNameChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
}: SignUpFormProps) {
  return (
    <>
      <CardHeader className="text-center pb-4">
        <CardTitle className="font-headline">Join TanTime</CardTitle>
        <CardDescription>Create your account to start tracking your tan</CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signup-name">Display Name</Label>
            <Input
              id="signup-name"
              type="text"
              placeholder="Your name"
              value={formData.displayName}
              onChange={(e) => onDisplayNameChange(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <Input
              id="signup-email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => onEmailChange(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <PasswordInput
            id="signup-password"
            label="Password"
            placeholder="At least 6 characters"
            value={formData.password}
            onChange={onPasswordChange}
            disabled={loading}
            required
            minLength={6}
          />
          <PasswordInput
            id="signup-confirm-password"
            label="Confirm Password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={onConfirmPasswordChange}
            disabled={loading}
            required
          />
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full font-headline"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </CardFooter>
      </form>
    </>
  );
}