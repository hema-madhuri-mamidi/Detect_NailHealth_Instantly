import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, ArrowRight, Shield, Cpu, MessageCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react"; // (if not already there)

const features = [
  { icon: Cpu, title: "AI Analysis", desc: "Advanced nail condition detection with confidence scoring" },
  { icon: MessageCircle, title: "AI Assistant", desc: "Get clear explanations and doctor-mediated guidance" },
  { icon: FileText, title: "Smart Reports", desc: "Automated reports shared with your healthcare provider" },
  { icon: Shield, title: "Doctor Review", desc: "Every analysis is reviewed by qualified professionals" },
];

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user]);
  if (user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="border-b border-border bg-card/60 backdrop-blur-md">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2 font-bold text-lg">
            <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
              <Activity className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-foreground">NailHealth<span className="text-primary">AI</span></span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" asChild><Link to="/login">Log in</Link></Button>
            <Button asChild className="btn-primary-gradient border-0"><Link to="/signup">Get Started</Link></Button>
          </div>
        </div>
      </header>

      <main>
        <section className="container py-20 md:py-32 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Cpu className="w-3.5 h-3.5" /> AI-Powered Healthcare
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-foreground">
              Detect Nail Health<br />
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-hero)" }}>
                Issues Instantly
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
              Upload a photo of your nail and get AI-powered analysis, doctor review, and consultation — all in one seamless experience.
            </p>
            <div className="flex gap-3 justify-center">
              <Button size="lg" asChild className="btn-primary-gradient border-0 text-base">
                <Link to="/signup">Start Free Analysis <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">Log In</Link>
              </Button>
            </div>
          </motion.div>
        </section>

        <section className="container pb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }} className="card-elevated hover:-translate-y-1 transition-transform duration-200">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Landing;
