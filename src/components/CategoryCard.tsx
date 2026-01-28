import { motion } from "framer-motion";
import { Code, Laptop, Database, Globe, Terminal, Cpu } from "lucide-react";

interface CategoryCardProps {
  name: string;
  icon: string;
  isSelected: boolean;
  onClick: () => void;
}

const iconMap: Record<string, React.ElementType> = {
  java: Coffee,
  python: Terminal,
  frontend: Laptop,
  php: Globe,
  database: Database,
  devops: Cpu,
};

function Coffee(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17 8h1a4 4 0 1 1 0 8h-1"/>
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>
      <line x1="6" x2="6" y1="2" y2="4"/>
      <line x1="10" x2="10" y1="2" y2="4"/>
      <line x1="14" x2="14" y1="2" y2="4"/>
    </svg>
  );
}

export const CategoryCard = ({ name, icon, isSelected, onClick }: CategoryCardProps) => {
  const Icon = iconMap[icon.toLowerCase()] || Code;

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative p-6 rounded-2xl border transition-all duration-300 cursor-pointer
        ${isSelected 
          ? "border-primary bg-primary/10 shadow-[0_0_30px_hsl(var(--primary)/0.3)]" 
          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
        }
      `}
    >
      {isSelected && (
        <motion.div
          layoutId="selected-glow"
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20"
          initial={false}
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      <div className="relative z-10 flex flex-col items-center gap-3">
        <div className={`
          p-4 rounded-xl transition-colors duration-300
          ${isSelected ? "bg-primary/20" : "bg-white/5"}
        `}>
          <Icon className={`w-8 h-8 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
        </div>
        <span className={`font-medium text-lg ${isSelected ? "text-primary" : "text-foreground"}`}>
          {name}
        </span>
      </div>
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
        >
          <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
      )}
    </motion.button>
  );
};
