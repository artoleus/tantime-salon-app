"use client";

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sun } from "lucide-react";
import { SignInForm } from "@/components/auth/sign-in-form";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { useAuthForms } from "@/components/auth/hooks/use-auth-forms";

export function AuthScreen() {
  const {
    loading,
    signInData,
    signUpData,
    handleSignIn,
    handleSignUp,
    updateSignInData,
    updateSignUpData,
  } = useAuthForms();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary rounded-full p-3">
              <Sun className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-headline font-bold text-foreground">TanTime</h1>
          <p className="text-muted-foreground mt-2">Your personal tanning companion</p>
        </div>

        <Card className="shadow-lg border-0">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {/* Sign In Tab */}
            <TabsContent value="signin" className="space-y-0">
              <SignInForm
                formData={signInData}
                loading={loading}
                onSubmit={handleSignIn}
                onEmailChange={(email) => updateSignInData('email', email)}
                onPasswordChange={(password) => updateSignInData('password', password)}
              />
            </TabsContent>

            {/* Sign Up Tab */}
            <TabsContent value="signup" className="space-y-0">
              <SignUpForm
                formData={signUpData}
                loading={loading}
                onSubmit={handleSignUp}
                onDisplayNameChange={(displayName) => updateSignUpData('displayName', displayName)}
                onEmailChange={(email) => updateSignUpData('email', email)}
                onPasswordChange={(password) => updateSignUpData('password', password)}
                onConfirmPasswordChange={(confirmPassword) => updateSignUpData('confirmPassword', confirmPassword)}
              />
            </TabsContent>
          </Tabs>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>Ready to get your golden glow? ☀️</p>
        </div>
      </div>
    </div>
  );
}