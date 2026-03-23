import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { BookOpen, Plus, Clock, Brain } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";
import { StudySessionDialog } from "@/components/dialogs/StudySessionDialog";
import { StudyTimer } from "@/components/StudyTimer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const StudyTracker = () => {
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [timerOpen, setTimerOpen] = useState(false);

  const { data: sessions = [] } = useQuery({
    queryKey: ["study_sessions"],
    queryFn: async () => {
      const { data } = await supabase
        .from("study_sessions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
    enabled: !!user,
  });

  const todaySessions = sessions.filter(
    (s: any) => s.date === new Date().toISOString().split("T")[0]
  );

  const calcHours = (start: string, end: string) => {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    return Math.max(0, (eh * 60 + em - sh * 60 - sm) / 60);
  };

  const todayHours = todaySessions.reduce((sum: number, s: any) => sum + calcHours(s.start_time, s.end_time), 0);
  const avgFocus = todaySessions.length > 0
    ? Math.round(todaySessions.reduce((sum: number, s: any) => sum + s.focus_score, 0) / todaySessions.length)
    : 0;

  // Build weekly chart from sessions
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekData = days.map((day, i) => {
    const daySessions = sessions.filter((s: any) => new Date(s.date).getDay() === i);
    const hours = daySessions.reduce((sum: number, s: any) => sum + calcHours(s.start_time, s.end_time), 0);
    return { day, hours: Math.round(hours * 10) / 10 };
  });

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Immersive Anime Hero Card */}
        <div className="relative w-full h-[320px] sm:h-[400px] rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(34,211,238,0.5)] group/hero border border-cyan-500/50">
          {/* Background Image & Magic Parallax */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] group-hover/hero:scale-105"
            style={{ backgroundImage: `url('https://www.bing.com/th/id/OGC.2fbc8565dcc4e3e3418320cb0fcc1815?o=7&pid=1.7&rm=3&rurl=https%3a%2f%2fgiffiles.alphacoders.com%2f220%2f220356.gif&ehk=OGsbRL537HZyrCQG6P4kGPqDD6Iy0XWZnWgIA4Oat6E%3d')`, filter: 'brightness(0.8) contrast(1.1)' }} 
          />
          {/* Gradients to blend content seamlessly */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#05070e] via-[#05070e]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#05070e]/80 via-transparent to-[#05070e]/80 sm:to-[#05070e]/40" />
          
          {/* Floating magical particles */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-300 rounded-full animate-ping opacity-50 shadow-[0_0_10px_cyan]" />
          <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-blue-300 rounded-full animate-pulse opacity-70 shadow-[0_0_10px_blue]" />

          {/* Hero Content Overlay */}
          <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-between z-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="max-w-md">
                <span className="inline-block px-3 py-1 bg-cyan-500/10 border border-cyan-400/30 rounded-full text-[10px] text-cyan-300 font-bold uppercase tracking-[0.2em] mb-3 backdrop-blur-md shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                  Domain Expansion
                </span>
                <h1 className="text-3xl sm:text-4xl font-black text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] leading-tight">
                  "Nah, I'd win. <br/><span className="text-cyan-400 text-2xl sm:text-3xl bg-clip-text drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]">Try beating my focus."</span>
                </h1>
              </div>

              {/* Glassmorphism Dynamic Stats Card */}
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center min-w-[160px] shadow-[0_10px_30px_rgba(0,0,0,0.5)] transform transition-transform duration-500 hover:scale-105 hover:bg-black/50 hover:border-cyan-500/30 group/timer">
                 <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-2 flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                   Today's Study
                 </p>
                 <div className="relative">
                   <h2 className="text-4xl sm:text-5xl font-mono font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.7)] group-hover/timer:text-cyan-50 transition-colors">
                     {todayHours > 0 ? todayHours.toFixed(1) : "0.0"} <span className="text-sm font-bold text-white/60">hrs</span>
                   </h2>
                 </div>
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex items-center gap-3 mt-auto pt-6 sm:pt-0">
              <button
                onClick={() => setTimerOpen(true)}
                className="flex items-center gap-2 rounded-xl px-6 py-3.5 text-xs sm:text-sm font-black text-white bg-gradient-to-r from-cyan-600 to-blue-700 shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_35px_rgba(34,211,238,0.6)] transition-all hover:-translate-y-1 hover:scale-[1.02] border border-cyan-400/30 uppercase tracking-[0.15em] relative overflow-hidden group/btn"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] skew-x-[30deg] group-hover/btn:animate-[shimmer_1.5s_infinite]" />
                <Brain className="h-4 w-4 relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" /> 
                <span className="relative z-10">Start Focus Session</span>
              </button>
              <button
                onClick={() => setDialogOpen(true)}
                className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/20 hover:bg-white/10 rounded-xl px-5 py-3.5 text-xs sm:text-sm font-bold text-white transition-all hover:border-cyan-400/50 hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] uppercase tracking-wider"
              >
                <Plus className="h-4 w-4" /> Log Manually
              </button>
            </div>
          </div>
        </div>

        {/* Compact Stats Row under the Hero */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          {[
            { icon: Clock, label: "Today's Focus", value: `${todayHours.toFixed(1)}h`, sub: "Goal: 5h", color: "text-cyan-400" },
            { icon: BookOpen, label: "Total Sessions", value: `${todaySessions.length}`, sub: `Avg quality: ${avgFocus}/10`, color: "text-purple-400" },
            { icon: Brain, label: "Lifetime Logged", value: `${sessions.length}`, sub: "All time quests", color: "text-pink-400" },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + (i * 0.1) }} className="card-elevated p-4 md:p-5 group hover:bg-white/5 transition-colors border-white/5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/40 border border-white/10 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                  <stat.icon className={`h-6 w-6 ${stat.color} drop-shadow-[0_0_8px_currentColor]`} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-white/50">{stat.label}</p>
                  <p className="text-2xl font-mono font-black text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">{stat.value}</p>
                  <p className="text-[9px] uppercase tracking-wider font-bold text-white/30">{stat.sub}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card-elevated p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Study Hours This Week</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weekData}>
              <defs>
                <linearGradient id="studyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(215, 15%, 52%)" }} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: "hsl(222, 24%, 10%)", border: "1px solid hsl(222, 18%, 18%)", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="hours" stroke="hsl(160, 84%, 39%)" strokeWidth={2} fill="url(#studyGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card-elevated p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Today's Sessions</h3>
          {todaySessions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No sessions logged today. Start studying!</p>
          ) : (
            <div className="space-y-3">
              {todaySessions.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between rounded-lg bg-muted/30 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.subject}</p>
                    <p className="text-xs text-muted-foreground">{s.start_time} – {s.end_time}{s.notes ? ` • ${s.notes}` : ""}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-semibold text-primary">{s.focus_score}/10</p>
                    <p className="text-[10px] text-muted-foreground">Focus</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
      <StudySessionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <StudyTimer open={timerOpen} onOpenChange={setTimerOpen} />
    </Layout>
  );
};

export default StudyTracker;
