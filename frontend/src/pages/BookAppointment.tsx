import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppHeader from "@/components/AppHeader";
import StepProgress from "@/components/StepProgress";
import { Label } from "@/components/ui/label";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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

  // Convert string state to Date object for react-datepicker
  const parsedDate = date ? new Date(date) : null;

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Dynamic ambient background glow */}
      <div className="fixed top-[20%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[150px] pointer-events-none" />

      <AppHeader />
      <main className="container py-12 max-w-lg relative z-10">
        <StepProgress currentStep={3} />
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-10">
          <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight text-center">Book Appointment</h1>
          <p className="text-white/60 mb-8 text-center text-lg">Pick a suitable date and time below.</p>
          
          <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 mb-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center text-white font-bold text-2xl shrink-0 shadow-[0_0_15px_rgba(126,34,206,0.2)]">
                {doctor.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <p className="font-bold text-xl text-white">Dr. {doctor.name}</p>
                <p className="text-sm font-medium text-accent">{doctor.specialization}</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-white/80 ml-1 text-sm font-semibold">
                  <Calendar className="w-4 h-4 text-primary" /> Select Date
                </Label>
                <div className="relative group w-full">
                  <DatePicker
                    selected={parsedDate}
                    onChange={(d: Date | null) => setDate(d ? new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split("T")[0] : "")}
                    minDate={new Date()}
                    dateFormat="MMMM d, yyyy"
                    placeholderText="Choose an appointment date"
                    className="w-full h-14 bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:bg-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-2xl px-5 transition-all duration-300 text-base font-medium outline-none"
                    wrapperClassName="w-full block"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-white/80 ml-1 text-sm font-semibold">
                  <Clock className="w-4 h-4 text-accent" /> Select Time
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  {timeSlots.map(t => (
                    <Button key={t} variant="ghost"
                      className={`h-12 rounded-xl text-sm font-bold transition-all duration-300 ${time === t ? "bg-gradient-to-r from-primary to-accent text-white border-0 shadow-[0_0_15px_rgba(126,34,206,0.5)]" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/5"}`} 
                      onClick={() => setTime(t)}>
                      {t}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {date && time && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-success/10 border border-success/20 backdrop-blur-md rounded-2xl p-4 mb-8 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
              <span className="text-white/90 text-sm font-medium">
                Dr. {doctor.name} • {new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric'})} at {time}
              </span>
            </motion.div>
          )}

          <Button onClick={confirm} disabled={!date || !time} className="w-full h-14 text-base font-bold rounded-2xl text-white bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 border-0 shadow-[0_4px_20px_rgba(126,34,206,0.3)] hover:shadow-[0_8px_30px_rgba(126,34,206,0.5)] transition-all duration-300 transform hover:-translate-y-1 block disabled:opacity-50 disabled:pointer-events-none disabled:transform-none">
            Proceed to Payment
          </Button>
        </motion.div>
      </main>
      
      {/* Global override for react-datepicker popup to match dark theme */}
      <style>{`
        .react-datepicker-wrapper { width: 100%; display: block; }
        .react-datepicker { background-color: rgba(10, 5, 20, 0.95); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); border-radius: 1.5rem; font-family: inherit; color: white; box-shadow: 0 10px 40px rgba(0,0,0,0.5); padding: 0.5rem; }
        .react-datepicker__header { background-color: transparent; border-bottom: 1px solid rgba(255,255,255,0.1); padding-top: 1rem; }
        .react-datepicker__current-month, .react-datepicker-time__header, .react-datepicker-year-header { color: white; font-weight: 700; margin-bottom: 0.5rem; font-size: 1.1rem; }
        .react-datepicker__day-name { color: rgba(255,255,255,0.5); font-weight: 600; width: 2.2rem; margin: 0.2rem; }
        .react-datepicker__day { color: white; width: 2.2rem; height: 2.2rem; line-height: 2.2rem; margin: 0.2rem; transition: all 0.2s; font-weight: 500; }
        .react-datepicker__day:hover { background-color: rgba(255,255,255,0.1); border-radius: 0.75rem; }
        .react-datepicker__day--selected, .react-datepicker__day--keyboard-selected { background-image: linear-gradient(to right, #7e22ce, #db2777); border-radius: 0.75rem; color: white !important; font-weight: bold; box-shadow: 0 0 15px rgba(126,34,206,0.5); }
        .react-datepicker__day--disabled { color: rgba(255,255,255,0.2); pointer-events: none; }
        .react-datepicker-popper[data-placement^="bottom"] .react-datepicker__triangle::before, .react-datepicker-popper[data-placement^="bottom"] .react-datepicker__triangle::after { border-bottom-color: rgba(10, 5, 20, 0.95); }
      `}</style>
    </div>
  );
};

export default BookAppointment;
