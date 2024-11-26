import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, AlertCircle } from "lucide-react";

interface ProgressIndicatorProps {
  steps: {
    id: string;
    label: string;
    icon: React.ReactNode;
    isComplete: boolean;
    hasError?: boolean;
  }[];
  currentStep: string;
}

export function ProgressIndicator({ steps, currentStep }: ProgressIndicatorProps) {
  return (
    <div className="relative">
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="relative flex flex-col items-center">
            <motion.div
              initial={false}
              animate={{
                backgroundColor: step.isComplete 
                  ? "var(--primary)" 
                  : step.hasError 
                  ? "var(--destructive)" 
                  : "var(--muted)",
                scale: currentStep === step.id ? 1.1 : 1,
              }}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                "transition-colors duration-200"
              )}
            >
              {step.isComplete ? (
                <Check className="w-5 h-5 text-primary-foreground" />
              ) : step.hasError ? (
                <AlertCircle className="w-5 h-5 text-destructive-foreground" />
              ) : (
                step.icon
              )}
            </motion.div>
            <span className="mt-2 text-sm font-medium">
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div 
                className={cn(
                  "absolute top-5 left-full w-full h-[2px] -translate-y-1/2",
                  step.isComplete ? "bg-primary" : "bg-muted"
                )}
                style={{ width: "calc(100% - 2.5rem)" }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 