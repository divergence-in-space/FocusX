import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/60 backdrop-blur-xl border border-cyan-500/30 rounded-xl px-4 py-3 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
        <p className="text-[10px] text-white/60 mb-1 uppercase tracking-widest">{label}</p>
        <p className="text-xl font-mono font-black text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
          {payload[0].value} <span className="text-xs text-white/50">XP</span>
        </p>
      </div>
    );
  }
  return null;
};

interface WeeklyChartProps {
  data: { day: string; score: number }[];
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="card-elevated p-6 relative group"
    >
      <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none" />
      <h3 className="text-sm font-bold tracking-tight text-white mb-6 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse" />
        Weekly XP Gain
      </h3>
      <div className="relative">
        {/* Holographic grid lines behind chart implicitly in CSS or rechart, we'll keep Recharts pure */}
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00eaff" stopOpacity={0.6} />
                <stop offset="50%" stopColor="#00eaff" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#00eaff" stopOpacity={0} />
              </linearGradient>
              <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <XAxis dataKey="day" axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)", fontWeight: "bold" }} dy={10} />
            <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} dx={-10} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(34,211,238,0.3)', strokeWidth: 2, strokeDasharray: '4 4' }} />
            <Area 
              type="monotone" 
              dataKey="score" 
              stroke="#00eaff" 
              strokeWidth={3} 
              fill="url(#scoreGradient)" 
              activeDot={{ r: 6, fill: "#fff", stroke: "#00eaff", strokeWidth: 3, filter: "url(#neonGlow)" }}
              filter="url(#neonGlow)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

interface CategoryBreakdownChartProps {
  data: { name: string; value: number }[];
}

export function CategoryBreakdownChart({ data }: CategoryBreakdownChartProps) {
  // RPG colors for the bar chart
  const getBarColor = (index: number) => {
    const colors = ["#b478ff", "#00eaff", "#f472b6", "#4ade80", "#fb923c"];
    return colors[index % colors.length];
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="card-elevated p-6 relative group"
    >
      <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none" />
      <h3 className="text-sm font-bold tracking-tight text-white mb-6 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)] animate-pulse" />
        Skill Distribution
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            {data.map((_, index) => (
              <linearGradient key={`grad-${index}`} id={`colorGrad-${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={getBarColor(index)} stopOpacity={0.8} />
                <stop offset="100%" stopColor={getBarColor(index)} stopOpacity={0.2} />
              </linearGradient>
            ))}
            <filter id="neonBarGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <XAxis dataKey="name" axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)", fontWeight: "bold" }} dy={10} />
          <YAxis hide />
          <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} content={<CustomTooltip />} />
          <Bar 
            dataKey="value" 
            radius={[6, 6, 0, 0]} 
            animationDuration={1500}
            shape={(props: any) => {
              const { fill, x, y, width, height, index } = props;
              return (
                <rect 
                  x={x} y={y} width={width} height={height} 
                  fill={`url(#colorGrad-${index})`} 
                  stroke={getBarColor(index)}
                  strokeWidth={1}
                  filter="url(#neonBarGlow)" 
                  rx={6} ry={6} 
                />
              );
            }} 
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
