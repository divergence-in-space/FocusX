import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SleepDialog({ open, onOpenChange }: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [sleepTime, setSleepTime] = useState("");
  const [wakeTime, setWakeTime] = useState("");
  const [quality, setQuality] = useState("7");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sleepTime || !wakeTime) { toast.error("Please enter sleep and wake times"); return; }
    if (!user) { toast.error("Please sign in"); return; }

    setLoading(true);
    
    // Convert time strings to full ISO timestamps
    const now = new Date();
    
    // Wake time is usually today
    const [wH, wM] = wakeTime.split(':').map(Number);
    const wakeDate = new Date(now);
    wakeDate.setHours(wH, wM, 0, 0);
    
    // Sleep time calculation
    const [sH, sM] = sleepTime.split(':').map(Number);
    const sleepDate = new Date(now);
    sleepDate.setHours(sH, sM, 0, 0);
    
    // If sleep time is "after" wake time (e.g. 11PM vs 7AM), it was yesterday
    if (sleepDate > wakeDate) {
      sleepDate.setDate(sleepDate.getDate() - 1);
    }

    const { error } = await supabase.from("sleep_logs").insert({
      user_id: user.id,
      sleep_time: sleepDate.toISOString(),
      wake_time: wakeDate.toISOString(),
      quality: parseInt(quality),
      date: format(new Date(), "yyyy-MM-dd"),
    });
    setLoading(false);

    if (error) { toast.error(error.message); return; }

    toast.success("Sleep session logged successfully!");
    queryClient.invalidateQueries({ queryKey: ["dashboard-sleep"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-weekly"] });
    setSleepTime(""); setWakeTime(""); setQuality("7");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log Sleep</DialogTitle>
          <DialogDescription>Record last night's sleep.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="sleep">Bedtime</Label>
              <Input id="sleep" type="time" value={sleepTime} onChange={(e) => setSleepTime(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wake">Wake Time</Label>
              <Input id="wake" type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="quality">Sleep Quality (1-10)</Label>
            <Input id="quality" type="number" min="1" max="10" value={quality} onChange={(e) => setQuality(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "Saving..." : "Log Sleep"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
