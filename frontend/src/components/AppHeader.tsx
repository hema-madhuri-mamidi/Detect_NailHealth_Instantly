import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { LogOut, Activity, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const AppHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      toast({
        title: "Logout failed",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      navigate("/");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container flex items-center justify-between h-16">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg">
          <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
            <Activity className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-foreground">NailHealth<span className="text-primary">AI</span></span>
        </Link>
        {user && (
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="gap-2">
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Button>
            <span className="text-sm text-muted-foreground hidden sm:block">Hi, {user.name}</span>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
