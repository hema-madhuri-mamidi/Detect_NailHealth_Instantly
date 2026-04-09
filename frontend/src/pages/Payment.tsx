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
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container py-8 max-w-lg">
        <StepProgress currentStep={4} />
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground mb-6">Payment</h1>

          {/* Summary */}
          <div className="card-medical mb-6 bg-secondary">
            <p className="text-sm text-muted-foreground">Consultation Fee</p>
            <p className="text-2xl font-bold text-foreground">₹500.00</p>
            <p className="text-sm text-secondary-foreground mt-1">Dr. {doctor} • {spec}</p>
          </div>

          {/* Method Toggle */}
          <div className="flex gap-2 mb-6">
            {([["card", CreditCard, "Card"], ["upi", Smartphone, "UPI"]] as const).map(([m, Icon, label]) => (
              <Button key={m} variant={method === m ? "default" : "outline"}
                className={`flex-1 gap-2 ${method === m ? "btn-primary-gradient border-0" : ""}`}
                onClick={() => setMethod(m)}>
                <Icon className="w-4 h-4" /> {label}
              </Button>
            ))}
          </div>

          <div className="card-elevated mb-6 space-y-4">
            {method === "card" ? (
              <>
                <div className="space-y-2">
                  <Label>Card Number</Label>
                  <Input placeholder="4242 4242 4242 4242" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Expiry</Label>
                    <Input placeholder="MM/YY" />
                  </div>
                  <div className="space-y-2">
                    <Label>CVV</Label>
                    <Input placeholder="123" type="password" />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label>UPI ID</Label>
                <Input placeholder="yourname@upi" />
              </div>
            )}
          </div>

          <Button onClick={pay} disabled={processing} className="w-full btn-primary-gradient border-0" size="lg">
            {processing ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2"><Lock className="w-4 h-4" /> Pay ₹500.00</span>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-3 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" /> Secure payment • This is a demo
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default Payment;
