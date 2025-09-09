// supabase/functions/chat/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Groq from 'https://esm.sh/groq-sdk@0.3.3'

serve(async (req) => {
  // Clone the request immediately so we can safely read the body
  // and access headers without risking the body stream being consumed.
  const clonedReq = req.clone();

  // CORS preflight
  if (clonedReq.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization,Content-Type',
      },
    });
  }

  const { message, mood } = await clonedReq.json()
  const authHeader = clonedReq.headers.get('Authorization') || '';

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } }
  )

  const { data: { user } } = await supabaseClient.auth.getUser()
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } })
  }

  try {
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('profile_data')
      .eq('id', user.id)
      .single()

    if (profileError) throw profileError

    const { data: moods, error: moodError } = await supabaseClient
      .from('mood_logs')
      .select('mood_name')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    if (moodError) throw moodError

    const coping_mechanism = profile?.profile_data?.coping_mechanism || 'Not specified'
    const mood_summary = moods?.map(m => m.mood_name).join(', ') || 'No recent moods'

    const system_prompt = `You are SoulScribe, an empathetic AI companion. The user is currently feeling '${mood}'. Their preferred coping mechanism is '${coping_mechanism}'. Their recent moods are: ${mood_summary}. Tailor your response to be supportive and relevant.`

    const groq = new Groq({ apiKey: Deno.env.get('GROQ_API_KEY') })

    const chatCompletion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: system_prompt },
        { role: 'user', content: message },
      ],
    })

    const reply = chatCompletion.choices[0].message.content
    return new Response(JSON.stringify({ reply }), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } })
  }
})
