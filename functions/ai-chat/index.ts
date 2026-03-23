import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.warn("LOVABLE_API_KEY is not configured.");
      throw new Error("AI Gateway API key (LOVABLE_API_KEY) is missing in Edge Function environment.");
    }

    // Get user's auth token to fetch their data
    const authHeader = req.headers.get("authorization");
    
    // Use default edge function env vars for Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase internal configuration is missing (URL or Anon Key).");
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader ?? "" } },
    });

    const { data: { user } } = await supabase.auth.getUser();
    let contextBlock = "";

    if (user) {
      const today = new Date().toISOString().slice(0, 10);
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);

      const [study, sleep, workouts, expenses, habits, habitLogs, moods, notes] = await Promise.all([
        supabase.from("study_sessions").select("*").eq("user_id", user.id).gte("date", weekAgo).order("date", { ascending: false }),
        supabase.from("sleep_logs").select("*").eq("user_id", user.id).gte("date", weekAgo).order("date", { ascending: false }),
        supabase.from("workouts").select("*").eq("user_id", user.id).gte("date", weekAgo).order("date", { ascending: false }),
        supabase.from("expenses").select("*").eq("user_id", user.id).gte("date", weekAgo).order("date", { ascending: false }),
        supabase.from("habits").select("*").eq("user_id", user.id),
        supabase.from("habit_logs").select("*").eq("user_id", user.id).gte("date", weekAgo),
        supabase.from("moods").select("*").eq("user_id", user.id).gte("date", weekAgo).order("date", { ascending: false }),
        supabase.from("notes").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
      ]);

      contextBlock = `
Here is the user's data from the last 7 days. Use this to provide personalized insights.

STUDY SESSIONS (last 7 days): ${JSON.stringify(study.data ?? [])}
SLEEP LOGS (last 7 days): ${JSON.stringify(sleep.data ?? [])}
WORKOUTS (last 7 days): ${JSON.stringify(workouts.data ?? [])}
EXPENSES (last 7 days): ${JSON.stringify(expenses.data ?? [])}
HABITS: ${JSON.stringify(habits.data ?? [])}
HABIT LOGS (last 7 days): ${JSON.stringify(habitLogs.data ?? [])}
MOODS (last 7 days): ${JSON.stringify(moods.data ?? [])}
RECENT NOTES: ${JSON.stringify(notes.data ?? [])}
TODAY'S DATE: ${today}
`;
    }

    const systemPrompt = `You are FocusX AI, a personal productivity assistant. You analyze the user's daily tracking data (study, sleep, gym, expenses, habits, mood) and provide actionable insights.

Your personality: Direct, encouraging, data-driven. Use specific numbers from their data. Keep responses concise (2-4 paragraphs max unless asked for detail).

When asked "Why am I tired?", check their sleep data first, then study hours and workout intensity.
When asked about money, analyze their expense patterns.
When asked about productivity, look at study sessions and habit completion rates.

Always reference specific data points. If data is missing, suggest they log it.

${contextBlock}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
