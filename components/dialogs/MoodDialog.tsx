import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const moods = [
  { emoji: "😀", label: "Great" },
  { emoji: "🙂", label: "Good" },
  { emoji: "😐", label: "Neutral" },
  { emoji: "☹️", label: "Bad" },
  { emoji: "😞", label: "Very Bad" },
];

export function MoodDialog({ open, onOpenChange }: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) { toast.error("Please select your mood"); return; }
    if (!user) { toast.error("Please sign in"); return; }

    setLoading(true);
    const reasons = reason ? reason.split(",").map(r => r.trim()).filter(Boolean) : [];
    const { error } = await supabase.from("moods").insert({
      user_id: user.id,
      mood_level: selected,
      reasons: reasons.length > 0 ? reasons : null,
      date: format(new Date(), "yyyy-MM-dd"),
    });
    setLoading(false);

    if (error) { toast.error(error.message); return; }

    toast.success(`Mood logged: ${selected}`);
    queryClient.invalidateQueries({ queryKey: ["dashboard-mood"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-weekly"] });
    setSelected(null); setReason("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log Mood</DialogTitle>
          <DialogDescription>How are you feeling right now?</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-between gap-2">
            {moods.map((m) => (
              <button
                key={m.label}
                type="button"
                onClick={() => setSelected(m.label)}
                className={`flex flex-col items-center gap-1 rounded-lg p-3 flex-1 transition-all border ${
                  selected === m.label ? "border-primary bg-primary/10" : "border-transparent bg-muted/30 hover:bg-muted/50"
                }`}
              >
                <span className="text-2xl">{m.emoji}</span>
                <span className="text-[10px] text-muted-foreground">{m.label}</span>
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Input id="reason" placeholder="e.g. Low sleep, stress" value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "Saving..." : "Log Mood"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
