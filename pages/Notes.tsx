import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { StickyNote, Plus, Search, Pin, Trash2, Tag } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const CATEGORIES = ["general", "study", "personal", "work", "health", "ideas"];
const CATEGORY_COLORS: Record<string, string> = {
  general: "bg-muted text-muted-foreground",
  study: "bg-primary/10 text-primary",
  personal: "bg-purple-500/10 text-purple-400",
  work: "bg-blue-500/10 text-blue-400",
  health: "bg-score-good/10 text-score-good",
  ideas: "bg-accent/10 text-accent",
};

const Notes = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [editingNote, setEditingNote] = useState<any>(null);
  const [form, setForm] = useState({ title: "", content: "", category: "general", tags: "", date: new Date().toISOString().slice(0, 10) });

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["notes"],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", user!.id)
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const upsertNote = useMutation({
    mutationFn: async () => {
      const tags = form.tags.split(",").map(t => t.trim()).filter(Boolean);
      if (editingNote) {
        await supabase.from("notes").update({ title: form.title, content: form.content, category: form.category, tags, date: form.date, updated_at: new Date().toISOString() }).eq("id", editingNote.id);
      } else {
        await supabase.from("notes").insert({ user_id: user!.id, title: form.title, content: form.content, category: form.category, tags, date: form.date });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success(editingNote ? "Note updated" : "Note created");
      closeDialog();
    },
  });

  const togglePin = useMutation({
    mutationFn: async (note: any) => {
      await supabase.from("notes").update({ pinned: !note.pinned }).eq("id", note.id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notes"] }),
  });

  const deleteNote = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("notes").delete().eq("id", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Note deleted");
    },
  });

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingNote(null);
    setForm({ title: "", content: "", category: "general", tags: "", date: new Date().toISOString().slice(0, 10) });
  };

  const openEdit = (note: any) => {
    setEditingNote(note);
    setForm({ title: note.title, content: note.content ?? "", category: note.category ?? "general", tags: (note.tags ?? []).join(", "), date: note.date ?? new Date().toISOString().slice(0, 10) });
    setDialogOpen(true);
  };

  const filtered = notes.filter(n => {
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || (n.content ?? "").toLowerCase().includes(search.toLowerCase()) || (n.tags ?? []).some((t: string) => t.toLowerCase().includes(search.toLowerCase()));
    const matchCat = filterCategory === "all" || n.category === filterCategory;
    return matchSearch && matchCat;
  });

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notes</h1>
            <p className="text-sm text-muted-foreground mt-1">Your personal knowledge base</p>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> New Note
          </Button>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search notes..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">Loading notes...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <StickyNote className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No notes yet. Create your first note!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((note, i) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="card-elevated p-4 cursor-pointer hover:border-primary/30 transition-colors group"
                onClick={() => openEdit(note)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-semibold text-foreground line-clamp-1 flex-1">{note.title}</h3>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={e => { e.stopPropagation(); togglePin.mutate(note); }} className="p-1 rounded hover:bg-muted">
                      <Pin className={`h-3.5 w-3.5 ${note.pinned ? "text-primary" : "text-muted-foreground"}`} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); deleteNote.mutate(note.id); }} className="p-1 rounded hover:bg-destructive/10">
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-3 mb-3">{note.content || "No content"}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className={`text-[10px] ${CATEGORY_COLORS[note.category] ?? ""}`}>
                    {note.category}
                  </Badge>
                  {(note.tags ?? []).slice(0, 3).map((tag: string) => (
                    <Badge key={tag} variant="outline" className="text-[10px]">
                      <Tag className="h-2.5 w-2.5 mr-1" />{tag}
                    </Badge>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground/60 mt-2">{new Date(note.created_at).toLocaleDateString()}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={open => { if (!open) closeDialog(); else setDialogOpen(true); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editingNote ? "Edit Note" : "New Note"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <Textarea placeholder="Write your note..." className="min-h-[150px]" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <Input placeholder="Tags (comma separated)" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
            <Button className="w-full" disabled={!form.title.trim()} onClick={() => upsertNote.mutate()}>
              {editingNote ? "Update Note" : "Create Note"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Notes;
