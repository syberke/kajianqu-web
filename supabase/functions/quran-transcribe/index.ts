const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const maxAudioBytes = 12 * 1024 * 1024
const allowedTypes = new Set([
  'audio/m4a',
  'audio/mp4',
  'audio/mpeg',
  'audio/wav',
  'audio/webm',
  'video/webm',
  'application/octet-stream',
])

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return response({ error: 'Method tidak didukung' }, 405)

  const apiKey = Deno.env.get('DEEPGRAM_API_KEY')
  if (!apiKey) return response({ error: 'Layanan transkripsi belum dikonfigurasi' }, 503)

  try {
    const form = await request.formData()
    const audio = form.get('audio')
    if (!(audio instanceof File)) return response({ error: 'File audio wajib dikirim' }, 400)
    if (audio.size === 0 || audio.size > maxAudioBytes) {
      return response({ error: 'Ukuran rekaman harus antara 1 byte dan 12 MB' }, 413)
    }
    if (audio.type && !allowedTypes.has(audio.type)) {
      return response({ error: `Format ${audio.type} belum didukung` }, 415)
    }

    const model = Deno.env.get('QURAN_TRANSCRIPTION_MODEL') || 'nova-3'
    const url = new URL('https://api.deepgram.com/v1/listen')
    url.searchParams.set('model', model)
    url.searchParams.set('language', 'ar')
    url.searchParams.set('smart_format', 'true')
    url.searchParams.set('punctuate', 'true')
    url.searchParams.set('utterances', 'true')

    const deepgram = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': audio.type || 'application/octet-stream',
      },
      body: await audio.arrayBuffer(),
    })
    const payload = await deepgram.json()
    if (!deepgram.ok) {
      const retryable = deepgram.status === 429 || deepgram.status >= 500
      return response(
        { error: retryable ? 'Layanan sedang sibuk. Coba lagi beberapa saat.' : 'Transkripsi belum berhasil.' },
        deepgram.status === 429 ? 429 : 502,
      )
    }

    const alternative = payload?.results?.channels?.[0]?.alternatives?.[0]
    const transcript = typeof alternative?.transcript === 'string' ? alternative.transcript.trim() : ''
    if (!transcript) {
      return response({ error: 'Tidak ada bacaan yang terdeteksi. Dekatkan mikrofon dan baca dengan suara jelas.' }, 422)
    }
    return response({
      transcript,
      confidence: typeof alternative?.confidence === 'number' ? alternative.confidence : null,
      provider: 'deepgram',
      model,
    })
  } catch {
    return response({ error: 'Rekaman tidak dapat diproses' }, 500)
  }
})
