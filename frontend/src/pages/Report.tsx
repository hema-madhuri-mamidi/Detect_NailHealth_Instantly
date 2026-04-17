import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, CheckCircle2, AlertTriangle, Clock, Loader2, MessageCircle, Stethoscope, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import AppHeader from "@/components/AppHeader";
import StepProgress from "@/components/StepProgress";
import { ConfidenceBar } from "@/components/ConfidenceBar";
import { MedicalExplanation } from "@/components/MedicalExplanation";
import { toConfidencePercent } from "@/lib/confidence";
import { jsPDF } from "jspdf";

const Report = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { analyses, markDoctorReviewed, currentAnalysis, setCurrentAnalysis, setCurrentStep } = useApp();
  const [reviewing, setReviewing] = useState(false);

  const analysis = analyses.find(a => a.id === id) || currentAnalysis;

  useEffect(() => {
    if (analysis && !analysis.doctorReviewed) {
      setReviewing(true);
      setCurrentStep(2);
      const timer = setTimeout(() => {
        markDoctorReviewed(analysis.id);
        setReviewing(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [analysis?.id]);

  if (!analysis) {
    return (
      <div className="min-h-screen relative bg-background pb-12">
        <div className="fixed top-[20%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="relative z-10 w-full min-h-screen">
          <AppHeader />
          <div className="container py-20 text-center">
            <p className="text-white/50 mb-4">Report not found.</p>
            <Button onClick={() => navigate("/dashboard")} variant="outline" className="rounded-xl border-white/10 text-white hover:bg-white/5">Back to Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  const reviewed = analyses.find(a => a.id === id);
  const isReviewed = reviewed?.doctorReviewed || false;
  const confPct = toConfidencePercent(analysis.confidence);

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("Nail Health Report", 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Prediction: ${analysis.condition}`, 20, 35);
    doc.text(`Confidence: ${confPct}%`, 20, 45);
    
    const reasonText = doc.splitTextToSize(`Reason: ${analysis.reason || "N/A"}`, 170);
    doc.text(reasonText, 20, 55);
    let yPos = 55 + (reasonText.length * 7);
    
    const deficiencyText = doc.splitTextToSize(`Deficiency: ${analysis.deficiency || "N/A"}`, 170);
    doc.text(deficiencyText, 20, yPos);
    yPos += (deficiencyText.length * 7);
    
    const dietText = doc.splitTextToSize(`Diet: ${analysis.diet || "N/A"}`, 170);
    doc.text(dietText, 20, yPos);
    
    doc.save("Nail_Health_Report.pdf");
  };

  return (
    <div className="min-h-screen relative bg-background pb-12">
      {/* Dynamic ambient background glow */}
      <div className="fixed top-[20%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="relative z-10 w-full">
        <AppHeader />
        <main className="container py-8 max-w-2xl">
          <StepProgress currentStep={isReviewed ? 3 : 2} />

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-10">
            {/* Report Card */}
            <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 mb-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                <FileText className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-bold text-white tracking-tight">Analysis Report</h1>
              </div>
              
              <div className="mb-6 flex flex-col gap-6 sm:flex-row sm:items-start">
                <img
                  src={analysis.imageUrl}
                  alt="Nail"
                  className="mx-auto h-24 w-24 shrink-0 rounded-xl object-cover sm:mx-0 shadow-md border border-white/5"
                />
                <div className="min-w-0 flex-1 space-y-4">
                  <div>
                    <p className="break-words font-semibold text-white text-lg">
                      <span className="font-medium text-white/50 text-sm mr-2">Prediction:</span>
                      {analysis.condition}
                    </p>
                    <p className="text-sm text-white/40 mt-1">{analysis.date}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-white/50">
                      Confidence Score
                    </p>
                    <ConfidenceBar confidence={confPct} />
                  </div>
                </div>
              </div>
              
              <div className="rounded-xl bg-white/5 p-6 border border-white/10 text-base text-white/80 leading-relaxed">
                <MedicalExplanation
                  reason={analysis.reason}
                  deficiency={analysis.deficiency}
                  diet={analysis.diet}
                />
                {!analysis.reason && !analysis.deficiency && !analysis.diet ? (
                  <p className="text-white/60 italic">{analysis.explanation}</p>
                ) : null}
              </div>
              
              <div className="flex items-center gap-2 mt-6 text-sm font-medium text-white/50">
                <CheckCircle2 className="w-4 h-4 text-success/80" />
                Report securely generated • Available to patient
              </div>
            </div>

            <Button 
              onClick={handleDownloadPdf}
              className="w-full mb-8 h-14 bg-white/5 text-white hover:bg-white/10 shadow-sm hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/10 transition-all duration-300 rounded-2xl font-bold text-base"
            >
              <Download className="w-5 h-5 mr-3" />
              Download Report PDF
            </Button>

            {/* Doctor Review */}
            <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 mb-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              <h2 className="font-bold text-white mb-6 pb-4 border-b border-white/10 flex items-center gap-3 text-xl">
                <Stethoscope className="w-6 h-6 text-accent" /> Doctor Review
              </h2>
              {reviewing ? (
                <div className="flex items-center gap-4 text-white/70 p-4 bg-white/5 rounded-xl border border-white/5">
                  <Loader2 className="w-6 h-6 animate-spin text-accent" />
                  <div>
                    <p className="font-semibold text-white text-base">Doctor is reviewing your report...</p>
                    <p className="text-sm mt-1">This usually takes a moment</p>
                  </div>
                </div>
              ) : isReviewed ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    <span className="text-base font-semibold text-white">Review Complete</span>
                  </div>
                  <div className={`rounded-xl p-5 text-base border ${analysis.isHealthy ? "bg-success/10 text-success border-success/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]" : "bg-warning/10 text-warning border-warning/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]"}`}>
                    {analysis.isHealthy ? (
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
                        <span className="leading-relaxed font-medium">No need to consult a doctor. Your nails appear healthy!</span>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
                        <span className="leading-relaxed font-medium">Consultation recommended. Please book an appointment with a dermatologist.</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-white/50 text-base p-4 font-medium bg-white/5 rounded-xl border border-white/5">
                  <Clock className="w-5 h-5" /> Waiting for doctor review
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="flex-1 h-14 gap-3 rounded-2xl border-white/10 text-white hover:bg-white/5 hover:text-white transition-colors text-base font-bold shadow-sm" onClick={() => navigate("/chat/" + analysis.id)}>
                <MessageCircle className="w-5 h-5 text-blue-400" /> AI Assistant
              </Button>
              {isReviewed && !analysis.isHealthy && (
                <Button className="flex-1 h-14 gap-3 rounded-2xl text-white bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 border-0 shadow-[0_4px_15px_rgba(126,34,206,0.3)] hover:shadow-[0_8px_30px_rgba(126,34,206,0.5)] transition-all transform hover:-translate-y-1 text-base font-bold" onClick={() => { setCurrentStep(3); navigate("/doctors"); }}>
                  <Stethoscope className="w-5 h-5" /> Consult Doctor
                </Button>
              )}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Report;
