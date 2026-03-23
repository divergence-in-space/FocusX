import { motion } from "framer-motion";
import { useMemo } from "react";

/* ═══════════════════════════════════════════════════════
   Sakura Background — 3D Parallax + Petals + Ambiance
   ═══════════════════════════════════════════════════════ */

/* ─── Petal shape helpers ─── */
interface PetalConfig {
  id: number;
  size: number;
  left: string;
  delay: string;
  duration: string;
  color: string;
  rotation: number;
  swayAmount: number;
  opacity: number;
  blur: number;
  zIndex: number;
}

const PETAL_COLORS = [
  "rgba(255, 183, 197, 0.9)",  // soft pink
  "rgba(255, 200, 210, 0.85)", // light pink
  "rgba(255, 160, 180, 0.9)",  // medium pink
  "rgba(255, 220, 230, 0.8)",  // pale pink
  "rgba(248, 170, 195, 0.85)", // rose pink
  "rgba(255, 192, 203, 0.9)",  // classic pink
];

function makePetals(count: number, depthLayer: "far" | "mid" | "near"): PetalConfig[] {
  const config = {
    far:  { sizeRange: [5, 9],   durRange: [18, 28], blur: 1.5, opacity: 0.45, z: 1 },
    mid:  { sizeRange: [8, 14],  durRange: [12, 20], blur: 0,   opacity: 0.7,  z: 2 },
    near: { sizeRange: [12, 20], durRange: [8, 14],  blur: 0,   opacity: 0.9,  z: 3 },
  }[depthLayer];

  return Array.from({ length: count }, (_, i) => {
    const size = config.sizeRange[0] + Math.random() * (config.sizeRange[1] - config.sizeRange[0]);
    const dur  = config.durRange[0]  + Math.random() * (config.durRange[1]  - config.durRange[0]);
    return {
      id: i,
      size,
      left: `${-5 + Math.random() * 110}%`,
      delay: `${-Math.random() * dur}s`,
      duration: `${dur}s`,
      color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
      rotation: Math.random() * 360,
      swayAmount: 30 + Math.random() * 80,
      opacity: config.opacity,
      blur: config.blur,
      zIndex: config.z,
    };
  });
}

/* ─── Single Petal ─── */
const SakuraPetal = ({ p }: { p: PetalConfig }) => (
  <div
    className="sakura-petal absolute pointer-events-none"
    style={{
      left: p.left,
      top: "-24px",
      width: p.size,
      height: p.size * 0.7,
      background: p.color,
      borderRadius: "50% 0 50% 50%",
      opacity: p.opacity,
      filter: p.blur > 0 ? `blur(${p.blur}px)` : undefined,
      zIndex: p.zIndex,
      animationDuration: p.duration,
      animationDelay: p.delay,
      transform: `rotate(${p.rotation}deg)`,
      ["--sway" as string]: `${p.swayAmount}px`,
    }}
  />
);

/* ─── Wind Particle ─── */
interface WindConfig {
  id: number;
  size: number;
  top: string;
  left: string;
  delay: string;
  duration: string;
  opacity: number;
}

function makeWind(count: number): WindConfig[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    size: 2 + Math.random() * 3,
    top: `${10 + Math.random() * 80}%`,
    left: `${-10 + Math.random() * 30}%`,
    delay: `${-Math.random() * 12}s`,
    duration: `${6 + Math.random() * 8}s`,
    opacity: 0.15 + Math.random() * 0.25,
  }));
}

const WindParticle = ({ w }: { w: WindConfig }) => (
  <div
    className="wind-particle absolute pointer-events-none rounded-full"
    style={{
      width: w.size,
      height: w.size,
      top: w.top,
      left: w.left,
      background: "rgba(255, 255, 255, 0.6)",
      opacity: w.opacity,
      animationDuration: w.duration,
      animationDelay: w.delay,
      filter: "blur(0.5px)",
    }}
  />
);

