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

export function StudySessionDialog({ open, onOpenChange }: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [focusScore, setFocusScore] = useState("8");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !startTime || !endTime) {
      toast.error("Please fill in subject, start and end time");
      return;
    }
    if (!user) { toast.error("Please sign in"); return; }

    setLoading(true);
    
    // Convert time strings to full ISO timestamps for today
    const now = new Date();
    
    const [sH, sM] = startTime.split(':').map(Number);
    const startDate = new Date(now);
    startDate.setHours(sH, sM, 0, 0);
    
    const [eH, eM] = endTime.split(':').map(Number);
    const endDate = new Date(now);
    endDate.setHours(eH, eM, 0, 0);
    
    // If end time is before start time, it might be an overnight session
    if (endDate < startDate) {
      endDate.setDate(endDate.getDate() + 1);
    }

    const { error } = await supabase.from("study_sessions").insert({
      user_id: user.id,
      subject,
      start_time: startDate.toISOString(),
      end_time: endDate.toISOString(),
      focus_score: parseInt(focusScore),
      notes: notes || null,
      date: format(new Date(), "yyyy-MM-dd"),
    });
    setLoading(false);

    if (error) { toast.error(error.message); return; }

    toast.success(`Study session logged: ${subject}`);
    queryClient.invalidateQueries({ queryKey: ["dashboard-study"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-weekly"] });
    setSubject(""); setStartTime(""); setEndTime(""); setFocusScore("8"); setNotes("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log Study Session</DialogTitle>
          <DialogDescription>Record your study session details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" placeholder="e.g. Mathematics" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="start">Start Time</Label>
              <Input id="start" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">End Time</Label>
              <Input id="end" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="focus">Focus Score (1-10)</Label>
            <Input id="focus" type="number" min="1" max="10" value={focusScore} onChange={(e) => setFocusScore(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input id="notes" placeholder="What did you cover?" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "Saving..." : "Log Session"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
