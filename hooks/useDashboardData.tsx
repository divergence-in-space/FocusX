import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { format, subDays, startOfWeek, endOfWeek, differenceInMinutes, parseISO } from "date-fns";
import { DEMO_MODE } from "@/lib/demoMode";

const today = () => format(new Date(), "yyyy-MM-dd");

function calcDuration(start: string, end: string) {
  if (start.includes('T') && end.includes('T')) {
    return differenceInMinutes(new Date(end), new Date(start));
  }
  const base = "2000-01-01T";
  return differenceInMinutes(new Date(base + end), new Date(base + start));
}

// ─── Demo data generator ────────────────────────────────────
function getDemoData() {
  const fakeHabits = [
    { id: "h1", name: "Read 30 min", user_id: "demo", created_at: "" },
    { id: "h2", name: "Meditate", user_id: "demo", created_at: "" },
    { id: "h3", name: "Drink 3L water", user_id: "demo", created_at: "" },
    { id: "h4", name: "No junk food", user_id: "demo", created_at: "" },
    { id: "h5", name: "Journal", user_id: "demo", created_at: "" },
  ];
  const fakeHabitLogs = [
    { id: "l1", habit_id: "h1", user_id: "demo", date: today(), completed: true },
    { id: "l2", habit_id: "h2", user_id: "demo", date: today(), completed: true },
    { id: "l3", habit_id: "h3", user_id: "demo", date: today(), completed: true },
    { id: "l4", habit_id: "h4", user_id: "demo", date: today(), completed: false },
    { id: "l5", habit_id: "h5", user_id: "demo", date: today(), completed: false },
  ];

  const weeklyScores = [62, 78, 55, 85, 70, 91, 74]; // last 7 days
  const weeklyData = [];
  for (let i = 6; i >= 0; i--) {
    const d = subDays(new Date(), i);
    weeklyData.push({ day: format(d, "EEE"), score: weeklyScores[6 - i] });
  }

  return {
    loading: false,
    totalScore: 74,
    moodInfo: { emoji: "🙂", label: "Good" },
    breakdown: [
      { label: "Sleep", value: 5, color: "green" },
      { label: "Study", value: 18, color: "green" },
      { label: "Gym", value: 15, color: "green" },
      { label: "Mood", value: 0, color: "green" },
      { label: "Expenses", value: 2, color: "green" },
      { label: "Habits", value: 9, color: "green" },
    ],
    study: { sessions: 3, hours: "3.5", avgFocus: "8" },
    sleep: { hours: 7, minutes: 30, quality: 8, duration: 450 },
    workout: { type: "Push", duration: 65, calories: 420, count: 1 },
    expense: { total: 345, count: 4 },
    habits: {
      completed: 3,
      total: fakeHabits.length,
      list: fakeHabits,
      logs: fakeHabitLogs,
    },
    weeklyData,
    categoryBreakdown: [
      { name: "Study", value: 18 },
      { name: "Sleep", value: 15 },
      { name: "Gym", value: 15 },
      { name: "Habits", value: 9 },
      { name: "Expenses", value: 10 },
      { name: "Mood", value: 8 },
    ],
  };
}

