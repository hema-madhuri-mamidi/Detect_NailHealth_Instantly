import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Calendar, CreditCard, Download, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppHeader from "@/components/AppHeader";
import { jsPDF } from "jspdf";

const Confirmation = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const doctor = params.get("doctor") || "Doctor";
  const spec = params.get("spec") || "Specialist";
  const date = params.get("date") || "";
  const time = params.get("time") || "";
  const [txnId] = useState("TXN" + Date.now().toString().slice(-8));

  const handleDownloadReceipt = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("Payment Receipt", 20, 20);
    
    doc.setFontSize(12);
    doc.text(`User Name: N/A`, 20, 35);
    doc.text(`Date: ${date ? new Date(date).toLocaleDateString() : "—"}`, 20, 45);
    doc.text(`Payment Status: Confirmed`, 20, 55);
    doc.text(`Amount: Rs. 500.00`, 20, 65);
    doc.text(`Transaction ID: ${txnId}`, 20, 75);
    
    doc.save(`Receipt_${txnId}.pdf`);
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-background">
      {/* Dynamic ambient background glow */}
      <div className="fixed top-[20%] left-[-10%] w-[500px] h-[500px] bg-success/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />

      <AppHeader />
      <main className="container py-12 max-w-lg relative z-10">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center mb-10">
          <div className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
            <CheckCircle2 className="w-12 h-12 text-success" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">Booking Confirmed!</h1>
          <p className="text-lg text-white/60">Your appointment has been scheduled successfully</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          {/* Appointment Card */}
          <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 mb-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-bold text-white text-lg">Appointment Details</h2>
            </div>
            <div className="space-y-4 text-white/80">
              <div className="flex justify-between items-center">
                <span className="text-white/50 text-sm">Doctor</span>
                <span className="font-bold text-white">Dr. {doctor}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/50 text-sm">Specialization</span>
                <span className="font-medium text-white">{spec}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/50 text-sm">Date</span>
                <span className="font-medium text-white">{date ? new Date(date).toLocaleDateString() : "—"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/50 text-sm">Time</span>
                <span className="font-medium text-white">{time}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-white/50 text-sm">Status</span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-success/20 text-success border border-success/30 shadow-sm">Confirmed</span>
              </div>
            </div>
          </div>

          {/* Payment Receipt */}
          <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 mb-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-accent" />
              </div>
              <h2 className="font-bold text-white text-lg">Payment Receipt</h2>
            </div>
            <div className="space-y-4 text-white/80">
              <div className="flex justify-between items-center">
                <span className="text-white/50 text-sm">Consultation Fee</span>
                <span className="font-medium text-white">₹500.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/50 text-sm">Tax</span>
                <span className="font-medium text-white">₹0.00</span>
              </div>
              <div className="border-t border-white/10 pt-4 mt-2 flex justify-between items-center">
                <span className="font-bold text-white text-base">Total Paid</span>
                <span className="font-bold text-xl text-primary bg-primary/10 px-3 py-1 rounded-lg">₹500.00</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-white/50 text-sm">Transaction ID</span>
                <span className="font-mono text-xs font-medium tracking-wider text-white bg-white/5 px-2 py-1 rounded border border-white/10">{txnId}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={handleDownloadReceipt}
              className="flex-1 h-14 gap-2 text-base font-bold bg-white/5 text-white hover:bg-white/10 border border-white/20 shadow-sm hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300 rounded-2xl"
            >
              <Download className="w-5 h-5" /> Download Receipt
            </Button>
            <Button className="flex-1 h-14 text-base font-bold rounded-2xl text-white bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 border-0 shadow-[0_4px_20px_rgba(126,34,206,0.3)] hover:shadow-[0_8px_30px_rgba(126,34,206,0.5)] transition-all duration-300 transform hover:-translate-y-1 gap-2" onClick={() => navigate("/dashboard")}>
              <Home className="w-5 h-5" /> Dashboard
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Confirmation;
