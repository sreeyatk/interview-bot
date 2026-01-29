import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2, Loader2, ArrowRight, User, Sparkles, Video, VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategoryCard } from "@/components/CategoryCard";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { AudioVisualizer } from "@/components/AudioVisualizer";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { VideoPreview } from "@/components/VideoPreview";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useVideoRecording } from "@/hooks/useVideoRecording";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type InterviewStep = "welcome" | "category" | "interview" | "results";

interface InterviewResponse {
  question: string;
  answer: string;
}

interface AnalysisResult {
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
}

const categories = [
  { name: "Java", icon: "java" },
  { name: "Python", icon: "python" },
  { name: "Frontend", icon: "frontend" },
  { name: "PHP", icon: "php" },
  { name: "Database", icon: "database" },
  { name: "DevOps", icon: "devops" },
];

export const InterviewBot = () => {
  const [step, setStep] = useState<InterviewStep>("welcome");
  const [candidateName, setCandidateName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<InterviewResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const { speak, cancel } = useSpeechSynthesis();
  const { isListening, transcript, startListening, stopListening } = useSpeechRecognition();
  const { 
    isRecording: isVideoRecording, 
    isPreviewing, 
    videoRef, 
    recordingUrl,
    startPreview, 
    stopPreview, 
    startRecording: startVideoRecording, 
    stopRecording: stopVideoRecording,
    resetRecording,
    error: videoError 
  } = useVideoRecording();

  const getStepNumber = () => {
    switch (step) {
      case "welcome": return 0;
      case "category": return 1;
      case "interview": return 2;
      case "results": return 3;
      default: return 0;
    }
  };

  const handleNameSubmit = () => {
    if (candidateName.trim()) {
      setStep("category");
    }
  };

  const handleCategorySelect = async () => {
    if (!selectedCategory) return;

    setIsLoading(true);
    try {
      // Start camera preview and recording
      await startPreview();
      
      const { data, error } = await supabase.functions.invoke("interview-ai", {
        body: {
          action: "generate-questions",
          category: selectedCategory,
        },
      });

      if (error) throw error;

      setQuestions(data.questions);
      setStep("interview");
      
      // Start video recording
      startVideoRecording();
      
      // Start the first question after a brief delay
      setTimeout(() => {
        askQuestion(data.questions[0]);
      }, 1000);
    } catch (error) {
      console.error("Error generating questions:", error);
      toast({
        title: "Error",
        description: "Failed to generate questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const askQuestion = async (question: string) => {
    setIsSpeaking(true);
    try {
      await speak(question);
    } catch (error) {
      console.error("Speech error:", error);
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleStartRecording = async () => {
    try {
      const answer = await startListening();
      if (answer) {
        const newResponse: InterviewResponse = {
          question: questions[currentQuestionIndex],
          answer: answer,
        };
        
        const updatedResponses = [...responses, newResponse];
        setResponses(updatedResponses);

        if (currentQuestionIndex < questions.length - 1) {
          const nextIndex = currentQuestionIndex + 1;
          setCurrentQuestionIndex(nextIndex);
          setTimeout(() => askQuestion(questions[nextIndex]), 1500);
        } else {
          // Interview complete - analyze results
          analyzeInterview(updatedResponses);
        }
      }
    } catch (error) {
      console.error("Recording error:", error);
      toast({
        title: "Microphone Error",
        description: "Please ensure microphone access is allowed.",
        variant: "destructive",
      });
    }
  };

  const analyzeInterview = async (allResponses: InterviewResponse[]) => {
    setIsLoading(true);
    
    // Stop video recording
    const videoBlob = await stopVideoRecording();
    if (videoBlob) {
      console.log("Interview video recorded:", videoBlob.size, "bytes");
    }
    
    try {
      const { data, error } = await supabase.functions.invoke("interview-ai", {
        body: {
          action: "analyze-interview",
          category: selectedCategory,
          candidateName,
          responses: allResponses,
        },
      });

      if (error) throw error;

      setAnalysisResult(data);
      setStep("results");
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze the interview. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestart = () => {
    setCandidateName("");
    setSelectedCategory(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setResponses([]);
    setAnalysisResult(null);
    setStep("welcome");
    cancel();
    stopPreview();
    resetRecording();
  };

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Progress Indicator */}
        {step !== "welcome" && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <ProgressIndicator
              currentStep={getStepNumber()}
              totalSteps={4}
              currentQuestion={step === "interview" ? currentQuestionIndex + 1 : undefined}
              totalQuestions={step === "interview" ? questions.length : undefined}
            />
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* Welcome Step */}
          {step === "welcome" && (
            <motion.div
              key="welcome"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center min-h-[80vh] text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="mb-8 p-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-white/10"
              >
                <Sparkles className="w-16 h-16 text-primary" />
              </motion.div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-4">
                <span className="gradient-text">AI Interview</span> Assistant
              </h1>
              <p className="text-xl text-muted-foreground mb-12 max-w-lg">
                Experience a personalized technical interview powered by AI. 
                Speak naturally and receive instant feedback.
              </p>

              <div className="w-full max-w-md space-y-6">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
                    className="pl-12 h-14 text-lg"
                  />
                </div>
                <Button
                  onClick={handleNameSubmit}
                  disabled={!candidateName.trim()}
                  variant="gradient"
                  size="xl"
                  className="w-full group"
                >
                  Begin Interview
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Category Selection Step */}
          {step === "category" && (
            <motion.div
              key="category"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="max-w-4xl mx-auto"
            >
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4">
                  Welcome, <span className="gradient-text">{candidateName}</span>!
                </h2>
                <p className="text-xl text-muted-foreground">
                  Select your area of expertise to begin the interview
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {categories.map((category) => (
                  <CategoryCard
                    key={category.name}
                    name={category.name}
                    icon={category.icon}
                    isSelected={selectedCategory === category.name}
                    onClick={() => setSelectedCategory(category.name)}
                  />
                ))}
              </div>

              <div className="text-center">
                <Button
                  onClick={handleCategorySelect}
                  disabled={!selectedCategory || isLoading}
                  variant="gradient"
                  size="xl"
                  className="min-w-[200px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Preparing...
                    </>
                  ) : (
                    <>
                      Start Interview
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Interview Step */}
          {step === "interview" && (
            <motion.div
              key="interview"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="max-w-3xl mx-auto"
            >
              {isLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                  <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
                  <p className="text-xl text-muted-foreground">Analyzing your responses...</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Video Preview */}
                  <div className="flex justify-center">
                    <VideoPreview
                      ref={videoRef}
                      isPreviewing={isPreviewing}
                      isRecording={isVideoRecording}
                      error={videoError}
                    />
                  </div>

                  {/* AI Speaking Indicator */}
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 text-center"
                  >
                    <div className="mb-6">
                      {isSpeaking ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/30"
                        >
                          <Volume2 className="w-5 h-5 text-primary" />
                          <span className="text-primary font-medium">AI is speaking...</span>
                        </motion.div>
                      ) : isListening ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-accent/10 border border-accent/30"
                        >
                          <Mic className="w-5 h-5 text-accent" />
                          <span className="text-accent font-medium">Listening to your answer...</span>
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-muted border border-white/10"
                        >
                          <span className="text-muted-foreground">Ready for your response</span>
                        </motion.div>
                      )}
                    </div>

                    <AudioVisualizer isActive={isSpeaking || isListening} type={isSpeaking ? "speaking" : "listening"} />

                    <div className="mt-8 mb-6">
                      <p className="text-sm text-muted-foreground mb-2">Question {currentQuestionIndex + 1}</p>
                      <h3 className="text-2xl font-medium">{questions[currentQuestionIndex]}</h3>
                    </div>

                    {transcript && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-xl bg-secondary/50 border border-white/5 text-left mb-6"
                      >
                        <p className="text-sm text-muted-foreground mb-1">Your answer:</p>
                        <p className="text-foreground/90 italic">"{transcript}"</p>
                      </motion.div>
                    )}

                    <div className="flex justify-center gap-4">
                      {!isSpeaking && (
                        <>
                          {isListening ? (
                            <Button
                              onClick={stopListening}
                              variant="glass"
                              size="xl"
                              className="border-accent/30 hover:bg-accent/20"
                            >
                              <MicOff className="w-6 h-6 mr-2" />
                              Stop Recording
                            </Button>
                          ) : (
                            <Button
                              onClick={handleStartRecording}
                              variant="gradient"
                              size="xl"
                            >
                              <Mic className="w-6 h-6 mr-2" />
                              Start Recording
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>

                  {/* Previous Responses */}
                  {responses.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-muted-foreground">Previous Answers</h4>
                      {responses.map((response, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="p-4 rounded-xl bg-white/5 border border-white/5"
                        >
                          <p className="text-sm text-muted-foreground mb-1">Q{i + 1}: {response.question}</p>
                          <p className="text-foreground/80 italic">"{response.answer}"</p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Results Step */}
          {step === "results" && analysisResult && (
            <motion.div
              key="results"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
            >
              <ResultsDisplay
                candidateName={candidateName}
                category={selectedCategory || ""}
                responses={analysisResult.responses}
                overallScore={analysisResult.overallScore}
                overallFeedback={analysisResult.overallFeedback}
                strengths={analysisResult.strengths}
                improvements={analysisResult.improvements}
                recommendation={analysisResult.recommendation}
                onRestart={handleRestart}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
