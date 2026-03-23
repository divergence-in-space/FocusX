import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";

interface HabitCheckListProps {
  habits: { id: string; name: string }[];
  logs: { habit_id: string; completed: boolean; id: string }[];
}

export function HabitCheckList({ habits, logs }: HabitCheckListProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const today = format(new Date(), "yyyy-MM-dd");

  const toggleHabit = async (habitId: string) => {
    if (!user) return;
    const existing = logs.find((l) => l.habit_id === habitId);
    if (existing) {
      await supabase
        .from("habit_logs")
        .update({ completed: !existing.completed })
        .eq("id", existing.id);
    } else {
      await supabase.from("habit_logs").insert({
        habit_id: habitId,
        user_id: user.id,
        date: today,
        completed: true,
      });
    }
    queryClient.invalidateQueries({ queryKey: ["dashboard-habits"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-weekly"] });
    toast.success("Habit updated!");
  };

  const completedCount = logs.filter((l) => l.completed).length;

  if (habits.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="card-elevated p-5"
      >
        <h3 className="text-sm font-semibold text-foreground mb-4">Today's Habits</h3>
        <p className="text-sm text-muted-foreground">No habits yet. Add some from the Habits page!</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="card-elevated p-6 relative overflow-hidden group/habits border-glow-orange"
    >
      {/* Warm Cozy Lighting Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-pink-500/5 to-transparent pointer-events-none transition-opacity duration-500 group-hover/habits:opacity-70" />
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500/20 blur-[50px] rounded-full pointer-events-none" />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
          <span className="text-2xl drop-shadow-[0_0_10px_rgba(251,146,60,0.8)] origin-bottom animate-bounce" style={{ animationDuration: '2s' }}>🐱</span>
          Daily Quests
        </h3>
        <span className="text-xs font-mono font-black text-orange-400 bg-orange-500/10 px-3 py-1.5 rounded-full border border-orange-500/30 shadow-[0_0_10px_rgba(251,146,60,0.2)]">
          {completedCount} / {habits.length}
        </span>
      </div>
      <div className="space-y-3 relative z-10">
        {habits.map((habit) => {
          const log = logs.find((l) => l.habit_id === habit.id);
          const done = log?.completed ?? false;
          return (
            <button
              key={habit.id}
              onClick={() => toggleHabit(habit.id)}
              className={`flex items-center gap-4 rounded-xl px-4 py-3 transition-all duration-300 w-full text-left border hover:scale-[1.02] active:scale-95 group/item ${
                done 
                  ? "bg-gradient-to-r from-orange-500/20 to-pink-500/10 border-orange-500/40 shadow-[0_0_15px_rgba(251,146,60,0.2)]" 
                  : "bg-black/40 border-white/10 hover:border-white/30 hover:bg-white/5"
              }`}
            >
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover/item:scale-110 ${
                  done ? "bg-gradient-to-br from-orange-400 to-pink-500 shadow-[0_0_10px_rgba(251,146,60,0.6)]" : "bg-black/60 border border-white/20"
                }`}
              >
                {done ? (
                  <Check className="h-4 w-4 text-white drop-shadow-md" />
                ) : (
                  <X className="h-3 w-3 text-white/20" />
                )}
              </div>
              <span className={`text-sm font-semibold transition-all duration-300 ${done ? "text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)] line-through decoration-orange-500/50" : "text-white/60 group-hover/item:text-white/90"}`}>
                {habit.name}
              </span>
              {done && <span className="ml-auto text-sm animate-pulse drop-shadow-[0_0_5px_rgba(251,146,60,0.8)]">✨</span>}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
