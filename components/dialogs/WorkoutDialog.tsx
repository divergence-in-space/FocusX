import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const workoutTypes = ["Push Day", "Pull Day", "Leg Day", "Cardio", "Full Body", "Custom"];

export function WorkoutDialog({ open, onOpenChange }: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [type, setType] = useState("");
  const [duration, setDuration] = useState("");
  const [exercises, setExercises] = useState("");
  const [calories, setCalories] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !duration) { toast.error("Please select workout type and duration"); return; }
    if (!user) { toast.error("Please sign in"); return; }

    setLoading(true);
    const { error } = await supabase.from("workouts").insert({
      user_id: user.id,
      workout_type: type,
      duration: parseInt(duration),
      exercises: exercises || null,
      calories: calories ? parseInt(calories) : null,
      date: format(new Date(), "yyyy-MM-dd"),
    });
    setLoading(false);

    if (error) { toast.error(error.message); return; }

    toast.success(`Workout logged: ${type} (${duration} min)`);
    queryClient.invalidateQueries({ queryKey: ["dashboard-workout"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-weekly"] });
    setType(""); setDuration(""); setExercises(""); setCalories("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log Workout</DialogTitle>
          <DialogDescription>Record your gym session.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Workout Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                {workoutTypes.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (min)</Label>
              <Input id="duration" type="number" placeholder="60" value={duration} onChange={(e) => setDuration(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="calories">Calories (optional)</Label>
              <Input id="calories" type="number" placeholder="350" value={calories} onChange={(e) => setCalories(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="exercises">Exercises</Label>
            <Input id="exercises" placeholder="e.g. Bench Press, OHP, Flyes" value={exercises} onChange={(e) => setExercises(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "Saving..." : "Log Workout"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
