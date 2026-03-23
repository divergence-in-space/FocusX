import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { Wallet, Plus, TrendingDown, PieChart } from "lucide-react";
import { useState } from "react";
import { ExpenseDialog } from "@/components/dialogs/ExpenseDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const ExpenseTracker = () => {
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: expenses = [] } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const { data } = await supabase
        .from("expenses")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      return data || [];
    },
    enabled: !!user,
  });

  const today = new Date().toISOString().split("T")[0];
  const todayExpenses = expenses.filter((e: any) => e.date === today);
  const todayTotal = todayExpenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0);
  const totalAll = expenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="main-title rpg-title rpg-glow rpg-premium-spacing">Expense Tracker</h1>
            <p className="text-sm text-muted-foreground mt-1">Know where your money goes</p>
          </div>
          <button onClick={() => setDialogOpen(true)} className="flex items-center gap-2 gradient-score rounded-lg px-4 py-2.5 text-sm font-semibold text-primary-foreground">
            <Plus className="h-4 w-4" /> Add Expense
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Wallet, label: "Today", value: `₹${todayTotal}`, sub: `${todayExpenses.length} entries` },
            { icon: TrendingDown, label: "Total Logged", value: `₹${totalAll}`, sub: `${expenses.length} expenses` },
            { icon: PieChart, label: "Budget", value: "₹500/day", sub: todayTotal > 500 ? "Over budget!" : "On track" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="stat-card">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-mono font-bold text-foreground">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.sub}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card-elevated p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Recent Expenses</h3>
          {expenses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No expenses logged yet.</p>
          ) : (
            <div className="space-y-2">
              {expenses.slice(0, 10).map((e: any) => (
                <div key={e.id} className="flex items-center justify-between rounded-lg bg-muted/30 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{e.category}</p>
                    <p className="text-xs text-muted-foreground">{e.note || "No note"} • {e.date}</p>
                  </div>
                  <p className="text-sm font-mono font-semibold text-accent">₹{e.amount}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
      <ExpenseDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </Layout>
  );
};

export default ExpenseTracker;
