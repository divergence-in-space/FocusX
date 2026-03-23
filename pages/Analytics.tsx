import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { BarChart3, TrendingDown, TrendingUp, AlertTriangle, Calendar, Trophy, Frown } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, BarChart, Bar,
} from "recharts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";

const chartTooltipStyle = {
  background: "hsl(222, 24%, 10%)",
  border: "1px solid hsl(222, 18%, 18%)",
  borderRadius: 8,
  fontSize: 12,
};

const Analytics = () => {
  const {
    loading, dailyScores, weeklyScores, weeklyAvg, weeklyDelta,
    monthlyAvg, weeklyRadar, insights, bestDay, worstDay,
  } = useAnalyticsData();

  // Normalize radar values to percentage for display
  const radarDisplay = weeklyRadar.map(r => ({
    category: r.category,
    value: r.max > 0 ? Math.round((r.value / r.max) * 100) : 0,
  }));

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Immersive Anime Hero Card - Deep Space Theme */}
        <div className="relative w-full rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(59,130,246,0.15)] group/hero border border-blue-500/20 bg-[#020617] p-6 sm:p-10 mb-8 max-h-[500px]">
          {/* Background Space Gradients & Parallax */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-indigo-900/10 to-[#020617] transition-transform duration-[10s] group-hover/hero:scale-105" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-40 mix-blend-color-dodge" />
          
          {/* Gradients to blend content seamlessly */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
          
          {/* Floating magical space particles */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-300 rounded-full animate-pulse opacity-60 shadow-[0_0_15px_blue] blur-[1px]" />
          <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-fuchsia-300 rounded-full animate-pulse opacity-40 shadow-[0_0_20px_fuchsia]" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-cyan-300 rounded-full animate-ping opacity-80 shadow-[0_0_10px_cyan]" style={{ animationDuration: '2s' }} />

          {/* Hero Content Overlay */}
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div className="max-w-md">
                <span className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-400/30 rounded-full text-[10px] text-blue-300 font-bold uppercase tracking-[0.2em] mb-3 backdrop-blur-md shadow-[0_0_10px_rgba(59,130,246,0.2)] flex items-center gap-1.5 w-fit">
                  <BarChart3 className="w-3 h-3" /> System Diagnostics
                </span>
                <h1 className="text-3xl sm:text-4xl font-black text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] leading-tight">
                  "Analyze your data. <br/><span className="text-blue-400 text-2xl sm:text-3xl bg-clip-text drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]">Level up your life."</span>
                </h1>
              </div>

              {/* Glassmorphism XP Total Card */}
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center min-w-[160px] shadow-[0_10px_30px_rgba(0,0,0,0.5)] transform transition-transform duration-500 hover:scale-105 hover:bg-black/50 hover:border-blue-500/30 group/timer">
                 <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-2 flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                   Total System XP
                 </p>
                 <div className="relative">
                   <h2 className="text-4xl sm:text-5xl font-mono font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.7)] group-hover/timer:text-blue-50 transition-colors">
                     {monthlyAvg} <span className="text-sm font-bold text-white/60">avg</span>
                   </h2>
                 </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-10 text-blue-400/50 flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-mono tracking-widest uppercase">Initializing Telemetry...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4 flex gap-4 items-center group/card hover:bg-white/5 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/5 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.15)] group-hover/card:scale-110 transition-transform">
                    <TrendingUp className="w-6 h-6 text-cyan-400 drop-shadow-[0_0_5px_currentColor]" />
                  </div>
                  <div>
                    <h4 className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Weekly Performance</h4>
                    <p className="text-2xl font-mono text-white font-black drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{weeklyAvg}</p>
                    <div className="flex gap-1 items-center">
                      <span className={`text-[10px] font-mono font-bold ${weeklyDelta >= 0 ? "text-green-400" : "text-red-400"}`}>{weeklyDelta > 0 ? "+" : ""}{weeklyDelta}</span>
                      <span className="text-[9px] text-white/30 uppercase tracking-wider">vs prev</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4 flex gap-4 items-center group/card hover:bg-white/5 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/5 border border-yellow-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.15)] group-hover/card:scale-110 transition-transform">
                    <Trophy className="w-6 h-6 text-yellow-400 drop-shadow-[0_0_5px_currentColor]" />
                  </div>
                  <div>
                    <h4 className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Highest Simulation</h4>
                    <p className="text-2xl font-mono text-white font-black drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{bestDay?.total ?? "—"}</p>
                    <p className="text-[9px] text-white/40 uppercase tracking-wider">{bestDay?.label ?? "No data"}</p>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4 flex gap-4 items-center group/card hover:bg-white/5 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/5 border border-red-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.15)] group-hover/card:scale-110 transition-transform">
                    <Frown className="w-6 h-6 text-red-500 drop-shadow-[0_0_5px_currentColor]" />
                  </div>
                  <div>
                    <h4 className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Lowest Simulation</h4>
                    <p className="text-2xl font-mono text-white font-black drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{worstDay?.total ?? "—"}</p>
                    <p className="text-[9px] text-white/40 uppercase tracking-wider">{worstDay?.label ?? "No data"}</p>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </div>

        {!loading && (
          <>

            {/* Tabbed Score Trends */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-elevated p-5">
              <Tabs defaultValue="weekly">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Score Trend
                  </h3>
                  <TabsList className="bg-muted/50">
                    <TabsTrigger value="weekly" className="text-xs">7 Days</TabsTrigger>
                    <TabsTrigger value="monthly" className="text-xs">30 Days</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="weekly">
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={weeklyScores}>
                      <defs>
                        <linearGradient id="analyticsGradW" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(215, 15%, 52%)" }} />
                      <YAxis domain={[0, 100]} hide />
                      <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number) => [`${v}`, "Score"]} />
                      <Area type="monotone" dataKey="total" stroke="hsl(160, 84%, 39%)" strokeWidth={2} fill="url(#analyticsGradW)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </TabsContent>

                <TabsContent value="monthly">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={dailyScores}>
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "hsl(215, 15%, 52%)" }} interval={2} />
                      <YAxis domain={[0, 100]} hide />
                      <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number) => [`${v}`, "Score"]} />
                      <Bar dataKey="total" fill="hsl(160, 84%, 39%)" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </TabsContent>
              </Tabs>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Balance Radar */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card-elevated p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Category Balance (Weekly %)</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <RadarChart data={radarDisplay}>
                    <PolarGrid stroke="hsl(222, 18%, 18%)" />
                    <PolarAngleAxis dataKey="category" tick={{ fontSize: 10, fill: "hsl(215, 15%, 52%)" }} />
                    <Radar dataKey="value" stroke="hsl(160, 84%, 39%)" fill="hsl(160, 84%, 39%)" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Category Breakdown Bar */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card-elevated p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Weekly Category Scores</h3>
                <div className="space-y-3">
                  {weeklyRadar.map((cat) => {
                    const pct = cat.max > 0 ? Math.round((cat.value / cat.max) * 100) : 0;
                    return (
                      <div key={cat.category}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">{cat.category}</span>
                          <span className="font-mono text-foreground">{cat.value}/{cat.max}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            {/* Daily Breakdown Table */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="card-elevated p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Day-by-Day Breakdown (Last 7 Days)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-2 text-muted-foreground font-medium">Day</th>
                      <th className="text-center py-2 px-2 text-muted-foreground font-medium">Total</th>
                      <th className="text-center py-2 px-2 text-muted-foreground font-medium">Study</th>
                      <th className="text-center py-2 px-2 text-muted-foreground font-medium">Sleep</th>
                      <th className="text-center py-2 px-2 text-muted-foreground font-medium">Gym</th>
                      <th className="text-center py-2 px-2 text-muted-foreground font-medium">Habits</th>
                      <th className="text-center py-2 px-2 text-muted-foreground font-medium">Mood</th>
                      <th className="text-center py-2 px-2 text-muted-foreground font-medium">₹ Spent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weeklyScores.map((day) => (
                      <tr key={day.date} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-2 px-2 font-medium text-foreground">{day.day}, {day.label}</td>
                        <td className="py-2 px-2 text-center">
                          <span className={`font-mono font-bold ${day.total >= 60 ? "text-score-good" : day.total >= 40 ? "text-score-average" : "text-score-poor"}`}>
                            {day.total}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-center font-mono text-muted-foreground">{day.study}/25</td>
                        <td className="py-2 px-2 text-center font-mono text-muted-foreground">{day.sleep}/15</td>
                        <td className="py-2 px-2 text-center font-mono text-muted-foreground">{day.gym}/15</td>
                        <td className="py-2 px-2 text-center font-mono text-muted-foreground">{day.habits}/15</td>
                        <td className="py-2 px-2 text-center font-mono text-muted-foreground">{day.mood}/10</td>
                        <td className="py-2 px-2 text-center font-mono text-muted-foreground">₹{day.totalSpent}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Insights */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card-elevated p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Weekly Insights
              </h3>
              <div className="space-y-3">
                {insights.map((ins, i) => (
                  <div key={i} className={`flex items-start gap-3 rounded-lg px-4 py-3 ${ins.type === "warning" ? "bg-accent/5 border border-accent/10" : "bg-primary/5 border border-primary/10"}`}>
                    {ins.type === "warning" ? (
                      <AlertTriangle className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    )}
                    <p className="text-sm text-foreground">{ins.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Analytics;
