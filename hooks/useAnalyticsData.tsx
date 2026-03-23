import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { format, subDays, subMonths, differenceInMinutes } from "date-fns";

function calcDuration(start: string, end: string) {
  const base = "2000-01-01T";
  const dur = differenceInMinutes(new Date(base + end), new Date(base + start));
  return dur < 0 ? dur + 1440 : dur;
}

function calcDayScore(
  study: any[], sleep: any[], workouts: any[],
  habitLogs: any[], totalHabits: number,
  moods: any[], expenses: any[]
) {
  // Study (25)
  const studyMin = study.reduce((s, x) => s + calcDuration(x.start_time, x.end_time), 0);
  const studyScore = studyMin >= 300 ? 25 : studyMin >= 240 ? 22 : studyMin >= 180 ? 18 : studyMin >= 120 ? 14 : studyMin >= 60 ? 10 : studyMin > 0 ? 5 : 0;

  // Sleep (15)
  let sleepScore = 0;
  if (sleep.length > 0) {
    const dur = calcDuration(sleep[0].sleep_time, sleep[0].wake_time);
    sleepScore = dur >= 420 && dur <= 540 ? 15 : dur >= 360 ? 12 : dur >= 300 ? 8 : dur > 0 ? 4 : 0;
  }

  // Gym (15)
  const workoutDur = workouts.reduce((s, w) => s + w.duration, 0);
  const gymScore = workouts.length === 0 ? 0 : workoutDur >= 60 ? 15 : workoutDur >= 30 ? 12 : 8;

  // Habits (15)
  const completed = habitLogs.filter((l: any) => l.completed).length;
  const habitScore = totalHabits > 0 ? Math.round((completed / totalHabits) * 15) : 0;

  // Mood (10)
  let moodScore = 0;
  if (moods.length > 0) {
    const m = moods[0].mood_level;
    moodScore = m === "great" ? 10 : m === "good" ? 8 : m === "okay" ? 5 : m === "bad" ? 2 : 0;
  }

  // Expenses (10)
  const totalSpent = expenses.reduce((s: number, e: any) => s + Number(e.amount), 0);
  const expenseScore = expenses.length === 0 ? 0 : totalSpent <= 300 ? 10 : totalSpent <= 500 ? 8 : totalSpent <= 800 ? 5 : 2;

  return {
    total: Math.min(studyScore + sleepScore + gymScore + habitScore + moodScore + expenseScore, 100),
    study: studyScore,
    sleep: sleepScore,
    gym: gymScore,
    habits: habitScore,
    mood: moodScore,
    expenses: expenseScore,
    studyMin,
    sleepDur: sleep.length > 0 ? calcDuration(sleep[0].sleep_time, sleep[0].wake_time) : 0,
    workoutDur,
    totalSpent,
    completedHabits: completed,
    totalHabits,
    moodLevel: moods.length > 0 ? moods[0].mood_level : null,
  };
}

