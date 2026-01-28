import { motion } from "framer-motion";

interface AudioVisualizerProps {
  isActive: boolean;
  type: "speaking" | "listening";
}

export const AudioVisualizer = ({ isActive, type }: AudioVisualizerProps) => {
  const barCount = 5;
  
  return (
    <div className="flex items-center justify-center gap-1 h-8">
      {Array.from({ length: barCount }).map((_, i) => (
        <motion.div
          key={i}
          className={`w-1 rounded-full ${
            type === "speaking" 
              ? "bg-gradient-to-t from-primary to-accent" 
              : "bg-gradient-to-t from-accent to-primary"
          }`}
          animate={
            isActive
              ? {
                  height: [8, 24, 12, 28, 8],
                }
              : { height: 8 }
          }
          transition={{
            duration: 1.2,
            repeat: isActive ? Infinity : 0,
            delay: i * 0.1,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};
