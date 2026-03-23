import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { Dumbbell, Plus, TrendingUp, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";
import { WorkoutDialog } from "@/components/dialogs/WorkoutDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const GymTracker = () => {
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: workouts = [] } = useQuery({
    queryKey: ["workouts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("workouts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
    enabled: !!user,
  });

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekData = days.map((day, i) => {
    const dayWorkouts = workouts.filter((w: any) => new Date(w.date).getDay() === i);
    const duration = dayWorkouts.reduce((s: number, w: any) => s + w.duration, 0);
    return { day, duration };
  });

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Immersive Anime Hero Card */}
        <div className="relative w-full md:w-[75%] mx-auto h-[320px] sm:h-[400px] rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(59,130,246,0.5)] group/hero border border-blue-500/50">
          {/* Background Image & Magic Parallax */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] group-hover/hero:scale-105"
            style={{ backgroundImage: `url('https://www.bing.com/th/id/OGC.a0d7543bb925eaed2033b92e2fb12989?o=7&pid=1.7&rm=3&rurl=https%3a%2f%2fi.pinimg.com%2foriginals%2f1e%2f6a%2f8d%2f1e6a8d1a0bfd3ab6ba0413a88915e6b3.gif&ehk=nqliYNI6tYRz7fGQkvOEAxfH50rfI5Mx5f4zXmF8Qs8%3d')`, filter: 'brightness(0.9) contrast(1.1)' }} 
          />
          {/* Gradients to blend content seamlessly */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#05070e] via-[#05070e]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#05070e]/80 via-transparent to-[#05070e]/80 sm:to-[#05070e]/50" />
          
          {/* Floating water particles */}
          <div className="absolute top-1/3 left-1/4 w-3.5 h-3.5 bg-blue-400 rounded-full animate-pulse opacity-40 shadow-[0_0_15px_blue] blur-[1px]" />
          <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-cyan-300 rounded-full animate-bounce opacity-60 shadow-[0_0_10px_cyan]" style={{ animationDuration: '3s' }} />

          {/* Hero Content Overlay */}
          <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-between z-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="max-w-md">
                <span className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-400/30 rounded-full text-[10px] text-blue-300 font-bold uppercase tracking-[0.2em] mb-3 backdrop-blur-md shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                  Total Concentration
                </span>
                <h1 className="text-3xl sm:text-4xl font-black text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] leading-tight">
                  "Stay strong. <br/><span className="text-blue-400 text-2xl sm:text-3xl bg-clip-text drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]">Every step counts."</span>
                </h1>
              </div>

              {/* Glassmorphism Dynamic Stats Card */}
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center min-w-[160px] shadow-[0_10px_30px_rgba(0,0,0,0.5)] transform transition-transform duration-500 hover:scale-105 hover:bg-black/50 hover:border-blue-500/30 group/timer">
                 <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-2 flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                   Total Check-ins
                 </p>
                 <div className="relative">
                   <h2 className="text-4xl sm:text-5xl font-mono font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.7)] group-hover/timer:text-blue-50 transition-colors">
                     {workouts.length} <span className="text-sm font-bold text-white/60">sets</span>
                   </h2>
                 </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mt-auto pt-6 sm:pt-0">
              <button
                onClick={() => setDialogOpen(true)}
                className="flex items-center gap-2 rounded-xl px-6 py-3.5 text-xs sm:text-sm font-black text-white bg-gradient-to-r from-blue-600 to-cyan-700 shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_35px_rgba(59,130,246,0.6)] transition-all hover:-translate-y-1 hover:scale-[1.02] border border-blue-400/30 uppercase tracking-[0.15em] relative overflow-hidden group/btn"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] skew-x-[30deg] group-hover/btn:animate-[shimmer_1.5s_infinite]" />
                <Dumbbell className="h-4 w-4 relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" /> 
                <span className="relative z-10">Log Workout</span>
              </button>
            </div>
          </div>
        </div>
        {/* Compact Stats Row under the Hero */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          {[
            { icon: Dumbbell, label: "Total Workouts", value: `${workouts.length}`, sub: "All time quests", color: "text-blue-400" },
            { icon: TrendingUp, label: "This Week", value: `${workouts.filter((w: any) => { const d = new Date(w.date); const now = new Date(); return d >= new Date(now.setDate(now.getDate() - 7)); }).length}`, sub: "active sessions", color: "text-cyan-400" },
            { icon: Calendar, label: "Latest", value: workouts[0] ? (workouts[0] as any).workout_type : "—", sub: workouts[0] ? `${(workouts[0] as any).duration} min` : "No data", color: "text-purple-400" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + (i * 0.1) }} className="card-elevated p-4 md:p-5 group hover:bg-white/5 transition-colors border-white/5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/40 border border-white/10 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                  <s.icon className={`h-6 w-6 ${s.color} drop-shadow-[0_0_8px_currentColor]`} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-white/50">{s.label}</p>
                  <p className="text-xl font-mono font-black text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">{s.value}</p>
                  <p className="text-[9px] uppercase tracking-wider font-bold text-white/30 truncate max-w-[120px]">{s.sub}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="card-elevated p-6 relative group border-glow-blue">
          <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none" />
          <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)] animate-pulse" />
            Workout Duration (min)
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weekData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gymGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.2} />
                </linearGradient>
                <filter id="neonBarGymGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <XAxis dataKey="day" axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)", fontWeight: "bold" }} dy={10} />
              <YAxis hide />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 12, fontSize: 12 }} />
              <Bar 
                dataKey="duration" 
                radius={[6, 6, 0, 0]} 
                animationDuration={1500}
                shape={(props: any) => {
                  const { fill, x, y, width, height } = props;
                  return (
                    <rect 
                      x={x} y={y} width={width} height={height} 
                      fill="url(#gymGrad)" 
                      stroke="#60a5fa"
                      strokeWidth={1}
                      filter="url(#neonBarGymGlow)" 
                      rx={6} ry={6} 
                    />
                  );
                }} 
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card-elevated p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Recent Workouts</h3>
          {workouts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No workouts logged yet.</p>
          ) : (
            <div className="space-y-2">
              {workouts.slice(0, 10).map((w: any) => (
                <div key={w.id} className="flex items-center justify-between rounded-lg bg-muted/30 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{w.workout_type}</p>
                    <p className="text-xs text-muted-foreground">{w.exercises || "No exercises noted"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-semibold text-purple-400">{w.duration} min</p>
                    <p className="text-[10px] text-muted-foreground">{w.calories ? `${w.calories} cal • ` : ""}{w.date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
      <WorkoutDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </Layout>
  );
};

export default GymTracker;
