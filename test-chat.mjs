const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppaHppZmhybW5jcnd3am5vZWhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMzU5MzksImV4cCI6MjA4ODgxMTkzOX0.Ri0y4c7mJfbedOQja51ZbqHhsv2IkwEU1LFWf_8G4fg";
const CHAT_URL = "https://zihzifhrmncrwwjnoeha.supabase.co/functions/v1/ai-chat";

async function test() {
  try {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`
      },
      body: JSON.stringify({ messages: [{ role: "user", content: "hello" }] })
    });
    console.log(resp.status, resp.statusText);
    const text = await resp.text();
    console.log("Response:", text);
  } catch(e) {
    console.error("Fail:", e);
  }
}
test();
