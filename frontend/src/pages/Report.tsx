import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, CheckCircle2, AlertTriangle, Clock, Loader2, MessageCircle, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import AppHeader from "@/components/AppHeader";
import StepProgress from "@/components/StepProgress";

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
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="container py-20 text-center">
          <p className="text-muted-foreground">Report not found.</p>
          <Button onClick={() => navigate("/dashboard")} variant="outline" className="mt-4">Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const reviewed = analyses.find(a => a.id === id);
  const isReviewed = reviewed?.doctorReviewed || false;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container py-8 max-w-2xl">
        <StepProgress currentStep={isReviewed ? 3 : 2} />

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {/* Report Card */}
          <div className="card-elevated mb-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-bold text-foreground">Analysis Report</h1>
            </div>
            <div className="flex items-start gap-4 mb-4">
              <img src={analysis.imageUrl} alt="Nail" className="w-16 h-16 rounded-xl object-cover" />
              <div>
                <p className="font-semibold text-foreground">{analysis.condition}</p>
                <p className="text-sm text-muted-foreground">{analysis.date}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${analysis.isHealthy ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                    {analysis.confidence}% confidence
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-secondary rounded-xl p-4 text-sm text-secondary-foreground">
              {analysis.explanation}
            </div>
            <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-success" />
              Report sent to doctor • Report available to patient
            </div>
          </div>

          {/* Doctor Review */}
          <div className="card-elevated mb-6">
            <h2 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-primary" /> Doctor Review
            </h2>
            {reviewing ? (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <div>
                  <p className="font-medium text-foreground">Doctor is reviewing your report...</p>
                  <p className="text-sm">This usually takes a moment</p>
                </div>
              </div>
            ) : isReviewed ? (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span className="text-sm font-medium text-foreground">Doctor reviewed your report</span>
                </div>
                <div className={`rounded-xl p-4 text-sm ${analysis.isHealthy ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                  {analysis.isHealthy ? (
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>No need to consult a doctor. Your nails appear healthy!</span>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>Consultation recommended. Please book an appointment with a dermatologist.</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" /> Waiting for doctor review
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 gap-2" onClick={() => navigate("/chat/" + analysis.id)}>
              <MessageCircle className="w-4 h-4" /> AI Assistant
            </Button>
            {isReviewed && !analysis.isHealthy && (
              <Button className="flex-1 btn-primary-gradient border-0 gap-2" onClick={() => { setCurrentStep(3); navigate("/doctors"); }}>
                <Stethoscope className="w-4 h-4" /> Consult Doctor
              </Button>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Report;
