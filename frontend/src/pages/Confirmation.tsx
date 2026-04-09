import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Calendar, CreditCard, Download, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppHeader from "@/components/AppHeader";

const Confirmation = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const doctor = params.get("doctor") || "Doctor";
  const spec = params.get("spec") || "Specialist";
  const date = params.get("date") || "";
  const time = params.get("time") || "";

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container py-8 max-w-lg">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Booking Confirmed!</h1>
          <p className="text-muted-foreground">Your appointment has been scheduled successfully</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          {/* Appointment Card */}
          <div className="card-elevated mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-primary" />
              <h2 className="font-bold text-foreground text-sm">Appointment Details</h2>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Doctor</span>
                <span className="font-medium text-foreground">Dr. {doctor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Specialization</span>
                <span className="font-medium text-foreground">{spec}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium text-foreground">{date ? new Date(date).toLocaleDateString() : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium text-foreground">{time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-success/10 text-success">Confirmed</span>
              </div>
            </div>
          </div>

          {/* Payment Receipt */}
          <div className="card-elevated mb-6">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-primary" />
              <h2 className="font-bold text-foreground text-sm">Payment Receipt</h2>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Consultation Fee</span>
                <span className="font-medium text-foreground">₹500.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-medium text-foreground">₹0.00</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="font-semibold text-foreground">Total Paid</span>
                <span className="font-bold text-primary">₹500.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction ID</span>
                <span className="font-mono text-xs text-foreground">TXN{Date.now().toString().slice(-8)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 gap-2">
              <Download className="w-4 h-4" /> Download Receipt
            </Button>
            <Button className="flex-1 btn-primary-gradient border-0 gap-2" onClick={() => navigate("/dashboard")}>
              <Home className="w-4 h-4" /> Dashboard
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Confirmation;
