import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppHeader from "@/components/AppHeader";
import StepProgress from "@/components/StepProgress";

const doctors = [
  { id: "1", name: "Dr. Sarah Mitchell", specialization: "Dermatologist", rating: 4.8, location: "City Medical Center", timings: "Mon-Fri, 9AM-5PM", image: "SM" },
  { id: "2", name: "Dr. James Wilson", specialization: "Dermatologist", rating: 4.6, location: "HealthPlus Clinic", timings: "Mon-Sat, 10AM-6PM", image: "JW" },
  { id: "3", name: "Dr. Priya Sharma", specialization: "Nail Specialist", rating: 4.9, location: "Skin & Nail Care Center", timings: "Tue-Sat, 8AM-4PM", image: "PS" },
  { id: "4", name: "Dr. Michael Chen", specialization: "Dermatologist", rating: 4.7, location: "Metro Health Hospital", timings: "Mon-Thu, 11AM-7PM", image: "MC" },
];

const DoctorList = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Dynamic ambient background glow */}
      <div className="fixed top-[20%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[150px] pointer-events-none" />

      <AppHeader />
      <main className="container py-12 max-w-3xl relative z-10">
        <StepProgress currentStep={3} />
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-10">
          <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Nearby Doctors</h1>
          <p className="text-white/60 mb-8 text-lg">Select a specialist below to book your consultation.</p>
          
          <div className="space-y-4">
            {doctors.map((d, i) => (
              <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-5 hover:-translate-y-1 hover:bg-white/5 hover:border-primary/40 hover:shadow-[0_8px_30px_rgba(126,34,206,0.3)] transition-all duration-300 group">
                
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center text-white font-bold text-2xl shrink-0 shadow-[0_0_15px_rgba(126,34,206,0.2)] group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(126,34,206,0.4)] transition-all duration-300">
                  {d.image}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between sm:justify-start gap-3 mb-1">
                     <p className="font-bold text-xl text-white group-hover:text-primary transition-colors">{d.name}</p>
                     {/* Mobile rating display inline */}
                     <span className="flex sm:hidden items-center gap-1.5 text-sm font-bold text-white bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
                       <Star className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />{d.rating}
                     </span>
                  </div>
                  <p className="text-sm font-medium text-accent/90 mb-3">{d.specialization}</p>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-5 text-sm text-white/50">
                    <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-white/40" />{d.location}</span>
                    <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-white/40" />{d.timings}</span>
                  </div>
                </div>
                
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 sm:gap-3 shrink-0 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t border-white/5 sm:border-t-0">
                  {/* Desktop rating display */}
                  <span className="hidden sm:flex items-center gap-1.5 text-base font-bold text-white bg-white/5 px-3.5 py-1.5 rounded-lg border border-white/10 shadow-sm group-hover:border-white/20 transition-colors">
                    <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />{d.rating}
                  </span>
                  
                  <Button className="w-full sm:w-auto px-6 h-11 rounded-xl font-bold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white border-0 shadow-[0_4px_15px_rgba(126,34,206,0.3)] hover:shadow-[0_8px_25px_rgba(126,34,206,0.5)] transition-all duration-300 transform group-hover:-translate-y-0.5" onClick={() => navigate(`/book/${d.id}`)}>
                    Book Now
                  </Button>
                </div>
                
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default DoctorList;
