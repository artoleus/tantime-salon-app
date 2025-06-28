
"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, History, KeyRound, User, Wallet, Tag } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";

const PROMO_CODES: { [key: string]: number } = {
  "LOTION20": 0.20,     // 20% off
  "10SESSIONS": 0.10,   // 10% off
};


type ProfileTabProps = {
  onPurchase: (sessions: number, amount: number) => void;
  purchaseHistory: Array<{
    id: string;
    date: string;
    sessions: number;
    amount: number;
  }>;
};

export function ProfileTab({ onPurchase, purchaseHistory }: ProfileTabProps) {
  const { toast } = useToast();
  const [customSessions, setCustomSessions] = useState(1);
  const pricePerSession = 2.50; // $2.50 per 15-minute session
  
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(customSessions * pricePerSession);

  useEffect(() => {
    const basePrice = customSessions * pricePerSession;
    const finalPrice = basePrice * (1 - discount);
    setTotalPrice(finalPrice);
  }, [customSessions, discount]);

  const handleApplyPromo = () => {
    const code = promoCode.toUpperCase();
    if (PROMO_CODES[code]) {
      const newDiscount = PROMO_CODES[code];
      setDiscount(newDiscount);
      toast({
        title: "Promo Code Applied!",
        description: `You've received a ${newDiscount * 100}% discount.`,
      });
    } else {
      setDiscount(0);
      toast({
        variant: "destructive",
        title: "Invalid Promo Code",
        description: "The entered promo code is not valid.",
      });
    }
  };


  const handlePurchase = async () => {
    try {
      await onPurchase(customSessions, totalPrice);
      const totalMinutes = customSessions * 15;
      toast({
        title: "Purchase Successful!",
        description: `You've added ${customSessions} ${customSessions === 1 ? 'session' : 'sessions'} (${totalMinutes} minutes). Your new balance is reflected on the Overview tab.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Purchase Failed",
        description: "There was an error processing your purchase. Please try again.",
      });
    }
  };

  const handlePayAsYouGo = async () => {
    try {
      await onPurchase(1, pricePerSession); // 1 session = 15 minutes
      toast({
        title: "Pay-As-You-Go Session Purchased!",
        description: "You've purchased a 15-minute session for $2.50. You can now scan to start your session.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Purchase Failed",
        description: "There was an error processing your pay-as-you-go purchase. Please try again.",
      });
    }
  };

  const handlePasswordUpdate = () => {
    toast({
      title: "Password Updated",
      description: "Your password has been changed successfully.",
    });
  };


  return (
    <div className="space-y-6">
      {/* Pay-As-You-Go Quick Purchase */}
      <Card className="shadow-md border-2 border-accent/50">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center gap-2">
            <CreditCard className="text-accent" />
            Pay-As-You-Go Session
          </CardTitle>
          <CardDescription>
            Need a quick session? Purchase a single 15-minute session instantly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between bg-accent/10 p-4 rounded-lg">
            <div>
              <p className="font-semibold">15-Minute Session</p>
              <p className="text-sm text-muted-foreground">Perfect for a quick glow</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-accent">$2.50</p>
              <p className="text-xs text-muted-foreground">No commitment</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full font-headline text-lg bg-accent hover:bg-accent/90" 
            size="lg" 
            onClick={handlePayAsYouGo}
          >
            <Wallet className="mr-2 h-5 w-5"/> 
            Buy 15-Min Session - $2.50
          </Button>
        </CardFooter>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-md">
            <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-2"><User className="text-primary"/>Profile Details</CardTitle>
            <CardDescription>Manage your account information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" defaultValue="sunny_glow" disabled />
            </div>
            <div className="space-y-2">
                <Label htmlFor="current-password" className="flex items-center gap-2"><KeyRound/>Current Password</Label>
                <Input id="current-password" type="password" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
            </div>
            </CardContent>
            <CardFooter>
            <Button className="w-full font-headline" onClick={handlePasswordUpdate}>Update Password</Button>
            </CardFooter>
        </Card>

        <Card className="shadow-md">
            <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-2"><Wallet className="text-primary"/>Purchase Sessions</CardTitle>
            <CardDescription>Top up your tanning time. Each session is 15 minutes. Payments powered by Stripe.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-4">
                    <Label htmlFor="sessions-input" className="text-base">Choose sessions (1-20)</Label>
                    <div className="flex items-center gap-4">
                        <Slider id="sessions-slider" value={[customSessions]} onValueChange={(value) => setCustomSessions(value[0])} min={1} max={20} step={1} className="w-full"/>
                        <Input id="sessions-input" type="number" value={customSessions} onChange={(e) => setCustomSessions(Math.max(1, Math.min(20, Number(e.target.value) || 1)))} className="w-20 text-center font-bold text-lg"/>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {customSessions} {customSessions === 1 ? 'session' : 'sessions'} = {customSessions * 15} minutes
                    </p>
                </div>

                <Separator/>

                <div className="space-y-2">
                <Label htmlFor="promo-code" className="flex items-center gap-2"><Tag />Promo Code</Label>
                <div className="flex gap-2">
                    <Input id="promo-code" placeholder="Enter code" value={promoCode} onChange={e => setPromoCode(e.target.value)} />
                    <Button variant="outline" onClick={handleApplyPromo}>Apply</Button>
                </div>
                </div>

                <Separator/>

                <div className="space-y-4">
                <Label>Payment Information</Label>
                <div className="space-y-2">
                    <Input placeholder="Card Number" />
                    <div className="flex gap-2">
                    <Input placeholder="MM / YY" />
                    <Input placeholder="CVC" />
                    </div>
                </div>
                </div>
                
                <div className="text-center bg-secondary/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground font-headline">Total Price</p>
                    {discount > 0 && (
                    <p className="text-sm text-muted-foreground line-through">${(customSessions * pricePerSession).toFixed(2)}</p>
                    )}
                    <p className="text-4xl font-headline font-bold text-primary">${totalPrice.toFixed(2)}</p>
                    {discount > 0 && (
                    <p className="text-xs text-accent font-semibold">{(discount * 100)}% discount applied!</p>
                    )}
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full font-headline text-lg" size="lg" onClick={handlePurchase}>
                    <CreditCard className="mr-2 h-5 w-5"/> Purchase for ${totalPrice.toFixed(2)}
                </Button>
            </CardFooter>
        </Card>
      </div>
      <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-2"><History className="text-primary"/>Purchase History</CardTitle>
            <CardDescription>View your past tanning session purchases.</CardDescription>
        </CardHeader>
        <CardContent>
            <ScrollArea className="h-72 w-full pr-4">
                <div className="space-y-4">
                    {purchaseHistory.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No purchase history yet.</p>
                    ) : (
                      purchaseHistory.map((item, index) => (
                        <React.Fragment key={item.id}>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{item.sessions} {item.sessions === 1 ? 'session' : 'sessions'} ({item.sessions * 15} min)</p>
                                    <p className="text-sm text-muted-foreground">{new Date(item.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                                <p className="font-bold text-lg">${item.amount.toFixed(2)}</p>
                            </div>
                            {index < purchaseHistory.length - 1 && <Separator />}
                        </React.Fragment>
                      ))
                    )}
                </div>
            </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

