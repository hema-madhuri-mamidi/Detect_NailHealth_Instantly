import React, { createContext, useContext, useState, ReactNode } from "react";

export interface AnalysisResult {
  id: string;
  imageUrl: string;
  condition: string;
  isHealthy: boolean;
  confidence: number;
  explanation: string;
  reason?: string;
  deficiency?: string;
  diet?: string;
  date: string;
  doctorReviewed: boolean;
  doctorSuggestion?: string;
}

export interface Appointment {
  id: string;
  doctorName: string;
  specialization: string;
  date: string;
  time: string;
  paid: boolean;
}

interface AppContextType {
  analyses: AnalysisResult[];
  appointments: Appointment[];
  currentAnalysis: AnalysisResult | null;
  addAnalysis: (a: AnalysisResult) => void;
  setAnalyses: (a: AnalysisResult[]) => void;
  setCurrentAnalysis: (a: AnalysisResult | null) => void;
  markDoctorReviewed: (id: string) => void;
  addAppointment: (a: Appointment) => void;
  currentStep: number;
  setCurrentStep: (s: number) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const addAnalysis = (a: AnalysisResult) => setAnalyses(prev => [a, ...prev]);
  const markDoctorReviewed = (id: string) => {
    setAnalyses(prev => prev.map(a => a.id === id ? { ...a, doctorReviewed: true, doctorSuggestion: a.isHealthy ? "No consultation needed. Your nails appear healthy." : "Consultation recommended. Please book an appointment with a dermatologist." } : a));
    setCurrentAnalysis(prev => prev?.id === id ? { ...prev, doctorReviewed: true, doctorSuggestion: prev.isHealthy ? "No consultation needed. Your nails appear healthy." : "Consultation recommended. Please book an appointment with a dermatologist." } : prev);
  };
  const addAppointment = (a: Appointment) => setAppointments(prev => [a, ...prev]);

  return (
    <AppContext.Provider value={{ analyses, appointments, currentAnalysis, addAnalysis, setAnalyses, setCurrentAnalysis, markDoctorReviewed, addAppointment, currentStep, setCurrentStep }}>
      {children}
    </AppContext.Provider>
  );
};
