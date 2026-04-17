import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, FileText, Calendar, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import AppHeader from "@/components/AppHeader";
import { predictions, API_BASE_URL } from "@/lib/api";
import { toConfidencePercent } from "@/lib/confidence";
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
          const condition = p.prediction || "Unknown";
          const isHealthy =
            condition.toLowerCase().includes("healthy") ||
            condition.toLowerCase().includes("normal");
          const conf = toConfidencePercent(p.confidence);
          const reason = (p.reason ?? "").trim();
          const deficiency = (p.deficiency ?? "").trim();
          const diet = (p.diet ?? "").trim();
          return {
            id: p.id.toString(),
            imageUrl: img,
            condition,
            isHealthy,
            confidence: conf,
            explanation:
              reason ||
              (isHealthy
                ? "Your nails appear healthy. If you have symptoms or concerns, consider consulting a clinician."
                : "Review the clinical summary on the report."),
            reason: reason || undefined,
            deficiency: deficiency || undefined,
            diet: diet || undefined,
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
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Dynamic ambient background glow */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[150px] pointer-events-none" />
      
      <AppHeader />
      <main className="container py-12 relative z-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">Dashboard</h1>
          <p className="text-lg text-white/60 mb-10">Welcome back! Start a new analysis or review your history.</p>
        </motion.div>

        {/* Quick Action */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-black/40 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-[2rem] p-8 mb-12 flex flex-col sm:flex-row items-center gap-6 cursor-pointer group hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.6)] transition-all duration-300"
          onClick={() => navigate("/upload")}
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center shrink-0 group-hover:scale-105 shadow-[0_0_20px_rgba(126,34,206,0.3)] transition-all duration-300">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-white mb-2">New Nail Analysis</h2>
            <p className="text-base text-white/60">Upload a photo of your nail to get instant AI-powered health detection</p>
          </div>
          <Button className="btn-primary-gradient border-0 px-8 h-14 text-base rounded-2xl shadow-[0_4px_15px_rgba(126,34,206,0.3)] group-hover:shadow-[0_8px_25px_rgba(126,34,206,0.5)] transition-all duration-300">Start Analysis</Button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {[
            { label: "Total Analyses", value: analyses.length, icon: ImageIcon },
            { label: "Reports Generated", value: analyses.length, icon: FileText },
            { label: "Appointments", value: appointments.length, icon: Calendar },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }} 
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col gap-4 hover:-translate-y-1 hover:bg-white/10 hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-all duration-300 group"
            >
              <div className="flex justify-between items-start">
                <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center shadow-[0_0_15px_rgba(126,34,206,0.15)] group-hover:scale-110 group-hover:bg-primary/30 transition-all duration-300">
                  <s.icon className="w-7 h-7 text-primary/80 group-hover:text-primary transition-colors" />
                </div>
                <p className="text-4xl font-extrabold text-white">{s.value}</p>
              </div>
              <p className="text-sm font-medium text-white/60 uppercase tracking-wider">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* History */}
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 tracking-tight">
          <ImageIcon className="w-6 h-6 text-primary" /> Recent Analyses
        </h2>
        {analyses.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl text-center py-20">
            <div className="w-20 h-20 rounded-full bg-white/5 mx-auto flex items-center justify-center mb-6 shadow-inner">
               <ImageIcon className="w-10 h-10 text-white/40" />
            </div>
            <p className="text-white/60 text-lg">No analyses yet. Start your first one!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {analyses.map(a => (
              <div key={a.id} 
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-5 flex items-center gap-5 cursor-pointer hover:-translate-y-1 hover:bg-white/10 hover:border-primary/30 hover:shadow-[0_8px_25px_rgba(0,0,0,0.4)] transition-all duration-300 group" 
                onClick={() => navigate("/report/" + a.id)}
              >
                <div className="relative shrink-0">
                   <img src={a.imageUrl} alt="Nail" className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-white/10 shadow-md group-hover:shadow-[0_0_15px_rgba(126,34,206,0.3)] transition-all" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg sm:text-xl font-bold text-white truncate mb-1">{a.condition}</p>
                  <p className="text-sm text-white/50">{a.date}</p>
                </div>
                <span
                  className={`shrink-0 text-xs sm:text-sm font-semibold px-4 py-2 rounded-full shadow-sm border ${
                    a.isHealthy ? "bg-success/10 text-success border-success/30" : "bg-destructive/10 text-destructive border-destructive/30"
                  }`}
                >
                  {a.isHealthy ? "Healthy" : "Needs care"}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Appointments */}
        {appointments.length > 0 && (
          <>
            <h2 className="text-2xl font-bold text-white mb-6 mt-16 flex items-center gap-3 tracking-tight">
              <Calendar className="w-6 h-6 text-accent" /> Upcoming Appointments
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
              {appointments.map(a => (
                <div key={a.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 hover:-translate-y-1 hover:bg-white/10 hover:shadow-[0_8px_25px_rgba(0,0,0,0.4)] transition-all duration-300">
                  <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(45,212,191,0.15)]">
                    <Calendar className="w-7 h-7 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xl font-bold text-white mb-1">Dr. {a.doctorName}</p>
                    <p className="text-sm text-white/60 mb-0.5">{a.specialization}</p>
                    <p className="text-xs font-semibold text-accent/80 mt-2 bg-accent/10 inline-block px-2 py-1 rounded-md">{a.date} at {a.time}</p>
                  </div>
                  <span className="text-sm font-semibold px-4 py-2 rounded-full bg-success/10 text-success border border-success/30 shadow-sm self-start sm:self-center mt-3 sm:mt-0">Confirmed</span>
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
