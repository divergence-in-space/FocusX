import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Square, X, BrainCircuit, Coffee, SkipForward } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import SakuraBackground from "./SakuraBackground";

interface StudyTimerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type TimerMode = "setup" | "study" | "break" | "summary";

const MOTIVATIONS = [
  "Stay focused! You got this. 🌟",
  "One step at a time! ⚔️",
  "Level up your mind! 🧠",
  "Consistency is key! 🔥",
  "Keep pushing forward! ✨",
];

export function StudyTimer({ open, onOpenChange }: StudyTimerProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Settings
  const [studyMinutes, setStudyMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [subject, setSubject] = useState("Guided Session");

  // Timer State
  const [mode, setMode] = useState<TimerMode>("setup");
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [isActive, setIsActive] = useState(false);
  const [totalStudySeconds, setTotalStudySeconds] = useState(0); // Accumulated real study time
  const [motivationId, setMotivationId] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Time format
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeString = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  const totalMins = mode === "study" ? studyMinutes : breakMinutes;
  const progress = totalMins > 0 ? ((totalMins * 60 - timeLeft) / (totalMins * 60)) * 100 : 0;

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
        if (mode === "study") {
          setTotalStudySeconds((total) => total + 1);
        }
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Phase completed
      handlePhaseComplete();
    }

    // Change motivation text every 15 mins during study
    if (mode === "study" && timeLeft % 900 === 0 && timeLeft !== studyMinutes * 60) {
      setMotivationId((prev) => (prev + 1) % MOTIVATIONS.length);
    }

    if (isActive && mode === "study" && audioRef.current) {
      audioRef.current.play().catch(() => console.log("Audio autoplay blocked"));
    } else if (audioRef.current) {
      audioRef.current.pause();
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const handlePhaseComplete = () => {
    toast.success(mode === "study" ? "Study session complete! Time for a break." : "Break is over! Let's focus.");
    if (mode === "study") {
      setMode("break");
      setTimeLeft(breakMinutes * 60);
    } else {
      setMode("study");
      setTimeLeft(studyMinutes * 60);
    }
  };

  const startTimer = () => {
    if (mode === "setup") {
      setMode("study");
      setTimeLeft(studyMinutes * 60);
      setTotalStudySeconds(0);
      setMotivationId(Math.floor(Math.random() * MOTIVATIONS.length));
    }
    setIsActive(true);
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const skipPhase = () => {
    setIsActive(false);
    handlePhaseComplete();
  };

  const stopTimerAndSave = async () => {
    setIsActive(false);
    
    // If we studied for less than a minute, don't save
    if (totalStudySeconds < 60) {
      toast("Session too short to save.");
      resetAll();
      return;
    }

    if (!user) {
      toast.error("Please sign in to save your session.");
      resetAll();
      return;
    }

    setMode("summary");

    // Calculate times
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - totalStudySeconds * 1000);
    
    const startTimeStr = startDate.toTimeString().slice(0, 5); // HH:MM
    const endTimeStr = endDate.toTimeString().slice(0, 5);

    try {
      const { error } = await supabase.from("study_sessions").insert({
        user_id: user.id,
        subject: subject || "Guided Pomodoro",
        start_time: startTimeStr,
        end_time: endTimeStr,
        focus_score: 9, // Auto high focus for pomodoro
        notes: `Pomodoro session (${Math.round(totalStudySeconds / 60)} mins)`,
      });

      if (error) throw error;
      
      toast.success("Study session saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["study_sessions"] });
    } catch (e: any) {
      toast.error("Error saving session: " + e.message);
    }
  };

  const resetAll = () => {
    setIsActive(false);
    setMode("setup");
    setTotalStudySeconds(0);
    setTimeLeft(0);
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-background/95 backdrop-blur-2xl"
        >
          {/* Audio Element for Lofi BGM */}
          <audio 
            ref={audioRef} 
            src="https://assets.mixkit.co/music/preview/mixkit-sleepy-cat-135.mp3" 
            loop 
            preload="auto"
          />

          {/* Background Particles / Leaves */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden mix-blend-screen">
            {mode === "study" ? (
              // Refactored elegant Sakura Leaves
              <div className="opacity-90">
                <SakuraBackground variant="petals-only" />
              </div>
            ) : (
              // Glowing Orbs
              <div className="opacity-40">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div
                    key={`p-${i}`}
                    className="auth-float-particle absolute rounded-full"
                    style={{
                      width: 2 + Math.random() * 4,
                      height: 2 + Math.random() * 4,
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      background: `rgba(${100 + Math.random() * 100}, 200, 255, 0.8)`,
                      animationDuration: `${8 + Math.random() * 12}s`,
                      animationDelay: `${-Math.random() * 10}s`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={resetAll}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative z-10 w-full max-w-md p-8 flex flex-col items-center">
            
            {/* Setup Mode */}
            {mode === "setup" && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }}
                className="w-full space-y-8"
              >
                <div className="text-center space-y-2">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400 mb-4 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
                    <BrainCircuit className="h-6 w-6" />
                  </div>
                  <h2 className="text-3xl font-black text-white tracking-tight">Focus Protocol</h2>
                  <p className="text-sm text-white/50 uppercase tracking-widest font-bold">Configure Sequence</p>
                </div>

                <div className="space-y-6 bg-black/40 p-6 rounded-3xl border border-white/5">
                  <div className="space-y-3">
                    <label className="text-xs uppercase tracking-widest text-white/40 font-bold ml-1">Directive (Subject)</label>
                    <input 
                      type="text" 
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400/50 transition-colors"
                      placeholder="e.g. Mathematics"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className="text-xs uppercase tracking-widest text-white/40 font-bold ml-1">Focus (min)</label>
                      <input 
                        type="number" 
                        value={studyMinutes}
                        onChange={(e) => setStudyMinutes(Number(e.target.value))}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400/50 transition-colors text-center font-mono text-xl"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs uppercase tracking-widest text-white/40 font-bold ml-1">Break (min)</label>
                      <input 
                        type="number" 
                        value={breakMinutes}
                        onChange={(e) => setBreakMinutes(Number(e.target.value))}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400/50 transition-colors text-center font-mono text-xl"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={startTimer}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_40px_rgba(34,211,238,0.6)] transition-all hover:-translate-y-1"
                >
                  Initiate Sequence
                </button>
              </motion.div>
            )}

            {/* Active Timer Mode (Study / Break) */}
            {(mode === "study" || mode === "break") && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }}
                className="w-full flex flex-col items-center"
              >
                <div className="text-center mb-10">
                  <h3 className={`text-sm uppercase tracking-[0.3em] font-black ${mode === "study" ? "text-cyan-400" : "text-green-400"}`}>
                    {mode === "study" ? "Deep Focus Segment" : "Rest Segment"}
                  </h3>
                  <p className="text-white/40 mt-2 text-xs">{subject}</p>
                </div>

                {/* Circular Timer Display */}
                <div className="relative w-72 h-72 flex items-center justify-center mb-12">
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle 
                      cx="50" cy="50" r="46" 
                      fill="transparent" 
                      stroke="rgba(255,255,255,0.05)" 
                      strokeWidth="2" 
                    />
                    <circle 
                      cx="50" cy="50" r="46" 
                      fill="transparent" 
                      stroke={mode === "study" ? "url(#cyanGrad)" : "url(#greenGrad)"}
                      strokeWidth="4"
                      strokeDasharray="289.02" /* 2 * PI * 46 */
                      strokeDashoffset={289.02 - (289.02 * progress) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-linear"
                      style={{ filter: "drop-shadow(0 0 8px rgba(34,211,238,0.5))" }}
                    />
                    <defs>
                      <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                      <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#4ade80" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  <div className="text-center">
                    <div className="text-6xl font-black text-white font-mono tracking-tighter" style={{ textShadow: "0 0 20px rgba(255,255,255,0.3)" }}>
                      {timeString}
                    </div>
                  </div>
                </div>

                {/* Motivational Text */}
                <div className="h-8 mb-8">
                  <AnimatePresence mode="wait">
                    {mode === "study" && (
                      <motion.p 
                        key={motivationId}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-white/60 text-sm font-medium italic"
                      >
                        {MOTIVATIONS[motivationId]}
                      </motion.p>
                    )}
                    {mode === "break" && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-white/60 text-sm font-medium"
                      >
                        Relax and stretch. Get some water. ☕
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-6">
                  <button 
                    onClick={isActive ? pauseTimer : startTimer}
                    className="w-16 h-16 rounded-full flex items-center justify-center bg-white border-2 border-white text-black hover:bg-transparent hover:text-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                  >
                    {isActive ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                  </button>

                  <button 
                    onClick={skipPhase}
                    className="w-12 h-12 rounded-full flex items-center justify-center bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-all"
                    title="Skip to next phase"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>

                  <button 
                    onClick={stopTimerAndSave}
                    className="w-12 h-12 rounded-full flex items-center justify-center bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-[0_0_15px_rgba(239,68,68,0)] hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                    title="Finish and save"
                  >
                    <Square className="w-4 h-4 fill-current" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Summary Mode */}
            {mode === "summary" && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }}
                className="w-full text-center space-y-8"
              >
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20 text-green-400 mb-2 shadow-[0_0_40px_rgba(74,222,128,0.3)] border border-green-400/30">
                  <Coffee className="h-10 w-10" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tight mb-2">Session Logged!</h2>
                  <p className="text-lg text-white/60">
                    You focused for <span className="text-green-400 font-bold">{Math.round(totalStudySeconds / 60)}</span> minutes.
                  </p>
                </div>
                <button 
                  onClick={resetAll}
                  className="w-full py-4 rounded-2xl bg-white/10 text-white font-black uppercase tracking-[0.2em] hover:bg-white/20 transition-all"
                >
                  Return to Dashboard
                </button>
              </motion.div>
            )}

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
