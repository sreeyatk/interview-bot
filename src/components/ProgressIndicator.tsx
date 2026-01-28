import { motion } from "framer-motion";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  currentQuestion?: number;
  totalQuestions?: number;
}

export const ProgressIndicator = ({ 
  currentStep, 
  totalSteps,
  currentQuestion,
  totalQuestions 
}: ProgressIndicatorProps) => {
  const steps = ["Welcome", "Category", "Interview", "Results"];
  
  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`
                relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
                ${index < currentStep 
                  ? "bg-primary border-primary text-primary-foreground" 
                  : index === currentStep 
                    ? "border-primary text-primary bg-primary/10" 
                    : "border-muted text-muted-foreground"
                }
              `}
            >
              {index < currentStep ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
              {index === currentStep && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-primary"
                  animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.div>
            {index < steps.length - 1 && (
              <div className="w-16 sm:w-24 h-0.5 mx-2 bg-muted overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-accent"
                  initial={{ width: "0%" }}
                  animate={{ width: index < currentStep ? "100%" : "0%" }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        {steps.map((step, index) => (
          <span key={step} className={index === currentStep ? "text-primary font-medium" : ""}>
            {step}
          </span>
        ))}
      </div>
      {currentQuestion !== undefined && totalQuestions !== undefined && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center"
        >
          <span className="text-sm text-muted-foreground">
            Question <span className="text-primary font-semibold">{currentQuestion}</span> of {totalQuestions}
          </span>
          <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent"
              initial={{ width: "0%" }}
              animate={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
};
