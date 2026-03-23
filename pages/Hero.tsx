import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Zap, ArrowRight, BookOpen, Dumbbell, Moon } from "lucide-react";
import SakuraBackground from "@/components/SakuraBackground";

/* ─── Shooting Meteor ─── */
const Meteor = ({ delay, style }: { delay: number; style: React.CSSProperties }) => (
  <motion.div
    className="absolute pointer-events-none"
    style={{ ...style }}
    animate={{
      x: [0, 300],
      y: [0, 400],
      opacity: [0, 1, 0.8, 0],
    }}
    transition={{
      duration: 1.5 + Math.random() * 1,
      delay,
      repeat: Infinity,
      repeatDelay: 8 + Math.random() * 12,
      ease: "easeIn",
    }}
  >
    <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
    <div
      className="absolute top-1/2 right-full -translate-y-1/2 h-[1px] rounded-full"
      style={{
        width: 60 + Math.random() * 80,
        background: "linear-gradient(to left, rgba(255,255,255,0.8), transparent)",
      }}
    />
  </motion.div>
);

/* ─── Glowing Star ─── */
const Star = ({ delay, style }: { delay: number; style: React.CSSProperties }) => (
  <motion.div
    className="absolute rounded-full"
    style={{
      width: Math.random() * 2 + 1,
      height: Math.random() * 2 + 1,
      background: "white",
      boxShadow: "0 0 4px rgba(255,255,255,0.8)",
      ...style,
    }}
    animate={{ opacity: [0.3, 1, 0.3] }}
    transition={{ duration: 2 + Math.random() * 2, delay, repeat: Infinity, ease: "easeInOut" }}
  />
);

/* ─── Hero Page ─── */
const Hero = () => {
  return (
    <div className="min-h-screen relative overflow-hidden text-white font-sans select-none">
      {/* ── 3D Animated Background ── */}
      <SakuraBackground />
      <div className="absolute inset-0 z-[6] bg-black/25" />
      <div className="absolute inset-0 z-[6] bg-gradient-to-t from-[#070510] via-transparent to-[#070510]/30" />

      {/* ── Meteors & Stars ── */}
      <div className="absolute inset-0 z-[8] pointer-events-none">
        {Array.from({ length: 6 }).map((_, i) => (
          <Meteor
            key={`m-${i}`}
            delay={i * 4}
            style={{
              left: `${15 + Math.random() * 70}%`,
              top: `${5 + Math.random() * 20}%`,
              transform: "rotate(-35deg)",
            }}
          />
        ))}
        {Array.from({ length: 40 }).map((_, i) => (
          <Star
            key={`s-${i}`}
            delay={Math.random() * 5}
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 50}%` }}
          />
        ))}
      </div>

      {/* ── Top Nav ── */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Zap className="w-7 h-7" />
          <span className="text-2xl font-bold tracking-tight text-white">FocusX</span>
        </div>
        <Link
          to="/auth"
          className="px-6 py-2 rounded-full text-sm font-semibold border border-white/20 hover:bg-white/10 transition-all uppercase tracking-widest text-white/90"
        >
          LOGIN
        </Link>
      </nav>

      {/* ── Main Content ── */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center px-6 min-h-[80vh] max-w-4xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 bg-black/30 backdrop-blur-md text-white/90 text-[10px] font-bold tracking-[0.2em] uppercase mb-8"
        >
          <span>✨ THE ULTIMATE LIFE TRACKER ✨</span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tighter uppercase leading-[0.9] text-white/95"
          style={{ textShadow: "0 0 30px rgba(255,255,255,0.2)" }}
        >
          LEVEL UP<br />YOUR LIFE
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-lg sm:text-xl text-white/80 max-w-2xl leading-relaxed font-medium"
        >
          Turn your daily habits into an RPG. Track sleep, study, gym, and expenses. Gain XP, maintain streaks, and become the main character of your own story.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12"
        >
          <Link to="/auth">
            <button className="flex items-center gap-3 px-10 py-5 rounded-full bg-white text-black font-black text-xl tracking-wider hover:bg-gray-100 transition-all group shadow-[0_0_30px_rgba(255,255,255,0.25)]">
              GET STARTED <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </motion.div>
      </main>

      {/* Bottom gradient  */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#070510] to-transparent z-[1] pointer-events-none" />
    </div>
  );
};

export default Hero;
