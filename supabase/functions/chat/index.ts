// supabase/functions/chat/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Groq from "https://esm.sh/groq-sdk@0.3.3";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Authorization,Content-Type",
      },
    });
  }

  try {
    const { message, mood } = await req.json();

    const system_prompt = `You are SoulScribe, an empathetic AI companion. 
    The user is currently feeling '${mood}'. 
    Tailor your response to be supportive and relevant.`;

    const groq = new Groq({
      apiKey: Deno.env.get("GROQ_API_KEY"),
    });

    const chatCompletion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: system_prompt },
        { role: "user", content: message },
      ],
    });

    const reply = chatCompletion.choices[0].message.content;

    return new Response(JSON.stringify({ reply }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error in /chat:", error);

    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }
});