export function useDashboardData() {
  const { user } = useAuth();
  const uid = user?.id;

  // Return fake data when demo mode is on
  if (DEMO_MODE) {
    return getDemoData();
  }

  const studyQuery = useQuery({
    queryKey: ["dashboard-study", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await supabase
        .from("study_sessions")
        .select("*")
        .eq("user_id", uid!)
        .eq("date", today());
      return data ?? [];
    },
  });

  const sleepQuery = useQuery({
    queryKey: ["dashboard-sleep", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await supabase
        .from("sleep_logs")
        .select("*")
        .eq("user_id", uid!)
        .order("date", { ascending: false })
        .limit(1);
      return data?.[0] ?? null;
    },
  });

  const workoutQuery = useQuery({
    queryKey: ["dashboard-workout", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", uid!)
        .eq("date", today());
      return data ?? [];
    },
  });

  const expenseQuery = useQuery({
    queryKey: ["dashboard-expense", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", uid!)
        .eq("date", today());
      return data ?? [];
    },
  });

  const habitsQuery = useQuery({
    queryKey: ["dashboard-habits", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data: habits } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", uid!);
      const { data: logs } = await supabase
        .from("habit_logs")
        .select("*")
        .eq("user_id", uid!)
        .eq("date", today());
      return { habits: habits ?? [], logs: logs ?? [] };
    },
  });

  const moodQuery = useQuery({
    queryKey: ["dashboard-mood", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await supabase
        .from("moods")
        .select("*")
        .eq("user_id", uid!)
        .eq("date", today())
        .limit(1);
      return data?.[0] ?? null;
    },
  });

  const weeklyQuery = useQuery({
    queryKey: ["dashboard-weekly", uid],
    enabled: !!uid,
    queryFn: async () => {
      const weekStart = format(subDays(new Date(), 6), "yyyy-MM-dd");
      const [study, sleep, workouts, expenses, habitLogs, moods] = await Promise.all([
        supabase.from("study_sessions").select("*").eq("user_id", uid!).gte("date", weekStart),
        supabase.from("sleep_logs").select("*").eq("user_id", uid!).gte("date", weekStart),
        supabase.from("workouts").select("*").eq("user_id", uid!).gte("date", weekStart),
        supabase.from("expenses").select("*").eq("user_id", uid!).gte("date", weekStart),
        supabase.from("habit_logs").select("*").eq("user_id", uid!).gte("date", weekStart),
        supabase.from("moods").select("*").eq("user_id", uid!).gte("date", weekStart),
      ]);
      return {
        study: study.data ?? [],
        sleep: sleep.data ?? [],
        workouts: workouts.data ?? [],
        expenses: expenses.data ?? [],
        habitLogs: habitLogs.data ?? [],
        moods: moods.data ?? [],
      };
    },
  });

  // Derived metrics
  const studySessions = studyQuery.data ?? [];
  const todayStudyMin = studySessions.reduce((sum, s) => sum + calcDuration(s.start_time, s.end_time), 0);
  const todayStudyHours = (todayStudyMin / 60).toFixed(1);
  const avgFocus = studySessions.length
    ? (studySessions.reduce((s, x) => s + x.focus_score, 0) / studySessions.length).toFixed(0)
    : "0";

  const lastSleep = sleepQuery.data;
  const sleepMin = lastSleep ? calcDuration(lastSleep.sleep_time, lastSleep.wake_time) : 0;
  const sleepDuration = sleepMin < 0 ? sleepMin + 1440 : sleepMin; // handle overnight
  const sleepH = Math.floor(sleepDuration / 60);
  const sleepM = sleepDuration % 60;

  const todayWorkouts = workoutQuery.data ?? [];
  const totalWorkoutDur = todayWorkouts.reduce((s, w) => s + w.duration, 0);
  const totalCalories = todayWorkouts.reduce((s, w) => s + (w.calories ?? 0), 0);
  const lastWorkoutType = todayWorkouts.length ? todayWorkouts[todayWorkouts.length - 1].workout_type : "—";

  const todayExpenses = expenseQuery.data ?? [];
  const totalSpent = todayExpenses.reduce((s, e) => s + Number(e.amount), 0);

  const { habits: allHabits, logs: todayLogs } = habitsQuery.data ?? { habits: [], logs: [] };
  const completedHabits = todayLogs.filter((l) => l.completed).length;

  const todayMood = moodQuery.data;
  const moodMap: Record<string, { emoji: string; label: string }> = {
    great: { emoji: "😄", label: "Great" },
    good: { emoji: "🙂", label: "Good" },
    okay: { emoji: "😐", label: "Okay" },
    bad: { emoji: "😞", label: "Bad" },
    terrible: { emoji: "😢", label: "Terrible" },
  };
  const moodInfo = todayMood ? moodMap[todayMood.mood_level] ?? { emoji: "🙂", label: todayMood.mood_level } : { emoji: "—", label: "Not logged" };

  // PRD-weighted score: Study 25, Sleep 15, Gym 15, Habits 15, Mood 10, Expenses 10 (Diet 10 TBD)
  const studyScore = (() => {
    if (todayStudyMin >= 300) return 25; // 5h+ = full
    if (todayStudyMin >= 240) return 22;
    if (todayStudyMin >= 180) return 18;
    if (todayStudyMin >= 120) return 14;
    if (todayStudyMin >= 60) return 10;
    if (todayStudyMin > 0) return 5;
    return 0;
  })();
  const sleepScore = (() => {
    if (!lastSleep) return 0;
    if (sleepDuration >= 420 && sleepDuration <= 540) return 15; // 7-9h optimal
    if (sleepDuration >= 360) return 12;
    if (sleepDuration >= 300) return 8;
    if (sleepDuration > 0) return 4;
    return 0;
  })();
  const gymScore = (() => {
    if (todayWorkouts.length === 0) return 0;
    if (totalWorkoutDur >= 60) return 15;
    if (totalWorkoutDur >= 30) return 12;
    return 8;
  })();
  const habitScore = allHabits.length
    ? Math.round((completedHabits / allHabits.length) * 15)
    : 0;
  const moodScore = (() => {
    if (!todayMood) return 0;
    const m = todayMood.mood_level;
    if (m === "great") return 10;
    if (m === "good") return 8;
    if (m === "okay") return 5;
    if (m === "bad") return 2;
    return 0;
  })();
  const expenseScore = (() => {
    if (totalSpent === 0 && todayExpenses.length === 0) return 0; // not logged
    if (totalSpent <= 300) return 10;
    if (totalSpent <= 500) return 8;
    if (totalSpent <= 800) return 5;
    return 2;
  })();
  const totalScore = Math.min(studyScore + sleepScore + gymScore + habitScore + moodScore + expenseScore, 100);

  const breakdown = [
    { label: "Sleep", value: sleepScore - 10, color: sleepScore >= 10 ? "green" : "red" },
    { label: "Study", value: studyScore, color: "green" },
    { label: "Gym", value: gymScore, color: gymScore > 0 ? "green" : "red" },
    { label: "Mood", value: moodScore - 8, color: moodScore >= 8 ? "green" : "red" },
    { label: "Expenses", value: expenseScore - 8, color: expenseScore >= 8 ? "green" : "red" },
    { label: "Habits", value: habitScore, color: habitScore > 0 ? "green" : "red" },
  ];

  // Weekly chart data
  const weeklyData = (() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const dateStr = format(d, "yyyy-MM-dd");
      const dayLabel = format(d, "EEE");
      const w = weeklyQuery.data;
      if (!w) { days.push({ day: dayLabel, score: 0 }); continue; }
      const dStudy = w.study.filter(s => s.date === dateStr);
      const dSleep = w.sleep.filter(s => s.date === dateStr);
      const dWorkouts = w.workouts.filter(s => s.date === dateStr);
      const dExpenses = w.expenses.filter(s => s.date === dateStr);
      const dHabitLogs = w.habitLogs.filter(s => s.date === dateStr);
      const dMoods = w.moods.filter(s => s.date === dateStr);
      
      let sc = 0;
      sc += Math.min(dStudy.length * 8, 20);
      if (dSleep.length > 0) {
        const sl = dSleep[0];
        const dur = calcDuration(sl.sleep_time, sl.wake_time);
        const adjDur = dur < 0 ? dur + 1440 : dur;
        sc += Math.min(Math.round((adjDur / 480) * 20), 20);
      }
      sc += dWorkouts.length > 0 ? 15 : 0;
      sc += dHabitLogs.filter(l => l.completed).length > 0 ? 10 : 0;
      sc += dExpenses.reduce((s, e) => s + Number(e.amount), 0) <= 500 ? 15 : 5;
      sc += dMoods.length > 0 ? 10 : 0;
      days.push({ day: dayLabel, score: Math.min(sc, 100) });
    }
    return days;
  })();

  const categoryBreakdown = [
    { name: "Study", value: studyScore },
    { name: "Sleep", value: sleepScore },
    { name: "Gym", value: gymScore },
    { name: "Habits", value: habitScore },
    { name: "Expenses", value: expenseScore },
    { name: "Mood", value: moodScore },
  ];

  return {
    loading: studyQuery.isLoading || sleepQuery.isLoading,
    totalScore,
    moodInfo,
    breakdown,
    study: { sessions: studySessions.length, hours: todayStudyHours, avgFocus },
    sleep: { hours: sleepH, minutes: sleepM, quality: lastSleep?.quality ?? 0, duration: sleepDuration },
    workout: { type: lastWorkoutType, duration: totalWorkoutDur, calories: totalCalories, count: todayWorkouts.length },
    expense: { total: totalSpent, count: todayExpenses.length },
    habits: { completed: completedHabits, total: allHabits.length, list: allHabits, logs: todayLogs },
    weeklyData,
    categoryBreakdown,
  };
}
