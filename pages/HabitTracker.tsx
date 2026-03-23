import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { CheckSquare, Flame, Target, Trash2 } from "lucide-react";
import { useState } from "react";
import { HabitDialog } from "@/components/dialogs/HabitDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const HabitTracker = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  const { data: habits = [] } = useQuery({
    queryKey: ["habits"],
    queryFn: async () => {
      const { data } = await supabase.from("habits").select("*").order("created_at", { ascending: true });
      return data || [];
    },
    enabled: !!user,
  });

  const { data: todayLogs = [] } = useQuery({
    queryKey: ["habit_logs", today],
    queryFn: async () => {
      const { data } = await supabase.from("habit_logs").select("*").eq("date", today);
      return data || [];
    },
    enabled: !!user,
  });

  const toggleHabit = useMutation({
    mutationFn: async ({ habitId, completed }: { habitId: string; completed: boolean }) => {
      if (!user) throw new Error("Not signed in");
      const existing = todayLogs.find((l: any) => l.habit_id === habitId);
      if (existing) {
        await supabase.from("habit_logs").update({ completed }).eq("id", (existing as any).id);
      } else {
        await supabase.from("habit_logs").insert({ habit_id: habitId, user_id: user.id, date: today, completed });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["habit_logs"] }),
  });

  const deleteHabit = useMutation({
    mutationFn: async (habitId: string) => {
      await supabase.from("habits").delete().eq("id", habitId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      toast.success("Habit deleted");
    },
  });

  const completedToday = habits.filter((h: any) => todayLogs.some((l: any) => l.habit_id === h.id && l.completed)).length;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Immersive Anime Hero Card - Quest Board Theme */}
        <div className="relative w-full h-[320px] sm:h-[400px] rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(245,158,11,0.5)] group/hero border border-orange-500/50 bg-[#1a0f14]">
          {/* Background Image & Magic Parallax */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] group-hover/hero:scale-105"
            style={{ backgroundImage: `url('https://www.bing.com/th/id/OGC.9617b79b2c3feeda825ddc7ea81031be?o=7&pid=1.7&rm=3&rurl=https%3a%2f%2fi.makeagif.com%2fmedia%2f12-28-2020%2fiO077_.gif&ehk=XMLkeLJV2P7%2fJ1bgQA2FcqLj6AwMT4BVoZKE6KTaA3A%3d')`, filter: 'brightness(0.8) contrast(1.1)' }} 
          />
          
          {/* Gradients to blend content seamlessly */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#05070e] via-[#05070e]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#05070e]/80 via-transparent to-[#05070e]/80 sm:to-[#05070e]/40" />
          
          {/* Floating magical particles */}
          <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-amber-300 rounded-full animate-pulse opacity-60 shadow-[0_0_15px_gold] blur-[1px]" />
          <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-pink-300 rounded-full animate-ping opacity-80 shadow-[0_0_10px_pink]" style={{ animationDuration: '3s' }} />

          {/* Hero Content Overlay */}
          <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-between z-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="max-w-md">
                <span className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-400/30 rounded-full text-[10px] text-amber-300 font-bold uppercase tracking-[0.2em] mb-3 backdrop-blur-md shadow-[0_0_10px_rgba(245,158,11,0.2)] flex items-center gap-1.5 w-fit">
                  <Flame className="w-3 h-3" /> Daily Quests
                </span>
                <h1 className="text-3xl sm:text-4xl font-black text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] leading-tight">
                  "Adventure awaits. <br/><span className="text-amber-400 text-2xl sm:text-3xl bg-clip-text drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]">Claim your destiny."</span>
                </h1>
              </div>

              {/* Glassmorphism Dynamic Stats Card */}
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center min-w-[160px] shadow-[0_10px_30px_rgba(0,0,0,0.5)] transform transition-transform duration-500 hover:scale-105 hover:bg-black/50 hover:border-amber-500/30 group/timer">
                 <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-2 flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                   Active Quests
                 </p>
                 <div className="relative">
                   <h2 className="text-4xl sm:text-5xl font-mono font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.7)] group-hover/timer:text-amber-50 transition-colors">
                     {habits.length - completedToday} <span className="text-sm font-bold text-white/60">rem</span>
                   </h2>
                 </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mt-auto pt-6 sm:pt-0">
              <button
                onClick={() => setDialogOpen(true)}
                className="flex items-center gap-2 rounded-xl px-6 py-3.5 text-xs sm:text-sm font-black text-white bg-gradient-to-r from-amber-600 to-orange-700 shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_35px_rgba(245,158,11,0.6)] transition-all hover:-translate-y-1 hover:scale-[1.02] border border-amber-400/30 uppercase tracking-[0.15em] relative overflow-hidden group/btn"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] skew-x-[30deg] group-hover/btn:animate-[shimmer_1.5s_infinite]" />
                <Target className="h-4 w-4 relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" /> 
                <span className="relative z-10">Add New Quest</span>
              </button>
            </div>
          </div>
        </div>

        {/* Compact Stats Row under the Hero */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          {[
            { icon: CheckSquare, label: "Today's Progress", value: `${completedToday}/${habits.length}`, sub: habits.length > 0 ? `${Math.round(completedToday / habits.length * 100)}% complete` : "Add habits", color: "text-amber-400" },
            { icon: Flame, label: "Total Quests", value: `${habits.length}`, sub: "Active habits", color: "text-pink-400" },
            { icon: Target, label: "Logged Today", value: `${todayLogs.length}`, sub: "Total entries recorded", color: "text-purple-400" },
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

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card-elevated p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Today's Habits</h3>
          {habits.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No habits yet. Add one to get started!</p>
          ) : (
            <div className="space-y-2">
              {habits.map((h: any) => {
                const done = todayLogs.some((l: any) => l.habit_id === h.id && l.completed);
                return (
                  <div key={h.id} className={`flex items-center justify-between rounded-lg px-4 py-3 transition-colors ${done ? "bg-primary/5 border border-primary/10" : "bg-muted/30"}`}>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleHabit.mutate({ habitId: h.id, completed: !done })}
                        className={`flex h-6 w-6 items-center justify-center rounded-md cursor-pointer ${done ? "gradient-score" : "border border-border hover:border-primary/50"}`}
                      >
                        {done && <span className="text-xs text-primary-foreground">✓</span>}
                      </button>
                      <div>
                        <span className={`text-sm ${done ? "text-foreground" : "text-muted-foreground"}`}>{h.name}</span>
                        {h.target && <p className="text-[10px] text-muted-foreground">{h.target}</p>}
                      </div>
                    </div>
                    <button onClick={() => deleteHabit.mutate(h.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
      <HabitDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </Layout>
  );
};

export default HabitTracker;
