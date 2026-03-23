import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { Moon, Plus, Clock, Star } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";
import { SleepDialog } from "@/components/dialogs/SleepDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const SleepTracker = () => {
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: sleepLogs = [] } = useQuery({
    queryKey: ["sleep_logs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("sleep_logs")
        .select("*")
        .order("date", { ascending: false })
        .limit(30);
      return data || [];
    },
    enabled: !!user,
  });

  const calcDuration = (sleep: string, wake: string) => {
    const [sh, sm] = sleep.split(":").map(Number);
    const [wh, wm] = wake.split(":").map(Number);
    let mins = wh * 60 + wm - (sh * 60 + sm);
    if (mins < 0) mins += 24 * 60;
    return mins / 60;
  };

  const lastLog = sleepLogs[0] as any;
  const lastDuration = lastLog ? calcDuration(lastLog.sleep_time, lastLog.wake_time) : 0;
  const avgQuality = sleepLogs.length > 0
    ? Math.round(sleepLogs.reduce((s: number, l: any) => s + l.quality, 0) / sleepLogs.length)
    : 0;

  const chartData = sleepLogs.slice(0, 7).reverse().map((l: any) => ({
    day: new Date(l.date).toLocaleDateString("en", { weekday: "short" }),
    hours: Math.round(calcDuration(l.sleep_time, l.wake_time) * 10) / 10,
  }));

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Immersive Anime Hero Card */}
        <div className="relative w-full h-[320px] sm:h-[400px] rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(168,85,247,0.5)] group/hero border border-purple-500/50">
          {/* Background Image & Magic Parallax */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] group-hover/hero:scale-105"
            style={{ backgroundImage: `url('/nezuko.webp')`, filter: 'brightness(0.9) contrast(1.1)' }}
          />
          {/* Gradients to blend content seamlessly */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#05070e] via-[#05070e]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#05070e]/80 via-transparent to-[#05070e]/80 sm:to-[#05070e]/50" />

          {/* Floating magical moon particles */}
          <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-purple-300 rounded-full animate-pulse opacity-40 shadow-[0_0_20px_purple] blur-[2px]" />
          <div className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 bg-indigo-300 rounded-full animate-ping opacity-60 shadow-[0_0_10px_indigo]" style={{ animationDuration: '4s' }} />

          {/* Hero Content Overlay */}
          <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-between z-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="max-w-md">
                <span className="inline-block px-3 py-1 bg-purple-500/10 border border-purple-400/30 rounded-full text-[10px] text-purple-300 font-bold uppercase tracking-[0.2em] mb-3 backdrop-blur-md shadow-[0_0_10px_rgba(168,85,247,0.2)] flex items-center gap-1.5 w-fit">
                  <Moon className="w-3 h-3" /> Tranquil Nights
                </span>
                <h1 className="text-3xl sm:text-4xl font-black text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] leading-tight">
                  "Rest now... <br /><span className="text-purple-400 text-2xl sm:text-3xl bg-clip-text drop-shadow-[0_0_15px_rgba(168,85,247,0.6)]">Tomorrow awaits."</span>
                </h1>
              </div>

              {/* Glassmorphism Dynamic Stats Card - Ring UI */}
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center min-w-[160px] shadow-[0_10px_30px_rgba(0,0,0,0.5)] transform transition-transform duration-500 hover:scale-105 hover:bg-black/50 hover:border-purple-500/30 group/timer relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5" />
                <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-2 flex items-center gap-1.5 relative z-10">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                  Last Night's Sleep
                </p>
                <div className="relative z-10 flex items-center gap-3">
                  {/* Mini SVG Ring Progress */}
                  <div className="relative w-12 h-12">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="none" className="text-white/10" />
                      <circle
                        cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="none"
                        className="text-purple-400 drop-shadow-[0_0_5px_rgba(168,85,247,0.8)] transition-all duration-1000"
                        strokeDasharray="125"
                        strokeDashoffset={125 - ((Math.min(lastDuration, 8) / 8) * 125)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Moon className="w-4 h-4 text-purple-300" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-3xl font-mono font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.7)] group-hover/timer:text-purple-50 transition-colors">
                      {lastDuration ? lastDuration.toFixed(1) : "0.0"}<span className="text-sm text-white/50">/8</span>
                    </h2>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest text-right -mt-1">hrs</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mt-auto pt-6 sm:pt-0">
              <button
                onClick={() => setDialogOpen(true)}
                className="flex items-center gap-2 rounded-xl px-6 py-3.5 text-xs sm:text-sm font-black text-white bg-gradient-to-r from-purple-600 to-indigo-700 shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] transition-all hover:-translate-y-1 hover:scale-[1.02] border border-purple-400/30 uppercase tracking-[0.15em] relative overflow-hidden group/btn"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] skew-x-[30deg] group-hover/btn:animate-[shimmer_1.5s_infinite]" />
                <Star className="h-4 w-4 relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                <span className="relative z-10">Log Sleep</span>
              </button>
            </div>
          </div>
        </div>

        {/* Compact Stats Row under the Hero */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          {[
            { icon: Moon, label: "Last Night", value: lastLog ? `${lastDuration.toFixed(1)}h` : "—", sub: lastLog ? `${lastLog.sleep_time} → ${lastLog.wake_time}` : "No data", color: "text-purple-400" },
            { icon: Star, label: "Avg Quality", value: `${avgQuality}/10`, sub: `${sleepLogs.length} lifetime logs`, color: "text-indigo-400" },
            { icon: Clock, label: "Goal", value: "7h+", sub: lastDuration >= 7 ? "On target ✓" : "Below target", color: "text-pink-400" },
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

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="card-elevated p-6 relative group border-glow-purple">
          <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none" />
          <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)] animate-pulse" />
            Sleep Duration (hours)
          </h3>
          {chartData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Log some sleep to see trends.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.2} />
                  </linearGradient>
                  <filter id="neonBarSleepGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <XAxis dataKey="day" axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)", fontWeight: "bold" }} dy={10} />
                <YAxis hide />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: 12, fontSize: 12 }} />
                <Bar
                  dataKey="hours"
                  radius={[6, 6, 0, 0]}
                  animationDuration={1500}
                  shape={(props: any) => {
                    const { fill, x, y, width, height } = props;
                    return (
                      <rect
                        x={x} y={y} width={width} height={height}
                        fill="url(#sleepGrad)"
                        stroke="#c084fc"
                        strokeWidth={1}
                        filter="url(#neonBarSleepGlow)"
                        rx={6} ry={6}
                      />
                    );
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card-elevated p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Sleep Log</h3>
          {sleepLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No sleep logs yet.</p>
          ) : (
            <div className="space-y-2">
              {sleepLogs.slice(0, 7).map((l: any) => (
                <div key={l.id} className="flex items-center justify-between rounded-lg bg-muted/30 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{l.date}</p>
                    <p className="text-xs text-muted-foreground">{l.sleep_time} → {l.wake_time}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-semibold text-blue-400">{calcDuration(l.sleep_time, l.wake_time).toFixed(1)}h</p>
                    <p className="text-[10px] text-muted-foreground">Quality: {l.quality}/10</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
      <SleepDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </Layout>
  );
};

export default SleepTracker;