/* ─── Ambient Glow Orb ─── */
const glowOrbs = [
  { x: "20%", y: "30%", color: "rgba(255, 150, 180, 0.12)", size: 350 },
  { x: "75%", y: "55%", color: "rgba(180, 120, 255, 0.10)", size: 300 },
  { x: "50%", y: "15%", color: "rgba(100, 200, 255, 0.08)", size: 400 },
  { x: "10%", y: "70%", color: "rgba(255, 180, 200, 0.09)", size: 250 },
  { x: "85%", y: "20%", color: "rgba(200, 150, 255, 0.07)", size: 280 },
];

/* ═══════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════ */
interface SakuraBackgroundProps {
  variant?: 'full' | 'petals-only';
}

const SakuraBackground = ({ variant = 'full' }: SakuraBackgroundProps = {}) => {
  /* Memoize random configs so they don't regenerate on re-render */
  const farPetals  = useMemo(() => makePetals(15, "far"),  []);
  const midPetals  = useMemo(() => makePetals(20, "mid"),  []);
  const nearPetals = useMemo(() => makePetals(10, "near"), []);
  const windParts  = useMemo(() => makeWind(14),           []);

  const isFull = variant === 'full';

  return (
    <>
      {/* ── Layer 1: Parallax Camera Background ── */}
      {isFull && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div
            className="hero-camera absolute inset-[-8%] bg-cover bg-center bg-no-repeat will-change-transform"
            style={{ backgroundImage: `url('/hero-bg.png')` }}
          />
        </div>
      )}

      {/* ── Layer 2: Depth Blur Planes ── */}
      {isFull && (
        <div className="absolute inset-0 z-[1] pointer-events-none">
          {/* Far depth — heavy blur at edges */}
          <div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse 60% 50% at 50% 50%, transparent 0%, rgba(7, 5, 16, 0.3) 100%)",
            }}
          />
          {/* Vignette-style depth */}
          <div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse 80% 70% at 50% 55%, transparent 30%, rgba(7, 5, 16, 0.5) 100%)",
              backdropFilter: "blur(0.5px)",
            }}
          />
        </div>
      )}

      {/* ── Layer 3: Ambient Glow Orbs ── */}
      {isFull && (
        <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
          {glowOrbs.map((orb, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full will-change-transform"
              style={{
                width: orb.size,
                height: orb.size,
                left: orb.x,
                top: orb.y,
                background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
                transform: "translate(-50%, -50%)",
              }}
              animate={{
                x: [0, 15 + i * 5, -10 - i * 3, 0],
                y: [0, -10 - i * 4, 12 + i * 3, 0],
                scale: [1, 1.1, 0.95, 1],
                opacity: [1, 1.3, 0.8, 1],
              }}
              transition={{
                duration: 12 + i * 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}

      {/* ── Layer 4: Sakura Petals — Far ── */}
      <div className="absolute inset-0 z-[3] pointer-events-none overflow-hidden">
        {farPetals.map(p => <SakuraPetal key={`far-${p.id}`} p={p} />)}
      </div>

      {/* ── Layer 5: Sakura Petals — Mid ── */}
      <div className="absolute inset-0 z-[4] pointer-events-none overflow-hidden">
        {midPetals.map(p => <SakuraPetal key={`mid-${p.id}`} p={p} />)}
      </div>

      {/* ── Layer 6: Sakura Petals — Near (above overlay for depth) ── */}
      <div className="absolute inset-0 z-[7] pointer-events-none overflow-hidden">
        {nearPetals.map(p => <SakuraPetal key={`near-${p.id}`} p={p} />)}
      </div>

      {/* ── Layer 7: Wind Particles ── */}
      <div className="absolute inset-0 z-[7] pointer-events-none overflow-hidden">
        {windParts.map(w => <WindParticle key={`wind-${w.id}`} w={w} />)}
      </div>
    </>
  );
};

export default SakuraBackground;
