import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CreditCard, Smartphone, Lock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/contexts/AppContext";
import AppHeader from "@/components/AppHeader";
import StepProgress from "@/components/StepProgress";

const Payment = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { addAppointment, setCurrentStep } = useApp();
  const [method, setMethod] = useState<"card" | "upi">("card");
  const [processing, setProcessing] = useState(false);

  const doctor = params.get("doctor") || "Doctor";
  const spec = params.get("spec") || "Specialist";
  const date = params.get("date") || "";
  const time = params.get("time") || "";

  const pay = () => {
    setProcessing(true);
    setTimeout(() => {
      addAppointment({
        id: Date.now().toString(),
        doctorName: doctor,
        specialization: spec,
        date: new Date(date).toLocaleDateString(),
        time,
        paid: true,
      });
      setCurrentStep(4);
      navigate("/confirmation?" + params.toString());
    }, 2000);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Dynamic ambient background glow */}
      <div className="fixed top-[20%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[150px] pointer-events-none" />

      <AppHeader />
      <main className="container py-12 max-w-lg relative z-10">
        <StepProgress currentStep={4} />
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-10">
          <h1 className="text-3xl font-extrabold text-white mb-8 tracking-tight text-center">Complete Payment</h1>

          {/* Summary */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 mb-8 text-center relative overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-accent/5 pointer-events-none" />
            <p className="relative z-10 text-sm font-semibold tracking-widest text-white/50 uppercase mb-3">Consultation Fee</p>
            <p className="relative z-10 text-5xl font-extrabold text-white tracking-tight mb-4 flex items-center justify-center gap-1"><span className="text-3xl text-white/60">₹</span>500.00</p>
            <div className="relative z-10 inline-flex items-center gap-2 bg-black/40 px-4 py-2 rounded-xl border border-white/5">
              <span className="text-sm font-bold text-white">Dr. {doctor}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
              <span className="text-xs font-bold text-accent">{spec}</span>
            </div>
          </div>

          {/* Method Toggle */}
          <div className="flex gap-3 mb-8 bg-black/20 p-2.5 rounded-2xl border border-white/5 shadow-inner">
            {([["card", CreditCard, "Debit / Credit Card"], ["upi", Smartphone, "UPI Transfer"]] as const).map(([m, Icon, label]) => (
              <Button key={m} variant="ghost"
                className={`flex-1 h-12 gap-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${method === m ? "bg-white/10 text-white shadow-md border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]" : "text-white/40 hover:text-white/80 hover:bg-white/5"}`}
                onClick={() => setMethod(m)}>
                <Icon className="w-4 h-4" /> {label}
              </Button>
            ))}
          </div>

          <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 mb-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            {method === "card" ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-white/80 ml-1 text-sm font-semibold">Card Number</Label>
                  <div className="relative group">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-primary transition-colors duration-300" />
                    <Input placeholder="4242 4242 4242 4242" className="pl-12 h-14 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:bg-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-2xl transition-all duration-300 text-lg tracking-widest font-medium" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-white/80 ml-1 text-sm font-semibold">Expiry Date</Label>
                    <Input placeholder="MM/YY" className="h-14 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:bg-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-2xl transition-all duration-300 text-center text-lg tracking-widest font-medium" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/80 ml-1 text-sm font-semibold">Security Code</Label>
                    <Input placeholder="CVV" type="password" className="h-14 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:bg-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-2xl transition-all duration-300 text-center text-lg tracking-widest font-black" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label className="text-white/80 ml-1 text-sm font-semibold">UPI ID / VPA</Label>
                <div className="relative group mt-2">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-primary transition-colors duration-300" />
                  <Input placeholder="yourname@upi" className="pl-12 h-14 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:bg-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-2xl transition-all duration-300 text-base font-medium" />
                </div>
              </div>
            )}
          </div>

          <Button onClick={pay} disabled={processing} className="w-full h-14 text-base font-bold rounded-2xl text-white bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 border-0 shadow-[0_4px_20px_rgba(126,34,206,0.3)] hover:shadow-[0_8px_30px_rgba(126,34,206,0.5)] transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center">
            {processing ? (
              <span className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing Secure Payment...
              </span>
            ) : (
              <span className="flex items-center gap-2"><Lock className="w-5 h-5" /> Pay ₹500.00 Securely</span>
            )}
          </Button>

          <p className="text-xs text-white/40 text-center mt-6 flex items-center justify-center gap-2 font-medium tracking-wide">
            <CheckCircle2 className="w-4 h-4 text-success/60" /> Encrypted standard connection • Demo Mode active
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default Payment;
