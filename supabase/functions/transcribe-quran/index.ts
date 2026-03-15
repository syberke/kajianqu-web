// supabase/functions/transcribe-quran/index.ts
// Deploy: supabase functions deploy transcribe-quran --no-verify-jwt

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return new Response(JSON.stringify({ error: 'No audio file provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const groqApiKey = Deno.env.get('GROQ_API_KEY')
    if (!groqApiKey) {
      return new Response(JSON.stringify({ error: 'Groq API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Groq hanya terima: mp3, mp4, mpeg, mpga, m4a, wav, webm
    // Paksa mime type ke audio/webm dan nama file .webm
    const audioBuffer = await audioFile.arrayBuffer()
    const cleanBlob = new Blob([audioBuffer], { type: 'audio/webm' })
    const cleanFile = new File([cleanBlob], 'recording.webm', { type: 'audio/webm' })

    console.log(`Audio: ${audioBuffer.byteLength} bytes → sending as audio/webm`)

    const groqForm = new FormData()
    groqForm.append('file', cleanFile, 'recording.webm')
    groqForm.append('model', 'whisper-large-v3-turbo')
    groqForm.append('language', 'ar')
    groqForm.append('response_format', 'json')

    const groqRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${groqApiKey}` },
      body: groqForm,
    })

    if (!groqRes.ok) {
      const errText = await groqRes.text()
      console.error('Groq error:', errText)
      return new Response(JSON.stringify({ error: 'Groq API error', details: errText }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const result = await groqRes.json()
    const text = result?.text?.trim() ?? ''
    console.log('Transcribed:', text)

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Function error:', String(error))
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})