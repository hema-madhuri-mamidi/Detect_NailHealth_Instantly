import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, FileText, Calendar, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import AppHeader from "@/components/AppHeader";
import { predictions, API_BASE_URL } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const { analyses, appointments, setAnalyses } = useApp();
  const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await predictions.list();
        if (cancelled) return;
        const mapped = res.results.map((p) => {
          const img =
            p.image_url && p.image_url.startsWith("http")
              ? p.image_url
              : p.image_url
                ? `${API_BASE_URL}${p.image_url}`
                : "";
          const confidencePct = Math.round(
            p.confidence <= 1 ? p.confidence * 100 : p.confidence
          );
          const condition = p.prediction || "Unknown";
          const isHealthy =
            condition.toLowerCase().includes("healthy") ||
            condition.toLowerCase().includes("normal");
          return {
            id: p.id.toString(),
            imageUrl: img,
            condition,
            isHealthy,
            confidence: Math.max(0, Math.min(100, confidencePct)),
            explanation: "",
            date: new Date(p.created_at).toLocaleDateString(),
            doctorReviewed: false,
          };
        });
        setAnalyses(mapped);
      } catch (err) {
        // If token expired etc, ProtectedRoute will redirect on next nav
        toast({
          title: "Couldn't load history",
          description: err instanceof Error ? err.message : "Please try again",
          variant: "destructive",
        });
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground mb-8">Welcome back! Start a new analysis or review your history.</p>
        </motion.div>

        {/* Quick Action */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="card-elevated mb-8 flex flex-col sm:flex-row items-center gap-6 cursor-pointer group"
          onClick={() => navigate("/upload")}
        >
          <div className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Upload className="w-7 h-7 text-primary-foreground" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-foreground">New Nail Analysis</h2>
            <p className="text-sm text-muted-foreground">Upload a photo of your nail to get instant AI-powered health detection</p>
          </div>
          <Button className="btn-primary-gradient border-0">Start Analysis</Button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Analyses", value: analyses.length, icon: ImageIcon },
            { label: "Reports Generated", value: analyses.length, icon: FileText },
            { label: "Appointments", value: appointments.length, icon: Calendar },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }} className="card-medical flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <s.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* History */}
        <h2 className="text-xl font-bold text-foreground mb-4">Recent Analyses</h2>
        {analyses.length === 0 ? (
          <div className="card-medical text-center py-12">
            <ImageIcon className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No analyses yet. Start your first one!</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {analyses.map(a => (
              <div key={a.id} className="card-medical flex items-center gap-4 cursor-pointer hover:-translate-y-0.5 transition-transform" onClick={() => navigate("/report/" + a.id)}>
                <img src={a.imageUrl} alt="Nail" className="w-14 h-14 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{a.condition}</p>
                  <p className="text-xs text-muted-foreground">{a.date}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${a.isHealthy ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                  {a.confidence}%
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Appointments */}
        {appointments.length > 0 && (
          <>
            <h2 className="text-xl font-bold text-foreground mb-4 mt-8">Appointments</h2>
            <div className="grid gap-3">
              {appointments.map(a => (
                <div key={a.id} className="card-medical flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">Dr. {a.doctorName}</p>
                    <p className="text-xs text-muted-foreground">{a.specialization} • {a.date} at {a.time}</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-success/10 text-success">Confirmed</span>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
