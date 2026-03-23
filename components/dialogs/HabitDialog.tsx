import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HabitDialog({ open, onOpenChange }: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) { toast.error("Please enter a habit name"); return; }
    if (!user) { toast.error("Please sign in"); return; }

    setLoading(true);
    const { error } = await supabase.from("habits").insert({
      user_id: user.id,
      name,
      target: target || null,
    });
    setLoading(false);

    if (error) { toast.error(error.message); return; }

    toast.success(`Habit added: ${name}`);
    queryClient.invalidateQueries({ queryKey: ["habits"] });
    setName(""); setTarget("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Habit</DialogTitle>
          <DialogDescription>Create a new daily habit to track.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="habit-name">Habit Name</Label>
            <Input id="habit-name" placeholder="e.g. Drink 3L water" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="target">Target (optional)</Label>
            <Input id="target" placeholder="e.g. 30 minutes, 3 liters" value={target} onChange={(e) => setTarget(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "Saving..." : "Add Habit"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
