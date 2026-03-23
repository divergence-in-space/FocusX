import { motion } from "framer-motion";
import { Plus, BookOpen, Wallet, Moon, Dumbbell, CheckSquare, Smile } from "lucide-react";
import { useState } from "react";
import { StudySessionDialog } from "@/components/dialogs/StudySessionDialog";
import { ExpenseDialog } from "@/components/dialogs/ExpenseDialog";
import { SleepDialog } from "@/components/dialogs/SleepDialog";
import { WorkoutDialog } from "@/components/dialogs/WorkoutDialog";
import { HabitDialog } from "@/components/dialogs/HabitDialog";
import { MoodDialog } from "@/components/dialogs/MoodDialog";

const quickActions = [
  { label: "Study", icon: BookOpen, color: "bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]", dialog: "study" },
  { label: "Expense", icon: Wallet, color: "bg-gradient-to-br from-pink-500/20 to-rose-500/20 text-pink-400 border-pink-500/30 hover:shadow-[0_0_20px_rgba(236,72,153,0.4)]", dialog: "expense" },
  { label: "Sleep", icon: Moon, color: "bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 border-indigo-500/30 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]", dialog: "sleep" },
  { label: "Workout", icon: Dumbbell, color: "bg-gradient-to-br from-orange-500/20 to-red-500/20 text-orange-400 border-orange-500/30 hover:shadow-[0_0_20px_rgba(249,115,22,0.4)]", dialog: "workout" },
  { label: "Habit", icon: CheckSquare, color: "bg-gradient-to-br from-emerald-500/20 to-green-500/20 text-emerald-400 border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]", dialog: "habit" },
  { label: "Mood", icon: Smile, color: "bg-gradient-to-br from-yellow-500/20 to-amber-500/20 text-yellow-400 border-yellow-500/30 hover:shadow-[0_0_20px_rgba(234,179,8,0.4)]", dialog: "mood" },
];

export function QuickActions() {
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="card-elevated p-5 relative overflow-hidden group/quick"
      >
        {/* Animated Background GIF */}
        <div className="absolute inset-0 z-0 pointer-events-none transition-transform duration-1000 group-hover/quick:scale-110">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a] via-[#0a0a1a]/40 to-[#0a0a1a]/80 z-[1]" />
          <img 
            src="https://www.bing.com/th/id/OGC.484efdae9dda2be9aa7ada6137980674?o=7&pid=1.7&rm=3&rurl=https%3a%2f%2fgifdb.com%2fimages%2fhigh%2fanime-pond-rain-44plbyt6fum5qb3b.gif&ehk=XRzwcf%2fnaskPP6oIxFRAYScxBGtZ28Sl9GcTYLE1pHM%3d"
            alt="Rainy Pond"
            className="w-full h-full object-cover opacity-60 grayscale-[0.2]"
          />
        </div>

        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2 relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
          <Plus className="h-4 w-4 text-cyan-400" />
          Quick Log
        </h3>
        <div className="grid grid-cols-3 gap-3 relative z-10">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => setOpenDialog(action.dialog)}
              className={`flex flex-col items-center gap-2 rounded-xl p-3 transition-all duration-300 hover:scale-105 active:scale-95 ${action.color} border backdrop-blur-md group hover:-translate-y-1`}
            >
              <action.icon className="h-6 w-6 drop-shadow-[0_0_8px_currentColor] transition-transform duration-300 group-hover:scale-110" />
              <span className="text-[11px] font-bold uppercase tracking-wider opacity-90 drop-shadow-[0_0_5px_currentColor]">{action.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      <StudySessionDialog open={openDialog === "study"} onOpenChange={(open) => !open && setOpenDialog(null)} />
      <ExpenseDialog open={openDialog === "expense"} onOpenChange={(open) => !open && setOpenDialog(null)} />
      <SleepDialog open={openDialog === "sleep"} onOpenChange={(open) => !open && setOpenDialog(null)} />
      <WorkoutDialog open={openDialog === "workout"} onOpenChange={(open) => !open && setOpenDialog(null)} />
      <HabitDialog open={openDialog === "habit"} onOpenChange={(open) => !open && setOpenDialog(null)} />
      <MoodDialog open={openDialog === "mood"} onOpenChange={(open) => !open && setOpenDialog(null)} />
    </>
  );
}
