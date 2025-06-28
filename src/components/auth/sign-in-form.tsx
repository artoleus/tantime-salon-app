"use client";

import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { PasswordInput } from "./password-input";
import type { SignInFormData } from "./utils/validation";

interface SignInFormProps {
  formData: SignInFormData;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
}

export function SignInForm({
  formData,
  loading,
  onSubmit,
  onEmailChange,
  onPasswordChange,
}: SignInFormProps) {
  return (
    <>
      <CardHeader className="text-center pb-4">
        <CardTitle className="font-headline">Welcome Back</CardTitle>
        <CardDescription>Sign in to access your tanning hours</CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signin-email">Email</Label>
            <Input
              id="signin-email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => onEmailChange(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <PasswordInput
            id="signin-password"
            label="Password"
            placeholder="Your password"
            value={formData.password}
            onChange={onPasswordChange}
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
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </CardFooter>
      </form>
    </>
  );
}