import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "npm:@google/generative-ai@latest"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()
    if (!url) throw new Error("URL YouTube dibutuhkan")

    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY')
    if (!rapidApiKey) throw new Error("RAPIDAPI_KEY belum diset di Supabase Secrets")

    const rapidApiHost = 'youtube-transcripts-transcribe-youtube-video-to-text.p.rapidapi.com'
    const fetchUrl = `https://${rapidApiHost}/transcribe`

    const transcriptRes = await fetch(fetchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': rapidApiHost,
        'x-rapidapi-key': rapidApiKey
      },
      body: JSON.stringify({ url: url })
    });

    if (!transcriptRes.ok) {
      const errorText = await transcriptRes.text()
      throw new Error(`Gagal mengambil transkrip: ${errorText}`)
    }

    const transcriptData = await transcriptRes.json()
  
    const text = JSON.stringify(transcriptData).substring(0, 15000)

   
    const geminiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiKey) throw new Error("GEMINI_API_KEY belum diset")
        
    const genAI = new GoogleGenerativeAI(geminiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const prompt = `
    Berikut adalah data transkrip video YouTube:
    ${text}

    Tugas kamu:
    1. Buat ringkasan singkat dari video tersebut.
    2. Buat kuis 5 pertanyaan berdasarkan isi video.
    
    Kembalikan jawaban HANYA dalam format JSON valid tanpa format markdown (seperti \`\`\`json). Gunakan struktur ini persis (agar bisa langsung masuk database):
    {
      "summary": "Ringkasan video...",
      "quiz": [
        {
          "question": "Pertanyaan 1",
          "option_a": "Jawaban A",
          "option_b": "Jawaban B",
          "option_c": "Jawaban C",
          "option_d": "Jawaban D",
          "correct_answer": "option_a", // isi dengan option_a, option_b, option_c, atau option_d
          "explanation": "Penjelasan mengapa jawaban ini benar..."
        }
      ]
    }
    `

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim()
    const finalData = JSON.parse(cleanJson)

    return new Response(JSON.stringify(finalData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error("GAGAL MEMPROSES:", error.message, error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})