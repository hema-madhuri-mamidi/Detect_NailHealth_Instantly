import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppHeader from "@/components/AppHeader";
import StepProgress from "@/components/StepProgress";

const doctorMap: Record<string, { name: string; specialization: string }> = {
  "1": { name: "Sarah Mitchell", specialization: "Dermatologist" },
  "2": { name: "James Wilson", specialization: "Dermatologist" },
  "3": { name: "Priya Sharma", specialization: "Nail Specialist" },
  "4": { name: "Michael Chen", specialization: "Dermatologist" },
};

const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"];

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const doctor = doctorMap[doctorId || "1"];
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const confirm = () => {
    if (date && time) {
      navigate(`/payment?doctor=${doctor.name}&spec=${doctor.specialization}&date=${date}&time=${time}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container py-8 max-w-lg">
        <StepProgress currentStep={3} />
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground mb-6">Book Appointment</h1>
          <div className="card-elevated mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center text-primary-foreground font-bold">
                {doctor.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <p className="font-semibold text-foreground">Dr. {doctor.name}</p>
                <p className="text-sm text-primary">{doctor.specialization}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Select Date</Label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split("T")[0]} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Clock className="w-4 h-4" /> Select Time</Label>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map(t => (
                    <Button key={t} variant={time === t ? "default" : "outline"} size="sm"
                      className={time === t ? "btn-primary-gradient border-0" : ""} onClick={() => setTime(t)}>
                      {t}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {date && time && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-medical mb-4 bg-secondary">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="text-secondary-foreground">
                  Dr. {doctor.name} • {new Date(date).toLocaleDateString()} at {time}
                </span>
              </div>
            </motion.div>
          )}

          <Button onClick={confirm} disabled={!date || !time} className="w-full btn-primary-gradient border-0" size="lg">
            Proceed to Payment
          </Button>
        </motion.div>
      </main>
    </div>
  );
};

export default BookAppointment;
