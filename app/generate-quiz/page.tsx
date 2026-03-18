'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

// Inisialisasi Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Home() {
  const [url, setUrl] = useState('')
  const [materialId, setMaterialId] = useState('') // Input tambahan untuk ID Material
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const generateQuiz = async () => {
    // Validasi Material ID
    if (!materialId || materialId.length < 10) {
      setError('Masukkan ID Material (UUID) yang valid dari tabel materials terlebih dahulu.')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)
    
    try {
      // 1. Fetch ke Edge Function (AI & Transkrip)
      const res = await fetch('https://zqubndojitbslbbblllo.supabase.co/functions/v1/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ url })
      })
      
      if (!res.ok) {
        const errData = await res.json() 
        throw new Error(errData.error || "Gagal memproses video")
      }
      
      const data = await res.json()

      // ==========================================================
      // 2. PROSES SIMPAN KE DATABASE SUPABASE
      // ==========================================================
      try {
        // A. Update ringkasan (summary) di tabel materials
        const { error: materialErr } = await supabase
          .from('materials')
          .update({ summary: data.summary })
          .eq('id', materialId)

        if (materialErr) throw new Error("Gagal update summary: " + materialErr.message)

        // B. Buat entri kuis baru di tabel quizzes
        const { data: quizData, error: quizErr } = await supabase
          .from('quizzes')
          .insert({
            material_id: materialId,
            title: 'Kuis Evaluasi Video (AI)',
            quiz_type: 'ai_generated',
            is_active: true
          })
          .select()
          .single()

        if (quizErr) throw new Error("Gagal insert ke quizzes: " + quizErr.message)

        // C. Siapkan array data pertanyaan
        const questionsToInsert = data.quiz.map((q: any, index: number) => ({
          quiz_id: quizData.id,
          question: q.question,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          option_d: q.option_d,
          correct_answer: q.correct_answer,
          explanation: q.explanation,
          order_no: index + 1
        }))

        // D. Insert semua pertanyaan ke tabel quiz_questions
        const { error: questionErr } = await supabase
          .from('quiz_questions')
          .insert(questionsToInsert)

        if (questionErr) throw new Error("Gagal insert ke quiz_questions: " + questionErr.message)

        alert("Berhasil! Kuis dan Summary sukses disimpan ke database.")
      } catch (dbErr: any) {
        console.error("Database Error:", dbErr)
        throw new Error("Kuis berhasil digenerate, TAPI " + dbErr.message)
      }
      // ==========================================================

      // 3. Tampilkan hasilnya ke layar
      setResult(data)

    } catch (err: any) {
      let errorMessage = err.message || 'Terjadi kesalahan.';
      if (errorMessage.includes('Transcript is disabled')) {
        errorMessage = 'Video ini tidak memiliki Subtitle/Transkrip teks yang aktif. Silakan gunakan video lain.';
      }
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getOptionClass = (correctAnswer: string, currentOption: string) => {
    return correctAnswer === currentOption 
      ? 'bg-green-100 border border-green-300 font-semibold' 
      : 'bg-white border border-gray-200'
  }

  return (
    <main className="p-8 max-w-4xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">YouTube AI Summarizer & Quiz</h1>
      
      <div className="flex flex-col gap-4 mb-6">
        {/* Input Material ID */}
        <input 
          type="text" 
          value={materialId} 
          onChange={(e) => setMaterialId(e.target.value)} 
          placeholder="Paste ID Material (UUID) dari Supabase di sini..."
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <div className="flex gap-4">
          <input 
            type="text" 
            value={url} 
            onChange={(e) => setUrl(e.target.value)} 
            placeholder="Masukkan URL YouTube (cth: https://www.youtube.com/watch?v=...)"
            className="flex-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            onClick={generateQuiz} 
            disabled={loading || !url || !materialId}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300 transition-all"
          >
            {loading ? 'Memproses AI...' : 'Generate & Simpan'}
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 mb-4 bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>}

      {result && (
        <div className="space-y-8">
          <div className="bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-200">
            <h2 className="text-xl font-bold mb-3 text-gray-700">📜 Teks Transkrip Mentah</h2>
            <div className="bg-white p-4 rounded-lg border border-gray-300 h-64 overflow-y-auto text-sm text-gray-600 font-mono leading-relaxed whitespace-pre-wrap">
              {result.transcript}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h2 className="text-2xl font-bold mb-3 text-blue-600">Ringkasan Video</h2>
            <p className="mb-8 text-gray-700 leading-relaxed">{result.summary}</p>

            <h2 className="text-2xl font-bold mb-4 text-emerald-600">Kuis Evaluasi</h2>
            <div className="space-y-6">
              {result.quiz.map((q: any, i: number) => (
                <div key={i} className="p-5 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="font-bold text-lg mb-3">{i + 1}. {q.question}</p>
                  <ul className="space-y-2 mb-4">
                    <li className={`p-2 rounded ${getOptionClass(q.correct_answer, 'option_a')}`}>A. {q.option_a}</li>
                    <li className={`p-2 rounded ${getOptionClass(q.correct_answer, 'option_b')}`}>B. {q.option_b}</li>
                    <li className={`p-2 rounded ${getOptionClass(q.correct_answer, 'option_c')}`}>C. {q.option_c}</li>
                    <li className={`p-2 rounded ${getOptionClass(q.correct_answer, 'option_d')}`}>D. {q.option_d}</li>
                  </ul>
                  <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                    <strong>Penjelasan:</strong> {q.explanation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}