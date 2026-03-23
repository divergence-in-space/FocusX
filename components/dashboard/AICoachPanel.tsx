import { motion } from "framer-motion";
import { Sparkles, Bot } from "lucide-react";
import { useState, useEffect } from "react";

export function AICoachPanel({ score }: { score: number }) {
  const [dialogue, setDialogue] = useState("I'm analyzing your progress...");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    setIsTyping(true);
    const timeout = setTimeout(() => {
      if (score >= 80) setDialogue("You're doing amazing today! Keep up this incredible energy! ✨");
      else if (score >= 50) setDialogue("Steady progress! Need a quick break before the next quest? 🌸");
      else setDialogue("Don't worry about the score. Every step forward is a victory! 💪");
      setIsTyping(false);
    }, 2000);
    return () => clearTimeout(timeout);
  }, [score]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="card-elevated p-0 relative overflow-hidden group/coach flex items-center min-h-[160px] border-glow-purple"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-purple-500/10 pointer-events-none" />
      
      {/* Waifu Avatar Placeholder / Glowing orb */}
      <div className="w-[35%] h-full relative flex items-center justify-center border-r border-white/5 bg-black/40 overflow-hidden">
        {/* Soft anime girl placeholder image using mix-blend-mode */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=300')] bg-cover bg-center opacity-30 mix-blend-screen group-hover/coach:opacity-50 transition-opacity duration-700 group-hover/coach:scale-105" />
        
        <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-br from-pink-400/20 to-purple-500/20 border-2 border-pink-400/50 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(236,72,153,0.3)] group-hover/coach:shadow-[0_0_30px_rgba(236,72,153,0.6)] transition-all duration-700 backdrop-blur-md">
           <Bot className="w-8 h-8 text-pink-300 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
           {/* Blinking/Idle animation dot */}
           <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-pink-400 rounded-full animate-pulse shadow-[0_0_5px_rgba(236,72,153,0.8)]" />
        </div>
      </div>

      {/* Dialogue Box */}
      <div className="w-[65%] p-4 sm:p-6 relative">
        <h3 className="text-[10px] sm:text-xs font-black tracking-widest uppercase text-pink-400 mb-3 flex items-center gap-2 drop-shadow-[0_0_5px_rgba(236,72,153,0.5)]">
          <Sparkles className="w-4 h-4 animate-pulse" />
          AI Guide
        </h3>
        
        <div className="bg-black/60 border border-pink-500/30 rounded-xl p-3 sm:p-4 relative shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
           <div className="absolute -left-2 top-5 w-4 h-4 bg-black border-t border-l border-pink-500/30 transform -rotate-45" />
           <p className="text-xs sm:text-sm text-white/90 font-medium italic relative z-10 leading-relaxed min-h-[40px] flex items-center">
             {isTyping ? (
               <span className="flex items-center gap-1.5 ml-2">
                 <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce shadow-[0_0_5px_rgba(236,72,153,0.8)]" style={{ animationDelay: '0ms' }} />
                 <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce shadow-[0_0_5px_rgba(236,72,153,0.8)]" style={{ animationDelay: '150ms' }} />
                 <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce shadow-[0_0_5px_rgba(236,72,153,0.8)]" style={{ animationDelay: '300ms' }} />
               </span>
             ) : (
               <span>"{dialogue}"</span>
             )}
           </p>
        </div>
      </div>
    </motion.div>
  );
}
