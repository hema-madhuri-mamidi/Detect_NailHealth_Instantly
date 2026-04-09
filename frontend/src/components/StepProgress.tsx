import { Check, Upload, Search, UserCheck, Stethoscope, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { label: "Upload", icon: Upload },
  { label: "Analysis", icon: Search },
  { label: "Doctor Review", icon: UserCheck },
  { label: "Consultation", icon: Stethoscope },
  { label: "Payment", icon: CreditCard },
];

interface StepProgressProps {
  currentStep: number;
}

const StepProgress = ({ currentStep }: StepProgressProps) => (
  <div className="flex items-center justify-between w-full max-w-2xl mx-auto py-6">
    {steps.map((step, i) => {
      const done = i < currentStep;
      const active = i === currentStep;
      const Icon = done ? Check : step.icon;
      return (
        <div key={step.label} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1.5">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300",
              done && "bg-primary text-primary-foreground",
              active && "gradient-hero text-primary-foreground shadow-lg",
              !done && !active && "bg-muted text-muted-foreground"
            )}>
              <Icon className="w-4 h-4" />
            </div>
            <span className={cn(
              "text-xs font-medium hidden sm:block",
              (done || active) ? "text-primary" : "text-muted-foreground"
            )}>{step.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={cn(
              "flex-1 h-0.5 mx-2 rounded transition-all duration-300",
              i < currentStep ? "bg-primary" : "bg-muted"
            )} />
          )}
        </div>
      );
    })}
  </div>
);

export default StepProgress;
