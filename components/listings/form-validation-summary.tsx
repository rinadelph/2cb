import { AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import { listingSchema } from "@/lib/schemas/listing-schema";

interface ValidationSummaryProps {
  errors: Record<string, string[]>;
}

export function FormValidationSummary({ errors }: ValidationSummaryProps) {
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <AnimatePresence>
      {hasErrors && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6"
        >
          <Alert variant="destructive" className="animate-shake">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Please fix the following errors</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-4 mt-2 space-y-1">
                {Object.entries(errors).map(([field, messages]) => (
                  <li key={field} className="text-sm">
                    <span className="font-medium capitalize">
                      {field.replace(/_/g, ' ')}:
                    </span>{" "}
                    {messages.join(", ")}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 