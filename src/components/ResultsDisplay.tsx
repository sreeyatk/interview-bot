import { motion } from "framer-motion";
import { Star, TrendingUp, Award, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResultsDisplayProps {
  candidateName: string;
  category: string;
  responses: Array<{
    question: string;
    answer: string;
    score: number;
    feedback: string;
  }>;
  overallScore: number;
  overallFeedback: string;
  strengths: string[];
  improvements: string[];
  recommendation: "hire" | "consider" | "decline";
  onRestart: () => void;
}

export const ResultsDisplay = ({
  candidateName,
  category,
  responses,
  overallScore,
  overallFeedback,
  strengths,
  improvements,
  recommendation,
  onRestart,
}: ResultsDisplayProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getRecommendationConfig = () => {
    switch (recommendation) {
      case "hire":
        return {
          icon: CheckCircle,
          text: "Recommended for Hire",
          color: "text-green-400",
          bg: "bg-green-400/10 border-green-400/30",
        };
      case "consider":
        return {
          icon: AlertCircle,
          text: "Consider for Further Evaluation",
          color: "text-yellow-400",
          bg: "bg-yellow-400/10 border-yellow-400/30",
        };
      case "decline":
        return {
          icon: XCircle,
          text: "Not Recommended at This Time",
          color: "text-red-400",
          bg: "bg-red-400/10 border-red-400/30",
        };
    }
  };

  const recConfig = getRecommendationConfig();
  const RecIcon = recConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-4xl mx-auto space-y-8"
    >
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30"
        >
          <Award className="w-5 h-5 text-primary" />
          <span className="text-primary font-medium">Interview Complete</span>
        </motion.div>
        <h2 className="text-3xl font-bold">
          Results for <span className="gradient-text">{candidateName}</span>
        </h2>
        <p className="text-muted-foreground">{category} Assessment</p>
      </div>

      {/* Score Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10"
      >
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <svg className="w-40 h-40 transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted"
              />
              <motion.circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="url(#scoreGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={440}
                initial={{ strokeDashoffset: 440 }}
                animate={{ strokeDashoffset: 440 - (overallScore / 100) * 440 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(187, 85%, 53%)" />
                  <stop offset="100%" stopColor="hsl(280, 85%, 65%)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center"
              >
                <span className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
                  {overallScore}
                </span>
                <span className="text-muted-foreground text-lg">/100</span>
              </motion.div>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${recConfig.bg}`}>
              <RecIcon className={`w-5 h-5 ${recConfig.color}`} />
              <span className={`font-medium ${recConfig.color}`}>{recConfig.text}</span>
            </div>
            <p className="text-foreground/80">{overallFeedback}</p>
          </div>
        </div>
      </motion.div>

      {/* Strengths & Improvements */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl bg-green-400/5 border border-green-400/20"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-green-400">Strengths</h3>
          </div>
          <ul className="space-y-2">
            {strengths.map((strength, i) => (
              <motion.li
                key={i}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-start gap-2 text-foreground/80"
              >
                <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                <span>{strength}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl bg-yellow-400/5 border border-yellow-400/20"
        >
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-yellow-400">Areas for Improvement</h3>
          </div>
          <ul className="space-y-2">
            {improvements.map((improvement, i) => (
              <motion.li
                key={i}
                initial={{ x: 10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-start gap-2 text-foreground/80"
              >
                <AlertCircle className="w-4 h-4 text-yellow-400 mt-1 flex-shrink-0" />
                <span>{improvement}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Individual Responses */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="space-y-4"
      >
        <h3 className="text-xl font-semibold">Question-by-Question Analysis</h3>
        {responses.map((response, i) => (
          <motion.div
            key={i}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 + i * 0.1 }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Question {i + 1}</p>
                <p className="font-medium">{response.question}</p>
              </div>
              <div className={`px-3 py-1 rounded-full bg-white/5 font-semibold ${getScoreColor(response.score)}`}>
                {response.score}/100
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Your Answer</p>
                <p className="text-foreground/80 italic">"{response.answer}"</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Feedback</p>
                <p className="text-foreground/80">{response.feedback}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Restart Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center pt-4"
      >
        <Button onClick={onRestart} variant="gradient" size="lg">
          Start New Interview
        </Button>
      </motion.div>
    </motion.div>
  );
};
