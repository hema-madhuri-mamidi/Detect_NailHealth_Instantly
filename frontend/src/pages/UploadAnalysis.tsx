import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Image as ImageIcon, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp, AnalysisResult } from "@/contexts/AppContext";
import AppHeader from "@/components/AppHeader";
import StepProgress from "@/components/StepProgress";
import { predictions } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const diseases = [
  { condition: "Onychomycosis (Fungal Infection)", explanation: "A fungal infection causing thickened, discolored, and brittle nails. It commonly starts at the tip and spreads inward." },
  { condition: "Psoriasis (Nail)", explanation: "An autoimmune condition that can cause pitting, ridges, and crumbling of the nail plate." },
  { condition: "Melanonychia", explanation: "Dark longitudinal streaks in the nail, which may require evaluation to rule out melanoma." },
  { condition: "Paronychia", explanation: "Infection of the skin around the nail, causing redness, swelling, and pain." },
];

const UploadAnalysis = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const { addAnalysis, setCurrentAnalysis, setCurrentStep } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFile = useCallback((f: File) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
    setResult(null);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) handleFile(f);
  };

  const analyze = async () => {
    if (!file || !preview) return;
    setAnalyzing(true);
    setCurrentStep(1);
    try {
      const apiRes = await predictions.predict(file);
      const confidencePct = Math.round(
        apiRes.confidence <= 1 ? apiRes.confidence * 100 : apiRes.confidence
      );
      const isHealthy =
        apiRes.prediction.toLowerCase().includes("healthy") ||
        apiRes.prediction.toLowerCase().includes("normal");

      const fallbackDisease = diseases[0];
      const res: AnalysisResult = {
        id: apiRes.id.toString(),
        imageUrl: preview,
        condition: apiRes.prediction || "Unknown",
        isHealthy,
        confidence: Math.max(0, Math.min(100, confidencePct)),
        explanation: isHealthy
          ? "Your nails appear healthy. If you have symptoms or concerns, consider consulting a clinician."
          : fallbackDisease.explanation,
        date: new Date(apiRes.created_at).toLocaleDateString(),
        doctorReviewed: false,
      };

      setResult(res);
      addAnalysis(res);
      setCurrentAnalysis(res);
    } catch (err) {
      toast({
        title: "Prediction failed",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const goToReport = () => {
    if (result) navigate("/report/" + result.id);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container py-8 max-w-2xl">
        <StepProgress currentStep={result ? 1 : 0} />

        <AnimatePresence mode="wait">
          {!result && !analyzing && (
            <motion.div key="upload" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h1 className="text-2xl font-bold text-foreground mb-6 text-center">Upload Nail Image</h1>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`card-elevated border-2 border-dashed transition-colors duration-200 text-center py-16 cursor-pointer ${dragOver ? "border-primary bg-primary/5" : "border-border"}`}
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <input id="file-input" type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                {preview ? (
                  <div className="space-y-4">
                    <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-xl object-cover" />
                    <p className="text-sm text-muted-foreground">{file?.name}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
                    <p className="text-foreground font-medium">Drag & drop or click to upload</p>
                    <p className="text-sm text-muted-foreground">Supports JPG, PNG up to 10MB</p>
                  </div>
                )}
              </div>
              {preview && (
                <Button onClick={analyze} className="w-full mt-4 btn-primary-gradient border-0" size="lg">
                  <ImageIcon className="w-4 h-4 mr-2" /> Analyze Nail
                </Button>
              )}
            </motion.div>
          )}

          {analyzing && (
            <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="card-elevated text-center py-20">
              <div className="relative w-32 h-32 mx-auto mb-6">
                <img src={preview!} alt="Analyzing" className="w-full h-full rounded-2xl object-cover" />
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                  <div className="absolute left-0 right-0 h-1 bg-primary/60 animate-scan-line" />
                </div>
                <div className="absolute -inset-3 rounded-3xl border-2 border-primary/30 animate-pulse-ring" />
              </div>
              <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto mb-3" />
              <p className="text-lg font-semibold text-foreground">Analyzing your nail...</p>
              <p className="text-sm text-muted-foreground">Our AI is examining the image for health indicators</p>
            </motion.div>
          )}

          {result && (
            <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="card-elevated space-y-6">
              <div className="flex items-start gap-4">
                <img src={result.imageUrl} alt="Nail" className="w-20 h-20 rounded-xl object-cover" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {result.isHealthy ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-warning" />
                    )}
                    <h2 className="text-xl font-bold text-foreground">{result.condition}</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full ${result.isHealthy ? "bg-success" : "bg-warning"}`}
                        style={{ width: `${result.confidence}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-foreground">{result.confidence}%</span>
                  </div>
                </div>
              </div>
              <div className="bg-secondary rounded-xl p-4">
                <p className="text-sm text-secondary-foreground">{result.explanation}</p>
              </div>
              <Button onClick={goToReport} className="w-full btn-primary-gradient border-0" size="lg">
                View Report & Doctor Review
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default UploadAnalysis;
