import { Layout } from "@/components/Layout";
import { ScoreCard } from "@/components/dashboard/ScoreCard";
import { CategoryCard } from "@/components/dashboard/CategoryCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { WeeklyChart, CategoryBreakdownChart } from "@/components/dashboard/Charts";
import { HabitCheckList } from "@/components/dashboard/HabitCheckList";
import { AICoachPanel } from "@/components/dashboard/AICoachPanel";
import { BookOpen, Moon, Dumbbell, Wallet, CheckSquare, Smile, Flame } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useStreakData } from "@/hooks/useStreakData";
import { motion } from "framer-motion";

const Index = () => {
  const data = useDashboardData();
  const { data: streaks } = useStreakData();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ScoreCard
              score={data.totalScore}
              mood={data.moodInfo.label}
              moodEmoji={data.moodInfo.emoji}
              breakdown={data.breakdown}
            />
          </div>
          <QuickActions />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CategoryCard
            icon={BookOpen}
            title="Study"
            metrics={[
              { label: "Sessions", value: String(data.study.sessions) },
              { label: "Hours", value: `${data.study.hours}h` },
              { label: "Focus Avg", value: `${data.study.avgFocus}/10` },
            ]}
            progress={Math.min((parseFloat(data.study.hours) / 5) * 100, 100)}
            goal="Goal: 5h"
            delay={0.1}
            characterImg="/gojo.png"
            dialogue="Nah, I'd win. Try beating my focus."
            auraClass="hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] border-glow-cyan"
          />
          <CategoryCard
            icon={Moon}
            title="Sleep"
            metrics={[
              { label: "Last Night", value: data.sleep.hours ? `${data.sleep.hours}h ${data.sleep.minutes}m` : "—" },
              { label: "Quality", value: `${data.sleep.quality}/10` },
              { label: "Duration", value: data.sleep.duration ? `${Math.round((data.sleep.duration / 420) * 100)}%` : "—" },
            ]}
            progress={Math.min(Math.round((data.sleep.duration / 420) * 100), 100)}
            goal="Goal: 7h+"
            warning={data.sleep.duration > 0 && data.sleep.duration < 420 ? `Below target by ${420 - data.sleep.duration}min` : undefined}
            delay={0.15}
            characterImg="/sleep.png"
            dialogue="Rest now… tomorrow you rise stronger."
            auraClass="hover:shadow-[0_0_30px_rgba(180,120,255,0.3)] border-glow-purple"
          />
          <CategoryCard
            icon={Dumbbell}
            title="Gym"
            metrics={[
              { label: "Workout", value: data.workout.type },
              { label: "Duration", value: data.workout.duration ? `${data.workout.duration}min` : "—" },
              { label: "Calories", value: String(data.workout.calories || "—") },
            ]}
            progress={data.workout.count > 0 ? 100 : 0}
            delay={0.2}
            characterImg="/tanjiro.png"
            dialogue="Stay strong. Every step counts."
            auraClass="hover:shadow-[0_0_30px_rgba(251,146,60,0.3)] border-glow-orange"
          />
          <CategoryCard
            icon={Wallet}
            title="Expenses"
            metrics={[
              { label: "Today", value: `₹${data.expense.total}` },
              { label: "Budget", value: "₹500" },
              { label: "Entries", value: String(data.expense.count) },
            ]}
            progress={Math.round((data.expense.total / 500) * 100)}
            goal="Budget: ₹500"
            warning={data.expense.total > 500 ? `Over budget by ₹${data.expense.total - 500}` : undefined}
            delay={0.25}
            characterImg="https://media.tenor.com/gT81tE4x9mQAAAAC/rengoku-flame-pillar.gif"
            dialogue="Set your heart ablaze! Protect your wealth!"
            auraClass="hover:shadow-[0_0_30px_rgba(234,179,8,0.3)] border-glow-yellow"
          />
          <CategoryCard
            icon={Smile}
            title="Mood"
            metrics={[
              { label: "Today", value: `${data.moodInfo.emoji} ${data.moodInfo.label}` },
            ]}
            progress={data.moodInfo.label !== "Not logged" ? 100 : 0}
            delay={0.3}
            characterImg="/nezuko.webp"
            dialogue="Hmm... mm-hmm!"
            auraClass="hover:shadow-[0_0_30px_rgba(244,114,182,0.3)] border-glow-pink"
          />
          <CategoryCard
            icon={CheckSquare}
            title="Habits"
            metrics={[
              { label: "Completed", value: `${data.habits.completed}/${data.habits.total}` },
              { label: "Rate", value: data.habits.total ? `${Math.round((data.habits.completed / data.habits.total) * 100)}%` : "0%" },
            ]}
            progress={data.habits.total ? Math.round((data.habits.completed / data.habits.total) * 100) : 0}
            delay={0.35}
            characterImg="https://www.bing.com/th/id/OGC.9617b79b2c3feeda825ddc7ea81031be?o=7&pid=1.7&rm=3&rurl=https%3a%2f%2fi.makeagif.com%2fmedia%2f12-28-2020%2fiO077_.gif&ehk=XMLkeLJV2P7%2fJ1bgQA2FcqLj6AwMT4BVoZKE6KTaA3A%3d"
            dialogue="Consistency is your greatest weapon."
            auraClass="hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] border-glow-green"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WeeklyChart data={data.weeklyData} />
          <CategoryBreakdownChart data={data.categoryBreakdown} />
        </div>

        {/* Streaks */}
        {/* Streaks & Gamification Rewards */}
        {streaks && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card-elevated p-5 relative overflow-hidden group">
            {/* Background glowing aura for chest */}
            <div className="absolute -right-10 -top-10 w-48 h-48 bg-yellow-500/20 rounded-full blur-[40px] pointer-events-none transition-transform duration-1000 group-hover:scale-110" />
            
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
                <Flame className="h-5 w-5 text-accent drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]" />
                Streaks & Rewards
              </h3>
              <button className="text-[10px] uppercase tracking-widest font-black bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500 hover:text-black transition-all duration-300 px-4 py-2 rounded-full border border-yellow-500/40 shadow-[0_0_15px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.6)] hover:scale-105 active:scale-95 flex items-center gap-2">
                <span>Claim Reward</span>
                <span className="text-sm">🎁</span>
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-4 relative z-10">
              {[
                { label: "Study", icon: BookOpen, color: "from-blue-500/20 to-cyan-500/5", glow: "shadow-[0_0_20px_rgba(34,211,238,0.15)] hover:shadow-[0_0_30px_rgba(34,211,238,0.3)]", border: "border-cyan-500/30 text-cyan-400", ...streaks.study },
                { label: "Gym", icon: Dumbbell, color: "from-orange-500/20 to-red-500/5", glow: "shadow-[0_0_20px_rgba(249,115,22,0.15)] hover:shadow-[0_0_30px_rgba(249,115,22,0.3)]", border: "border-orange-500/30 text-orange-400", ...streaks.gym },
                { label: "Habits", icon: Flame, color: "from-green-500/20 to-emerald-500/5", glow: "shadow-[0_0_20px_rgba(34,197,94,0.15)] hover:shadow-[0_0_30px_rgba(34,197,94,0.3)]", border: "border-green-500/30 text-green-400", ...streaks.habits },
              ].map(s => (
                <div key={s.label} className={`flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-b ${s.color} border ${s.border} ${s.glow} transition-all duration-300 hover:scale-105 group/badge`}>
                  <div className={`p-2.5 rounded-full bg-black/40 mb-3 ${s.border.split(' ')[1]} transition-transform duration-500 group-hover/badge:rotate-12`}>
                    <s.icon className="w-5 h-5 drop-shadow-[0_0_8px_currentColor]" />
                  </div>
                  <p className={`text-3xl font-mono font-black ${s.border.split(' ')[1]} drop-shadow-[0_0_10px_currentColor]`}>{s.current}</p>
                  <p className="text-[10px] uppercase font-bold text-white tracking-widest mt-1 opacity-80">{s.label}</p>
                  <div className="mt-2 text-[9px] bg-black/50 text-white/50 px-2 py-0.5 rounded-full border border-white/10 font-medium">Best: {s.longest}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HabitCheckList habits={data.habits.list} logs={data.habits.logs} />
          <AICoachPanel score={data.totalScore} />
        </div>
      </div>
    </Layout>
  );
};

export default Index;
