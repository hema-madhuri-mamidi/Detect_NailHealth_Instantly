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
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container py-8 max-w-2xl">
        <StepProgress currentStep={3} />
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground mb-2">Nearby Doctors</h1>
          <p className="text-muted-foreground mb-6">Select a doctor to book a consultation</p>
          <div className="space-y-3">
            {doctors.map((d, i) => (
              <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="card-elevated flex items-center gap-4 hover:-translate-y-0.5 transition-transform">
                <div className="w-14 h-14 rounded-xl gradient-hero flex items-center justify-center text-primary-foreground font-bold text-lg shrink-0">
                  {d.image}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{d.name}</p>
                  <p className="text-sm text-primary">{d.specialization}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{d.location}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{d.timings}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="flex items-center gap-1 text-sm font-semibold text-foreground">
                    <Star className="w-3.5 h-3.5 text-warning fill-warning" />{d.rating}
                  </span>
                  <Button size="sm" className="btn-primary-gradient border-0" onClick={() => navigate(`/book/${d.id}`)}>
                    Book
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
