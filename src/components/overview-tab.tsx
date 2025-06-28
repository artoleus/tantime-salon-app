
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Hourglass, Wallet, Gift, Tag } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Promotion = {
  title: string;
  description: string;
  code: string;
};

const promotions: Promotion[] = [
  {
    title: "20% Off Tanning Sessions",
    description: "Get a 20% discount on any tanning session package.",
    code: "LOTION20",
  },
  {
    title: "10% Off 10+ Sessions",
    description: "Top up with 10 sessions or more and get 10% off the total price.",
    code: "10SESSIONS",
  },
  {
    title: "Bring a Friend for Free",
    description:
      "Share the glow! Bring a friend for a free session with any purchase.",
    code: "FRIENDGLOW",
  },
];

type OverviewData = {
  sessionsUsedThisMonth: number;
  remainingSessions: number;
};

type OverviewTabProps = {
  overviewData: OverviewData;
  onPurchaseClick: () => void;
};

export function OverviewTab({
  overviewData,
  onPurchaseClick,
}: OverviewTabProps) {
  const { toast } = useToast();
  const [promoToConfirm, setPromoToConfirm] = useState<Promotion | null>(null);
  const [revealedPromo, setRevealedPromo] = useState<Promotion | null>(null);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Promo Code Copied",
      description: `Code "${code}" has been copied to your clipboard.`,
    });
  };

  const handleSelectPromo = () => {
    if (promoToConfirm) {
      setRevealedPromo(promoToConfirm);
      navigator.clipboard.writeText(promoToConfirm.code);
      toast({
        title: "Promotion Selected!",
        description: `Code "${promoToConfirm.code}" has been copied to your clipboard.`,
      });
      setPromoToConfirm(null);
    }
  };

  return (
      <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
          <Card
            className="shadow-md transition-all hover:shadow-lg cursor-pointer"
            onClick={onPurchaseClick}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Remaining Sessions
              </CardTitle>
              <Wallet className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-headline">
                {overviewData.remainingSessions} sessions
              </div>
              <div className="text-sm text-muted-foreground">
                {overviewData.remainingSessions * 15} minutes total
              </div>
              <p className="text-xs text-muted-foreground">
                Click to purchase more sessions.
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-md transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sessions Used This Month</CardTitle>
              <Hourglass className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-headline">
                {overviewData.sessionsUsedThisMonth} sessions
              </div>
              <div className="text-sm text-muted-foreground">
                {overviewData.sessionsUsedThisMonth * 15} minutes this month
              </div>
              <p className="text-xs text-muted-foreground">
                Resets at the start of each month.
              </p>
            </CardContent>
          </Card>
      </div>

      <div>
        <h2 className="text-2xl font-headline font-bold mb-4 flex items-center gap-2">
          <Gift className="text-primary" />
          Exclusive Promotions
        </h2>
        {revealedPromo ? (
          <div className="space-y-6">
            <Card className="border-primary border-2 shadow-lg">
              <CardContent className="flex flex-col items-start justify-between p-6 space-y-4">
                <div>
                  <CardTitle className="text-lg font-headline font-semibold">
                    {revealedPromo.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {revealedPromo.description}
                  </p>
                </div>
                <div className="w-full">
                  <div className="bg-background/80 backdrop-blur-sm border border-dashed border-primary/50 rounded-md p-2 flex items-center justify-between">
                    <span className="font-mono text-primary font-bold flex items-center gap-2">
                      <Tag className="h-4 w-4" /> {revealedPromo.code}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-auto px-2 py-1"
                      onClick={() => copyToClipboard(revealedPromo.code)}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6 text-center min-h-[150px]">
                  <Gift className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="text-xl font-headline mt-4">
                    No other promotions available
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    You've selected your promotion. Check back later for more!
                  </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <Carousel className="w-full" opts={{ loop: false }}>
              <CarouselContent>
                {promotions.map((promo, index) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                      <Card className="h-full">
                        <CardContent className="flex flex-col items-start justify-between p-6 space-y-4 min-h-[200px]">
                          <div>
                            <CardTitle className="text-lg font-headline font-semibold">
                              {promo.title}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              {promo.description}
                            </p>
                          </div>
                          <Button
                            className="w-full mt-auto"
                            onClick={() => setPromoToConfirm(promo)}
                          >
                            Reveal Code
                          </Button>
                        </CardContent>
                      </Card>
        </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
            <AlertDialog
              open={!!promoToConfirm}
              onOpenChange={(open) => !open && setPromoToConfirm(null)}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Promotion</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to select this promotion? You can only
                    choose one. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setPromoToConfirm(null)}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={handleSelectPromo}>
                    Yes, Select Promotion
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>
    </div>
  );
}
