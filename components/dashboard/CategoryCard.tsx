import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  icon: LucideIcon;
  title: string;
  metrics: { label: string; value: string }[];
  progress?: number;
  goal?: string;
  warning?: string;
  delay?: number;
  characterImg?: string;
  dialogue?: string;
  auraClass?: string;
}

export function CategoryCard({ icon: Icon, title, metrics, progress, goal, warning, delay = 0, characterImg, dialogue, auraClass = "" }: CategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`stat-card relative overflow-visible group ${auraClass}`}
    >
      {/* RPG Gamification Components */}
      {characterImg && (
        <>
          <div 
            className="absolute right-0 bottom-0 pointer-events-none opacity-40 mix-blend-screen transition-all duration-500 group-hover:opacity-80 group-hover:scale-110"
            style={{
              width: "130px",
              height: "130px",
              backgroundImage: `url(${characterImg})`,
              backgroundSize: "cover",
              backgroundPosition: "top center",
              maskImage: "radial-gradient(circle at 60% 60%, black 20%, transparent 70%)",
              WebkitMaskImage: "radial-gradient(circle at 60% 60%, black 20%, transparent 70%)"
            }}
          />
          {dialogue && (
            <div className="absolute -top-6 right-2 sm:-right-4 bg-black/80 backdrop-blur-md border border-white/20 rounded-2xl rounded-br-none px-3 py-2 text-[10px] text-white shadow-xl opacity-0 group-hover:opacity-100 group-hover:-translate-y-2 transition-all duration-300 whitespace-nowrap z-20 pointer-events-none">
              <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent italic font-medium">"{dialogue}"</span>
              <div className="absolute -bottom-2 right-0 w-3 h-3 bg-black/80 border-b border-r border-white/20 transform rotate-45"></div>
            </div>
          )}
        </>
      )}

      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-icon-bg transition-transform group-hover:scale-110">
          <Icon className="h-5 w-5 gradient-icon relative z-10" />
        </div>
        <h3 className="text-sm font-bold tracking-tight text-white group-hover:text-primary transition-colors hover:drop-shadow-[0_0_8px_rgba(0,234,255,0.8)]">{title}</h3>
      </div>

      <div className="space-y-2 relative z-10">
        {metrics.map((m) => (
          <div key={m.label} className="flex justify-between items-center group/metric">
            <span className="text-xs text-muted-foreground transition-colors group-hover/metric:text-foreground/80">{m.label}</span>
            <span className="text-sm font-mono font-bold text-foreground drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">{m.value}</span>
          </div>
        ))}
      </div>

      {progress !== undefined && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Progress</span>
            {goal && <span className="text-[10px] text-muted-foreground">{goal}</span>}
          </div>
          <div className="progress-track">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.8, delay: delay + 0.2 }}
            />
          </div>
        </div>
      )}

      {warning && (
        <div className="mt-3 rounded-md bg-accent/10 px-3 py-2">
          <p className="text-xs text-accent font-medium">{warning}</p>
        </div>
      )}
    </motion.div>
  );
}
