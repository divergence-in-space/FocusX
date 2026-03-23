import { useEffect, useRef, useMemo, useCallback } from "react";
import { motion } from "framer-motion";

/* ═══════════════════════════════════════════════════════
   Auth Background — 3D Parallax + Mouse Tracking + 
   Shooting Stars + Twinkling + Ambient Glow
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

/* ─── Twinkling Star configs ─── */
interface StarConfig {
  id: number;
  x: string;
  y: string;
  size: number;
  delay: number;
  duration: number;
}

function makeTwinklingStars(count: number): StarConfig[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: `${Math.random() * 100}%`,
    y: `${Math.random() * 55}%`,
    size: 1 + Math.random() * 2.5,
    delay: Math.random() * 6,
    duration: 2 + Math.random() * 3,
  }));
}

/* ─── Ambient glow orbs for login ─── */
const glowOrbs = [
  { x: "25%", y: "35%", color: "rgba(100, 180, 255, 0.08)", size: 380 },
  { x: "70%", y: "50%", color: "rgba(180, 120, 255, 0.07)", size: 320 },
  { x: "50%", y: "20%", color: "rgba(255, 150, 200, 0.06)", size: 340 },
  { x: "15%", y: "70%", color: "rgba(120, 200, 255, 0.05)", size: 260 },
];

/* ═══════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════ */
const AuthBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const currentRef = useRef({ x: 0.5, y: 0.5 });

  const farPetals  = useMemo(() => makePetals(15, "far"),  []);
  const midPetals  = useMemo(() => makePetals(20, "mid"),  []);
  const nearPetals = useMemo(() => makePetals(10, "near"), []);
  const twinklingStars = useMemo(() => makeTwinklingStars(50), []);

  /* ─── Mouse-based parallax ─── */
  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current = {
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight,
    };
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      // Smooth lerp towards target
      const lerp = 0.04;
      currentRef.current.x += (mouseRef.current.x - currentRef.current.x) * lerp;
      currentRef.current.y += (mouseRef.current.y - currentRef.current.y) * lerp;

      const cx = currentRef.current.x;
      const cy = currentRef.current.y;

      // Background layer — subtle movement (depth: far)
      if (bgRef.current) {
        const bx = (cx - 0.5) * -8;
        const by = (cy - 0.5) * -5;
        bgRef.current.style.transform = `translate(${bx}px, ${by}px) scale(1.08)`;
      }

      // Midground layer — medium movement
      if (midRef.current) {
        const mx = (cx - 0.5) * -16;
        const my = (cy - 0.5) * -10;
        midRef.current.style.transform = `translate(${mx}px, ${my}px) scale(1.05)`;
      }

      // Foreground layer — most movement (depth: near)
      if (fgRef.current) {
        const fx = (cx - 0.5) * -28;
        const fy = (cy - 0.5) * -18;
        fgRef.current.style.transform = `translate(${fx}px, ${fy}px) scale(1.03)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [handleMouseMove]);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 overflow-hidden pointer-events-none">

      {/* ── Layer 1: Background Plane (furthest depth) ── */}
      <div
        ref={bgRef}
        className="absolute inset-[-10%] bg-cover bg-center bg-no-repeat will-change-transform auth-camera"
        style={{ backgroundImage: `url('/auth-bg.png')` }}
      />

      {/* ── Layer 2: Midground — Subtle vignette depth ── */}
      <div
        ref={midRef}
        className="absolute inset-[-6%] will-change-transform pointer-events-none"
      >
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 20%, rgba(7, 5, 16, 0.35) 100%)",
          }}
        />
      </div>

      {/* ── Layer 3: Foreground depth frame ── */}
      <div
        ref={fgRef}
        className="absolute inset-[-4%] will-change-transform pointer-events-none"
      >
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 55% 50% at 50% 55%, transparent 30%, rgba(7, 5, 16, 0.5) 100%)",
            backdropFilter: "blur(0.4px)",
          }}
        />
      </div>

      {/* ── Layer 4: Depth Blur + Vignette ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 35%, rgba(7, 5, 16, 0.55) 100%)",
          }}
        />
      </div>

      {/* ── Layer 5: Twinkling Stars ── */}
      <div className="absolute inset-0 pointer-events-none">
        {twinklingStars.map(star => (
          <div
            key={`twinkle-${star.id}`}
            className="auth-star absolute rounded-full"
            style={{
              left: star.x,
              top: star.y,
              width: star.size,
              height: star.size,
              background: "white",
              boxShadow: `0 0 ${star.size * 3}px rgba(255,255,255,0.7)`,
              animationDuration: `${star.duration}s`,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </div>

      {/* ── Layer 6: Sakura Petals ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {farPetals.map(p => <SakuraPetal key={`far-${p.id}`} p={p} />)}
        {midPetals.map(p => <SakuraPetal key={`mid-${p.id}`} p={p} />)}
        {nearPetals.map(p => <SakuraPetal key={`near-${p.id}`} p={p} />)}
      </div>

      {/* ── Layer 7: Ambient Glow Orbs ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {glowOrbs.map((orb, i) => (
          <motion.div
            key={`orb-${i}`}
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
              x: [0, 12 + i * 4, -8 - i * 3, 0],
              y: [0, -8 - i * 3, 10 + i * 2, 0],
              scale: [1, 1.08, 0.94, 1],
            }}
            transition={{
              duration: 14 + i * 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* ── Layer 8: Floating light particles ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={`particle-${i}`}
            className="auth-float-particle absolute rounded-full"
            style={{
              width: 2 + Math.random() * 3,
              height: 2 + Math.random() * 3,
              left: `${Math.random() * 100}%`,
              top: `${20 + Math.random() * 70}%`,
              background: `rgba(${180 + Math.random() * 75}, ${180 + Math.random() * 75}, 255, ${0.3 + Math.random() * 0.4})`,
              animationDuration: `${8 + Math.random() * 12}s`,
              animationDelay: `${-Math.random() * 10}s`,
              filter: "blur(0.5px)",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default AuthBackground;
