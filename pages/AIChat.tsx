import { Layout } from "@/components/Layout";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Bot, Send, Sparkles, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const CHAT_URL = SUPABASE_URL ? `${SUPABASE_URL}/functions/v1/ai-chat` : "";

const SUGGESTIONS = [
  "Why am I tired today?",
  "How was my week overall?",
  "How can I save more money?",
  "Give me a daily summary",
  "What habits am I missing?",
  "How can I improve my sleep?",
];

const AIChat = () => {
  const { session } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || isLoading) return;
    
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      toast.error("System Error: Supabase connection keys are missing. Please check your environment variables.");
      setMessages(prev => [...prev, { role: "assistant", content: "Error: My connection to the database is offline. Please configure Supabase variables." }]);
      return;
    }

    const userMsg: Msg = { role: "user", content: text.trim() };
    const allMsgs = [...messages, userMsg];
    setMessages(allMsgs);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${session?.access_token ?? SUPABASE_KEY}`,
        },
        body: JSON.stringify({ messages: allMsgs }),
      });

      if (!resp.ok) {
        let errMsg = `Error ${resp.status}: ${resp.statusText}`;
        try {
          const errData = await resp.json();
          errMsg = errData.error || errData.message || errMsg;
        } catch (_) {}
        throw new Error(errMsg);
      }

      if (!resp.body) throw new Error("No response body received from the server.");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to get response");
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't process that. Please try again." }]);
    }
    setIsLoading(false);
  };

  return (
    <Layout>
      <div className="relative w-full max-w-5xl mx-auto h-[calc(100vh-5rem)] rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(236,72,153,0.15)] border border-pink-500/20 flex flex-col">
        {/* Background Waifu Image & Parallax */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[15s] hover:scale-105"
          style={{ backgroundImage: `url('/mage-girl.png')`, filter: 'brightness(0.85) contrast(1.1)' }} 
        />
        {/* Gradients to blend content seamlessly */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070e] via-black/50 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#05070e] to-transparent opacity-80" />
        
        {/* Floating magical orbs container */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-pink-300 rounded-full animate-pulse opacity-60 shadow-[0_0_20px_pink] blur-[2px]" />
          <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-purple-300 rounded-full animate-ping opacity-80 shadow-[0_0_10px_purple]" style={{ animationDuration: '3s' }} />
        </div>

        {/* Main Interface Wrapper */}
        <div className="relative z-10 flex flex-col flex-1 p-4 sm:p-6 pb-2">
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-4 bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-lg shrink-0">
            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/30 to-purple-500/10 border border-pink-400/40 flex items-center justify-center shadow-[0_0_15px_rgba(236,72,153,0.3)] group overflow-hidden">
               <Bot className="h-6 w-6 text-pink-300 drop-shadow-[0_0_5px_currentColor] group-hover:scale-110 transition-transform duration-300" />
               <div className="absolute top-1 right-1 w-2 h-2 bg-pink-400 rounded-full animate-pulse shadow-[0_0_5px_pink]" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-pink-400" /> FocusX AI Guidance
              </h1>
              <p className="text-xs font-bold uppercase tracking-widest text-pink-300/80 mt-0.5">Your personal systems analyst</p>
            </div>
          </div>

          {/* Chat Messages Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4 scrollbar-thin scrollbar-thumb-pink-500/30 scrollbar-track-transparent">
            {messages.length === 0 && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16 sm:py-24 bg-black/20 backdrop-blur-sm rounded-3xl border border-white/5 my-auto">
                <div className="inline-flex w-20 h-20 items-center justify-center rounded-full bg-pink-500/10 border border-pink-500/20 mb-6 shadow-[0_0_30px_rgba(236,72,153,0.15)] relative">
                  <Sparkles className="h-10 w-10 text-pink-400 drop-shadow-[0_0_10px_currentColor]" />
                  <div className="absolute inset-0 rounded-full border-2 border-pink-400/30 border-t-transparent animate-spin" style={{ animationDuration: '3s' }} />
                </div>
                <h2 className="text-2xl font-black text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] mb-3">System Online. How can I assist?</h2>
                <p className="text-sm font-medium text-pink-200/70 mb-8 max-w-md mx-auto px-4">
                  I monitor your combat logs (gym), rest logs (sleep), and focus states (study) to optimize your daily playthrough.
                </p>
                <div className="flex flex-wrap gap-2 justify-center max-w-xl mx-auto px-4">
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-xs px-4 py-2.5 rounded-full border border-pink-500/20 bg-black/40 backdrop-blur-md text-white/80 hover:text-white hover:bg-pink-500/20 hover:border-pink-400/50 hover:shadow-[0_0_15px_rgba(236,72,153,0.3)] transition-all font-medium"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
            >
                {msg.role === "assistant" && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500/20 border border-pink-400/40 shrink-0 mt-0.5 shadow-[0_0_10px_rgba(236,72,153,0.2)]">
                    <Bot className="h-4 w-4 text-pink-300" />
                  </div>
                )}
                <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm backdrop-blur-md shadow-lg ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-pink-600/80 to-purple-600/80 text-white rounded-br-sm border border-pink-400/30"
                    : "bg-black/60 border border-white/10 text-white rounded-bl-sm"
                }`}>
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm prose-invert max-w-none [&_p]:mb-2 [&_ul]:mb-2 [&_li]:text-white/90 [&_strong]:text-pink-300">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="font-medium tracking-wide">{msg.content}</p>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 shrink-0 mt-0.5 border border-white/20">
                    <User className="h-4 w-4 text-white/70" />
                  </div>
                )}
            </motion.div>
          ))}

            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex gap-3 animate-pulse">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500/20 border border-pink-400/40 shrink-0">
                  <Bot className="h-4 w-4 text-pink-300" />
                </div>
                <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl rounded-bl-sm px-5 py-3.5">
                  <div className="flex gap-1.5 items-center h-5">
                    <span className="h-2 w-2 rounded-full bg-pink-400 shadow-[0_0_5px_pink] animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 rounded-full bg-pink-400 shadow-[0_0_5px_pink] animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 rounded-full bg-pink-400 shadow-[0_0_5px_pink] animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shrink-0 flex gap-2 w-full mt-2 shadow-[0_-5px_20px_rgba(0,0,0,0.3)]">
            <Input
              placeholder="Query the system..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send(input)}
              disabled={isLoading}
              className="flex-1 bg-black/30 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-pink-500/50 rounded-xl px-4 font-medium"
            />
            <Button 
              onClick={() => send(input)} 
              disabled={!input.trim() || isLoading} 
              size="icon" 
              className="rounded-xl bg-pink-600 hover:bg-pink-500 text-white border border-pink-400/50 shadow-[0_0_15px_rgba(236,72,153,0.3)] hover:shadow-[0_0_25px_rgba(236,72,153,0.6)] transition-all flex items-center justify-center w-10 h-10 shrink-0"
            >
              <Send className="h-4 w-4 mr-0.5 mt-0.5" />
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AIChat;
