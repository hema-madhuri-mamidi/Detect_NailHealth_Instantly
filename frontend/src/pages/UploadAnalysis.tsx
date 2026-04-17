import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Image as ImageIcon, Loader2, CheckCircle2, AlertTriangle, Activity, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp, AnalysisResult } from "@/contexts/AppContext";
import AppHeader from "@/components/AppHeader";
import StepProgress from "@/components/StepProgress";
import { ConfidenceBar } from "@/components/ConfidenceBar";
import { toConfidencePercent } from "@/lib/confidence";
import { predictions } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { MedicalExplanation } from "@/components/MedicalExplanation";

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
      const isHealthy =
        apiRes.prediction.toLowerCase().includes("healthy") ||
        apiRes.prediction.toLowerCase().includes("normal");

      const conf = toConfidencePercent(apiRes.confidence);
      const reason = (apiRes.reason ?? "").trim();
      const deficiency = (apiRes.deficiency ?? "").trim();
      const diet = (apiRes.diet ?? "").trim();
      const explanation =
        reason ||
        (isHealthy
          ? "Your nails appear healthy. If you have symptoms or concerns, consider consulting a clinician."
          : "Review the clinical summary below. Consider consulting a dermatologist for confirmation.");

      const res: AnalysisResult = {
        id: apiRes.id.toString(),
        imageUrl: preview,
        condition: apiRes.prediction || "Unknown",
        isHealthy,
        confidence: conf,
        explanation,
        reason: reason || undefined,
        deficiency: deficiency || undefined,
        diet: diet || undefined,
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
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Dynamic ambient background glow */}
      <div className="fixed top-[20%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[150px] pointer-events-none" />
      
      <AppHeader />
      <main className="container py-12 max-w-5xl relative z-10">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">AI Nail Analysis</h1>
          <p className="text-lg text-white/60">Upload a clear photo of your nail to detect potential health conditions.</p>
        </div>

        <StepProgress currentStep={result ? 1 : 0} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12 items-start">
          {/* LEFT: Upload UI */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`bg-black/40 backdrop-blur-2xl border-2 border-dashed rounded-[2rem] p-8 text-center transition-all duration-300 cursor-pointer shadow-[0_8px_32px_rgba(0,0,0,0.5)] group 
                ${dragOver ? "border-primary/80 bg-primary/10 shadow-[0_0_30px_rgba(126,34,206,0.3)]" : "border-white/20 hover:border-primary/50 hover:bg-white/5 hover:shadow-[0_0_20px_rgba(126,34,206,0.2)]"}`}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <input id="file-input" type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
              
              {preview ? (
                <div className="space-y-6 relative">
                  <div className="relative inline-block">
                    <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-2xl object-cover shadow-[0_10px_30px_rgba(0,0,0,0.5)] group-hover:scale-[1.02] transition-transform duration-300" />
                    <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 pointer-events-none" />
                  </div>
                  <p className="text-sm font-medium text-white/80">{file?.name}</p>
                </div>
              ) : (
                <div className="py-12 space-y-4">
                  <div className="w-20 h-20 rounded-full bg-white/5 mx-auto flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                    <Upload className="w-10 h-10 text-white/50 group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-xl font-bold text-white transition-colors group-hover:text-primary/90">Drag & drop image</p>
                  <p className="text-sm text-white/50">or click to browse from your device</p>
                  <p className="text-xs text-white/30 pt-4 font-mono uppercase tracking-widest">JPG, PNG up to 10MB</p>
                </div>
              )}
            </div>

            {preview && !analyzing && !result && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
                <Button onClick={analyze} className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 border-0 shadow-[0_4px_20px_rgba(126,34,206,0.3)] hover:shadow-[0_8px_30px_rgba(126,34,206,0.5)] transition-all duration-300 transform hover:-translate-y-1">
                  <ImageIcon className="w-5 h-5 mr-2" /> Start Analysis
                </Button>
              </motion.div>
            )}
            
            {preview && result && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
                <Button onClick={() => { setFile(null); setPreview(null); setResult(null); }} variant="outline" className="w-full h-14 text-base font-bold rounded-2xl text-white border-white/20 hover:bg-white/10 transition-all shadow-sm">
                  Upload Another Image
                </Button>
              </motion.div>
            )}
          </motion.div>

          {/* RIGHT: Status / Report */}
          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              {!analyzing && !result && (
                <motion.div key="empty" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="h-full min-h-[400px] flex flex-col items-center justify-center bg-black/20 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 text-center border-dashed">
                  <Activity className="w-16 h-16 text-white/20 mb-4" />
                  <h3 className="text-xl font-bold text-white/40 mb-2">Awaiting Image</h3>
                  <p className="text-white/30 text-sm max-w-[200px]">Upload a nail image on the left to generate the clinical report here.</p>
                </motion.div>
              )}

              {analyzing && (
                <motion.div key="analyzing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-black/40 backdrop-blur-2xl border border-primary/30 rounded-[2rem] shadow-[0_0_40px_rgba(126,34,206,0.2)] p-12 text-center h-full min-h-[400px] flex flex-col items-center justify-center">
                  
                  {/* Dynamic Image Scan Line Effect */}
                  <div className="relative w-32 h-32 mx-auto mb-8">
                    <div className="absolute inset-0 rounded-2xl ring-4 ring-primary/20 z-0" />
                    <img src={preview!} alt="Scan Target" className="w-full h-full rounded-2xl object-cover opacity-80" />
                    <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                      {/* Scan line going down (Blue Glow) */}
                      <motion.div 
                        animate={{ top: ["-10%", "110%"] }} 
                        transition={{ duration: 2, ease: "linear", repeat: Infinity }} 
                        className="absolute left-0 right-0 h-[3px] bg-blue-500 shadow-[0_0_20px_5px_rgba(59,130,246,0.8)] z-10" 
                      />
                      {/* Shimmer gradient tracking below scan line */}
                      <motion.div 
                        animate={{ top: ["-60%", "60%"] }} 
                        transition={{ duration: 2, ease: "linear", repeat: Infinity }} 
                        className="absolute left-0 right-0 h-[50%] bg-gradient-to-b from-transparent to-blue-500/30" 
                      />
                    </div>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-white mb-2">Analyzing nail image...</h2>
                  <p className="text-white/60 max-w-[250px] mx-auto text-sm animate-pulse">Extracting texture, color boundaries, and detecting clinical biomarkers.</p>
                </motion.div>
              )}

              {result && (
                <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="bg-black/40 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-[2rem] p-8 flex flex-col h-full relative overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${result.isHealthy ? 'bg-success' : 'bg-destructive'} shadow-[0_0_10px_currentColor]`} />
                  
                  <div className="flex items-center gap-4 mb-6 mt-2">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 shadow-[0_0_15px_currentColor] ${result.isHealthy ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                      {result.isHealthy ? <CheckCircle2 className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-1">Prediction Result</p>
                      <h2 className="text-2xl font-bold text-white leading-tight">{result.condition}</h2>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10 mb-6">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-sm font-medium text-white/70">AI Confidence Level</span>
                       <span className="text-sm font-bold text-white">{result.confidence.toFixed(2)}%</span>
                    </div>
                    {/* Animated Progress Bar */}
                    <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }} 
                         animate={{ width: `${result.confidence}%` }} 
                         transition={{ duration: 1, ease: "easeOut" }}
                         className="h-full bg-gradient-to-r from-primary to-accent rounded-full shadow-[0_0_10px_currentColor]"
                       />
                    </div>
                  </div>

                  <div className="flex-1 bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 space-y-4 mb-6 text-sm text-white/80 leading-relaxed overflow-y-auto custom-scrollbar">
                    <MedicalExplanation
                      reason={result.reason}
                      deficiency={result.deficiency}
                      diet={result.diet}
                    />
                    {!result.reason && !result.deficiency && !result.diet ? (
                      <p className="text-white/60 italic">{result.explanation}</p>
                    ) : null}
                  </div>

                  <Button onClick={goToReport} className="w-full mt-auto h-14 text-base font-bold rounded-2xl text-white bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 border-0 shadow-[0_4px_20px_rgba(126,34,206,0.3)] hover:shadow-[0_8px_30px_rgba(126,34,206,0.5)] transition-all duration-300 transform hover:-translate-y-1 tracking-wide">
                    <FileText className="w-5 h-5 mr-2" /> View Detailed Report
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UploadAnalysis;
