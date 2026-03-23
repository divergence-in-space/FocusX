import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { format, subDays, differenceInCalendarDays, parseISO } from "date-fns";
import { DEMO_MODE } from "@/lib/demoMode";

export function useStreakData() {
  const { user } = useAuth();
  const uid = user?.id;

  // Return fake streak data when demo mode is on
  if (DEMO_MODE) {
    return {
      data: {
        study: { current: 5, longest: 12 },
        gym: { current: 3, longest: 8 },
        habits: { current: 2, longest: 6 },
      },
      isLoading: false,
      error: null,
    } as any;
  }

  return useQuery({
    queryKey: ["streaks", uid],
    enabled: !!uid,
    queryFn: async () => {
      const sixtyDaysAgo = format(subDays(new Date(), 60), "yyyy-MM-dd");

      const [studyRes, workoutRes, habitRes, habitsRes] = await Promise.all([
        supabase.from("study_sessions").select("date").eq("user_id", uid!).gte("date", sixtyDaysAgo),
        supabase.from("workouts").select("date").eq("user_id", uid!).gte("date", sixtyDaysAgo),
        supabase.from("habit_logs").select("date, completed").eq("user_id", uid!).eq("completed", true).gte("date", sixtyDaysAgo),
        supabase.from("habits").select("id").eq("user_id", uid!),
      ]);

      const calcStreak = (dates: string[]) => {
        const unique = [...new Set(dates)].sort().reverse();
        if (unique.length === 0) return { current: 0, longest: 0 };
        
        let current = 0;
        const today = format(new Date(), "yyyy-MM-dd");
        const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
        
        // Check if streak includes today or yesterday
        if (unique[0] === today || unique[0] === yesterday) {
          current = 1;
          for (let i = 1; i < unique.length; i++) {
            const diff = differenceInCalendarDays(parseISO(unique[i - 1]), parseISO(unique[i]));
            if (diff === 1) current++;
            else break;
          }
        }

        // Longest streak
        let longest = 1, streak = 1;
        for (let i = 1; i < unique.length; i++) {
          const diff = differenceInCalendarDays(parseISO(unique[i - 1]), parseISO(unique[i]));
          if (diff === 1) { streak++; longest = Math.max(longest, streak); }
          else streak = 1;
        }
        longest = Math.max(longest, unique.length > 0 ? 1 : 0);

        return { current, longest };
      };

      const studyDates = (studyRes.data ?? []).map(s => s.date);
      const gymDates = (workoutRes.data ?? []).map(w => w.date);
      const habitDates = (habitRes.data ?? []).map(h => h.date);
      const totalHabits = (habitsRes.data ?? []).length;

      // For habits, only count days where ALL habits were completed
      const habitDateCounts: Record<string, number> = {};
      habitDates.forEach(d => { habitDateCounts[d] = (habitDateCounts[d] || 0) + 1; });
      const fullHabitDays = totalHabits > 0
        ? Object.entries(habitDateCounts).filter(([, count]) => count >= totalHabits).map(([date]) => date)
        : [];

      return {
        study: calcStreak(studyDates),
        gym: calcStreak(gymDates),
        habits: calcStreak(fullHabitDays),
      };
    },
  });
}
