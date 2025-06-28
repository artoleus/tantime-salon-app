import { Logo } from "./icons";
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/auth-context";
import { LogOut, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AppHeader() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sign Out Failed",
        description: "Failed to sign out. Please try again.",
      });
    }
  };

  return (
    <header className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <Logo className="h-10 w-10 text-primary" />
        <h1 className="text-4xl font-headline font-bold text-foreground">
          TanTime
        </h1>
      </div>
      
      {user && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserIcon className="h-4 w-4" />
            <span className="hidden sm:inline">{user.displayName || user.email}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      )}
    </header>
  );
}
