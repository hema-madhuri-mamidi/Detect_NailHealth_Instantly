import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { LogOut, Activity, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const AppHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
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
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-2xl transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
      <div className="container flex items-center justify-between h-20">
        <Link to="/dashboard" className="flex items-center gap-3 font-bold text-xl group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center shadow-[0_0_15px_rgba(126,34,206,0.3)] group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(126,34,206,0.5)] transition-all duration-300">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-white tracking-tight">NailHealth<span className="text-primary transition-colors group-hover:text-primary/80">AI</span></span>
        </Link>
        {user && (
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/dashboard")} 
              className={`gap-2 h-10 px-4 rounded-xl transition-all duration-300 border ${
                pathname === "/dashboard" 
                  ? "bg-white/10 text-white border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)]" 
                  : "text-white/60 hover:text-white border-transparent hover:bg-white/5"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Button>
            
            <div className="hidden sm:flex items-center gap-3 ml-2 pl-6 border-l border-white/10">
              <span className="text-sm font-medium text-white/80">Hi, {user.name}</span>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout}
              className="text-white/60 hover:text-white hover:bg-destructive/20 hover:text-destructive hover:border-destructive/30 border border-transparent rounded-xl transition-all duration-300 ml-2"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