export function useAnalyticsData() {
  const { user } = useAuth();
  const uid = user?.id;

  // Fetch last 30 days of data for monthly view
  const analyticsQuery = useQuery({
    queryKey: ["analytics-data", uid],
    enabled: !!uid,
    queryFn: async () => {
      const monthStart = format(subDays(new Date(), 29), "yyyy-MM-dd");
      const [study, sleep, workouts, expenses, habitLogs, moods, habits] = await Promise.all([
        supabase.from("study_sessions").select("*").eq("user_id", uid!).gte("date", monthStart),
        supabase.from("sleep_logs").select("*").eq("user_id", uid!).gte("date", monthStart),
        supabase.from("workouts").select("*").eq("user_id", uid!).gte("date", monthStart),
        supabase.from("expenses").select("*").eq("user_id", uid!).gte("date", monthStart),
        supabase.from("habit_logs").select("*").eq("user_id", uid!).gte("date", monthStart),
        supabase.from("moods").select("*").eq("user_id", uid!).gte("date", monthStart),
        supabase.from("habits").select("*").eq("user_id", uid!),
      ]);
      return {
        study: study.data ?? [],
        sleep: sleep.data ?? [],
        workouts: workouts.data ?? [],
        expenses: expenses.data ?? [],
        habitLogs: habitLogs.data ?? [],
        moods: moods.data ?? [],
        totalHabits: (habits.data ?? []).length,
      };
    },
  });

  const raw = analyticsQuery.data;

  // Build daily scores for last 30 days
  const dailyScores = (() => {
    if (!raw) return [];
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const dateStr = format(d, "yyyy-MM-dd");
      const dayLabel = format(d, "MMM d");
      const shortDay = format(d, "EEE");

      const dayStudy = raw.study.filter((s: any) => s.date === dateStr);
      const daySleep = raw.sleep.filter((s: any) => s.date === dateStr);
      const dayWorkouts = raw.workouts.filter((s: any) => s.date === dateStr);
      const dayExpenses = raw.expenses.filter((s: any) => s.date === dateStr);
      const dayHabitLogs = raw.habitLogs.filter((s: any) => s.date === dateStr);
      const dayMoods = raw.moods.filter((s: any) => s.date === dateStr);

      const score = calcDayScore(dayStudy, daySleep, dayWorkouts, dayHabitLogs, raw.totalHabits, dayMoods, dayExpenses);
      days.push({ date: dateStr, label: dayLabel, day: shortDay, ...score });
    }
    return days;
  })();

  // Weekly summary (last 7 days)
  const weeklyScores = dailyScores.slice(-7);
  const weeklyAvg = weeklyScores.length > 0
    ? Math.round(weeklyScores.reduce((s, d) => s + d.total, 0) / weeklyScores.length * 10) / 10
    : 0;

  // Previous week for comparison
  const prevWeekScores = dailyScores.slice(-14, -7);
  const prevWeekAvg = prevWeekScores.length > 0
    ? Math.round(prevWeekScores.reduce((s, d) => s + d.total, 0) / prevWeekScores.length * 10) / 10
    : 0;
  const weeklyDelta = Math.round((weeklyAvg - prevWeekAvg) * 10) / 10;

  // Monthly average
  const monthlyAvg = dailyScores.length > 0
    ? Math.round(dailyScores.reduce((s, d) => s + d.total, 0) / dailyScores.length * 10) / 10
    : 0;

  // Category averages for radar
  const calcCatAvg = (key: string, days: typeof dailyScores) => {
    if (days.length === 0) return 0;
    return Math.round(days.reduce((s, d) => s + (d as any)[key], 0) / days.length);
  };

  const weeklyRadar = [
    { category: "Study", value: calcCatAvg("study", weeklyScores), max: 25 },
    { category: "Sleep", value: calcCatAvg("sleep", weeklyScores), max: 15 },
    { category: "Gym", value: calcCatAvg("gym", weeklyScores), max: 15 },
    { category: "Habits", value: calcCatAvg("habits", weeklyScores), max: 15 },
    { category: "Mood", value: calcCatAvg("mood", weeklyScores), max: 10 },
    { category: "Expenses", value: calcCatAvg("expenses", weeklyScores), max: 10 },
  ];

  // Insights
  const insights: { text: string; type: "success" | "warning" }[] = [];
  if (weeklyScores.length >= 7) {
    const thisWeekSleep = calcCatAvg("sleep", weeklyScores);
    const prevWeekSleep = calcCatAvg("sleep", prevWeekScores);
    if (prevWeekSleep > 0 && thisWeekSleep < prevWeekSleep * 0.8) {
      insights.push({ text: `Sleep score dropped ${Math.round((1 - thisWeekSleep / prevWeekSleep) * 100)}% this week`, type: "warning" });
    }
    const thisWeekStudy = calcCatAvg("study", weeklyScores);
    const prevWeekStudy = calcCatAvg("study", prevWeekScores);
    if (prevWeekStudy > 0 && thisWeekStudy > prevWeekStudy * 1.2) {
      insights.push({ text: `Study improved ${Math.round((thisWeekStudy / prevWeekStudy - 1) * 100)}% — great consistency!`, type: "success" });
    }
    const gymDays = weeklyScores.filter(d => d.gym > 0).length;
    if (gymDays >= 4) {
      insights.push({ text: `${gymDays}-day gym streak this week — keep going!`, type: "success" });
    } else if (gymDays <= 1) {
      insights.push({ text: `Only ${gymDays} gym day this week — try to move more`, type: "warning" });
    }
    const overBudgetDays = weeklyScores.filter(d => d.expenses < 8 && d.expenses > 0).length;
    if (overBudgetDays >= 3) {
      insights.push({ text: `Expenses exceeded budget ${overBudgetDays} out of 7 days`, type: "warning" });
    }
    const avgHabit = calcCatAvg("habits", weeklyScores);
    if (avgHabit >= 12) {
      insights.push({ text: `Habit completion is strong at ${Math.round((avgHabit / 15) * 100)}%`, type: "success" });
    }
  }
  if (insights.length === 0) {
    insights.push({ text: "Keep logging data to unlock personalized insights!", type: "success" });
  }

  // Best/worst days
  const bestDay = weeklyScores.length > 0 ? weeklyScores.reduce((a, b) => a.total > b.total ? a : b) : null;
  const worstDay = weeklyScores.length > 0 ? weeklyScores.reduce((a, b) => a.total < b.total ? a : b) : null;

  return {
    loading: analyticsQuery.isLoading,
    dailyScores,
    weeklyScores,
    weeklyAvg,
    weeklyDelta,
    monthlyAvg,
    weeklyRadar,
    insights,
    bestDay,
    worstDay,
  };
}
