import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { CalendarDays, Plus, Clock, Trash2 } from "lucide-react";
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
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { format, isSameDay, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { useGoogleLogin } from "@react-oauth/google";

const EVENT_TYPES = [
  { value: "exam", label: "Exam", color: "bg-destructive/10 text-destructive" },
  { value: "study", label: "Study", color: "bg-primary/10 text-primary" },
  { value: "workout", label: "Workout", color: "bg-purple-500/10 text-purple-400" },
  { value: "personal", label: "Personal", color: "bg-blue-500/10 text-blue-400" },
  { value: "meeting", label: "Meeting", color: "bg-accent/10 text-accent" },
  { value: "general", label: "General", color: "bg-muted text-muted-foreground" },
];

const CalendarPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [syncWithGoogle, setSyncWithGoogle] = useState(false);
  const [hasGoogleAuth, setHasGoogleAuth] = useState(false);
  
  const login = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async (codeResponse) => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const res = await fetch(`${API_URL}/api/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: codeResponse.code })
        });
        if (res.ok) {
          setHasGoogleAuth(true);
          toast.success("Connected to Google Calendar");
        } else {
          setSyncWithGoogle(false);
          toast.error("Failed to connect to Google");
        }
      } catch (e) {
        setSyncWithGoogle(false);
        toast.error("Network error during Google Auth");
      }
    },
    onError: () => {
      setSyncWithGoogle(false);
      toast.error("Google Auth failed");
    }
  });

  const handleToggleSync = (checked: boolean) => {
    if (checked && !hasGoogleAuth) {
      login();
      setSyncWithGoogle(true);
    } else {
      setSyncWithGoogle(checked);
    }
  };

  const [form, setForm] = useState({
    title: "", description: "", event_date: format(new Date(), "yyyy-MM-dd"),
    start_time: "09:00", end_time: "10:00", event_type: "general",
  });

  const { data: events = [] } = useQuery({
    queryKey: ["calendar-events"],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("user_id", user!.id)
        .order("event_date", { ascending: true });
      return data ?? [];
    },
  });

  const createEvent = useMutation({
    mutationFn: async () => {
      const { data: eventData, error } = await supabase.from("calendar_events").insert({
        user_id: user!.id, title: form.title, description: form.description,
        event_date: form.event_date, start_time: form.start_time, end_time: form.end_time,
        event_type: form.event_type,
      }).select().single();
      
      if (error) throw error;

      if (syncWithGoogle) {
        const startDateTime = `${form.event_date}T${form.start_time}:00`;
        const endDateTime = `${form.event_date}T${form.end_time}:00`;
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${API_URL}/api/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            summary: form.title,
            description: form.description,
            start: startDateTime,
            end: endDateTime,
            timezone
          })
        });

        if (!response.ok) {
          throw new Error('Failed to sync with Google Calendar');
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
      toast.success("Event added to FocusX ✅");
      if (syncWithGoogle) toast.success("Synced with Google Calendar 📅");
      setDialogOpen(false);
      setForm({ title: "", description: "", event_date: format(selectedDate, "yyyy-MM-dd"), start_time: "09:00", end_time: "10:00", event_type: "general" });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create event");
    }
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("calendar_events").delete().eq("id", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
      toast.success("Event deleted");
    },
  });

  const selectedDayEvents = events.filter(e => isSameDay(parseISO(e.event_date), selectedDate));
  const daysWithEvents = events.map(e => parseISO(e.event_date));

  const getTypeInfo = (type: string) => EVENT_TYPES.find(t => t.value === type) ?? EVENT_TYPES[5];

  const openNewEvent = () => {
    setForm(f => ({ ...f, event_date: format(selectedDate, "yyyy-MM-dd") }));
    setDialogOpen(true);
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your events and schedule</p>
          </div>
          <Button onClick={openNewEvent} className="gap-2">
            <Plus className="h-4 w-4" /> Add Event
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Widget */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card-elevated p-4 lg:col-span-1">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={d => d && setSelectedDate(d)}
              modifiers={{ hasEvent: daysWithEvents }}
              modifiersStyles={{ hasEvent: { fontWeight: 700, textDecoration: "underline", textDecorationColor: "hsl(160 84% 39%)" } }}
              className="mx-auto"
            />
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {EVENT_TYPES.map(t => (
                <Badge key={t.value} variant="secondary" className={`text-[10px] ${t.color}`}>{t.label}</Badge>
              ))}
            </div>
          </motion.div>

          {/* Day View */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-elevated p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </h3>
              <span className="text-xs text-muted-foreground">{selectedDayEvents.length} event{selectedDayEvents.length !== 1 ? "s" : ""}</span>
            </div>

            {selectedDayEvents.length === 0 ? (
              <div className="text-center py-12">
                <CalendarDays className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No events this day</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={openNewEvent}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Event
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDayEvents.map(event => {
                  const typeInfo = getTypeInfo(event.event_type);
                  return (
                    <div key={event.id} className="flex items-start gap-3 rounded-lg border border-border p-3 hover:bg-muted/30 transition-colors group">
                      <div className={`rounded-md p-2 ${typeInfo.color}`}>
                        <CalendarDays className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-foreground">{event.title}</h4>
                        {event.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{event.description}</p>}
                        <div className="flex items-center gap-3 mt-1.5">
                          {event.start_time && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" /> {event.start_time} — {event.end_time}
                            </span>
                          )}
                          <Badge variant="secondary" className={`text-[10px] ${typeInfo.color}`}>{typeInfo.label}</Badge>
                        </div>
                      </div>
                      <button onClick={() => deleteEvent.mutate(event.id)} className="p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all">
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>

        {/* Upcoming Events */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-elevated p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Upcoming Events</h3>
          <div className="space-y-2">
            {events.filter(e => parseISO(e.event_date) >= new Date(new Date().toDateString())).slice(0, 8).map(event => {
              const typeInfo = getTypeInfo(event.event_type);
              return (
                <div key={event.id} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted/30 transition-colors">
                  <Badge variant="secondary" className={`text-[10px] ${typeInfo.color}`}>{typeInfo.label}</Badge>
                  <span className="text-sm text-foreground flex-1">{event.title}</span>
                  <span className="text-xs text-muted-foreground font-mono">{format(parseISO(event.event_date), "MMM d")}</span>
                  {event.start_time && <span className="text-xs text-muted-foreground font-mono">{event.start_time}</span>}
                </div>
              );
            })}
            {events.filter(e => parseISO(e.event_date) >= new Date(new Date().toDateString())).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No upcoming events</p>
            )}
          </div>
        </motion.div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>New Event</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Event title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <Textarea placeholder="Description (optional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <Input type="date" value={form.event_date} onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Start</label>
                <Input type="time" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">End</label>
                <Input type="time" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} />
              </div>
            </div>
            <Select value={form.event_type} onValueChange={v => setForm(f => ({ ...f, event_type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className={`flex items-center justify-between my-4 p-4 rounded-xl border transition-all ${syncWithGoogle ? 'border-cyan-500/50 bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'border-purple-500/30 bg-purple-500/5'}`}>
              <div className="flex flex-col">
                <label htmlFor="sync-google" className={`text-sm font-semibold transition-colors ${syncWithGoogle ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'text-foreground'}`}>Sync with Google Calendar</label>
                <span className="text-[10px] text-muted-foreground mt-0.5">Automatically add this to your Google schedule</span>
              </div>
              <Switch id="sync-google" checked={syncWithGoogle} onCheckedChange={handleToggleSync} className="data-[state=checked]:bg-cyan-500" />
            </div>
            <Button className="w-full" disabled={!form.title.trim()} onClick={() => createEvent.mutate()}>
              Create Event
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default CalendarPage;
