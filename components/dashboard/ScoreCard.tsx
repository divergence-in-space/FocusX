import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

interface ScoreCardProps {
  score: number;
  mood: string;
  moodEmoji: string;
  breakdown: { label: string; value: number; color: string }[];
}

export function ScoreCard({ score, mood, moodEmoji, breakdown }: ScoreCardProps) {
  const getScoreColor = (s: number) => {
    if (s >= 80) return "text-score-excellent";
    if (s >= 60) return "text-score-good";
    if (s >= 40) return "text-score-average";
    return "text-score-poor";
  };

  return (
    <div className="relative group/score">
      {/* Pulsing glow aura behind the card */}
      <div className="absolute -inset-[3px] rounded-[22px] pointer-events-none z-0 score-card-glow" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card-elevated p-6 score-glow relative overflow-hidden rounded-2xl"
        style={{ isolation: "isolate" }}
      >
        {/* Background glow effects for the card */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00eaff]/5 via-transparent to-[#b478ff]/5 pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#00eaff]/20 blur-[50px] rounded-full pointer-events-none transition-opacity duration-700 group-hover/score:opacity-70" />

        {/* Solo Leveling character image — slow zoom-out */}
        <div className="absolute right-6 top-4 bottom-4 w-[45%] pointer-events-none z-[1] overflow-hidden rounded-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-[rgba(10,10,26,1)] via-[rgba(10,10,26,0.2)] to-transparent z-[2]" />
          <img
            src="/solo.webp"
            alt="FocusX Character"
            className="h-full w-full object-contain object-right solo-zoom-out"
          />
        </div>

        <div className="flex items-start justify-between relative z-10">
          <div>
            <p className="text-xs text-white/70 font-bold uppercase tracking-[0.2em] drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">Power Level</p>
            
            <div className="relative w-36 h-36 flex items-center justify-center mt-4 mb-3 group/ring">
              <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-transform duration-700 group-hover/ring:scale-105" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                <circle 
                  cx="50" cy="50" r="44" 
                  fill="transparent" 
                  stroke="url(#scoreGrad)" 
                  strokeWidth="6"
                  strokeDasharray="276.46"
                  strokeDashoffset={276.46 - (276.46 * score) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1500 ease-out"
                />
                <defs>
                  <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00eaff" />
                    <stop offset="50%" stopColor="#b478ff" />
                    <stop offset="100%" stopColor="#f472b6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="flex flex-col items-center justify-center text-center relative z-10 transform transition-transform duration-500 group-hover/ring:scale-110">
                <span className="font-mono text-5xl font-black text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.6)]">
                  {score}
                </span>
                <span className="text-[9px] text-white/50 uppercase tracking-[0.2em] font-bold mt-1">Max 100</span>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full w-fit backdrop-blur-sm transition-colors hover:bg-white/10">
              <span className="text-xl drop-shadow-md">{moodEmoji}</span>
              <span className="text-xs font-bold text-white/90 uppercase tracking-widest">{mood}</span>
            </div>
          </div>

          <div className="text-right flex flex-col items-end">
            <div className="flex items-center gap-1.5 text-cyan-400 bg-cyan-400/10 px-2.5 py-1 rounded-full border border-cyan-400/20 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
              <TrendingUp className="h-4 w-4 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]" />
              <span className="text-sm font-black font-mono drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">+5 XP</span>
            </div>
            <p className="text-[10px] text-white/40 mt-2 uppercase tracking-widest font-bold">vs yesterday</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 relative z-10">
          {breakdown.map((item) => (
            <div key={item.label} className="bg-black/40 border border-white/10 rounded-xl p-3 hover:bg-white/5 transition-colors group/breakdown">
              <p className="text-[10px] uppercase tracking-widest text-white/60 font-bold mb-1.5 group-hover/breakdown:text-white transition-colors">{item.label}</p>
              <div className="flex items-center gap-1.5">
                {item.value >= 0 ? (
                  <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-pink-500" />
                )}
                <span className={`text-sm font-mono font-black drop-shadow-[0_0_5px_currentColor] ${item.value >= 0 ? "text-cyan-400" : "text-pink-500"}`}>
                  {item.value > 0 ? "+" : ""}{item.value} XP
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
