'use client'


import { useState } from 'react'
import Link from 'next/link'
import { Share2, Play, ChevronRight, Lightbulb, CheckCircle2 } from 'lucide-react'

const imgFallback = "https://www.figma.com/api/mcp/asset/7457a6f1-a3f4-4def-8df5-5b4f83e022ee"

// ── Helper ───────────────────────────────────────────────────────────
function getYouTubeId(url: string): string | null {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
}

function getYouTubeThumb(url: string): string {
  const id = getYouTubeId(url)
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : imgFallback
}

const OPTION_KEYS = ['option_a', 'option_b', 'option_c', 'option_d'] as const
const OPTION_LABELS = ['A', 'B', 'C', 'D']

// ── Quiz soal ────────────────────────────────────────────────────────
function QuizQuestion({ question, index, isLast }: { question: any; index: number; isLast: boolean }) {
  const [selected, setSelected] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleSelect = (key: string) => {
    if (submitted) return
    setSelected(key)
  }

  const isCorrect = submitted && selected === question.correct_answer

  return (
    <div>
      <div className="py-6 space-y-4">
        {/* Pertanyaan */}
        <p className="font-semibold text-gray-800 text-base">
          {question.question}
        </p>

        {/* Opsi */}
        <div className="space-y-2.5">
          {OPTION_KEYS.map((key, i) => {
            const isSelected = selected === key
            const isAnswer   = submitted && key === question.correct_answer
            const isWrong    = submitted && isSelected && key !== question.correct_answer

            return (
              <label
                key={key}
                onClick={() => handleSelect(key)}
                className={`flex items-center gap-3 cursor-pointer py-2 px-3 rounded-xl transition-all ${
                  isAnswer ? 'bg-emerald-50 border border-emerald-200' :
                  isWrong  ? 'bg-red-50 border border-red-200' :
                  isSelected ? 'bg-gray-50 border border-gray-300' :
                  'hover:bg-gray-50'
                }`}
              >
                {/* Radio visual */}
                <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                  isAnswer ? 'border-emerald-500 bg-emerald-500' :
                  isWrong  ? 'border-red-400 bg-red-400' :
                  isSelected ? 'border-[#1a7a53]' :
                  'border-gray-300'
                }`}>
                  {(isSelected || isAnswer) && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>

                <span className={`text-sm transition-colors ${
                  isAnswer ? 'text-emerald-700 font-semibold' :
                  isWrong  ? 'text-red-600' :
                  'text-gray-700'
                }`}>
                  {question[key]}
                </span>
              </label>
            )
          })}
        </div>

        {/* Jawab / Feedback */}
        {!submitted && selected && (
          <button
            onClick={() => setSubmitted(true)}
            className="text-sm bg-[#1a7a53] text-white px-5 py-2 rounded-xl font-semibold hover:bg-[#15613f] transition-colors"
          >
            Jawab
          </button>
        )}

        {submitted && (
          <div className={`flex items-start gap-2 text-sm ${isCorrect ? 'text-emerald-600' : 'text-red-500'}`}>
            <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
            <span>
              {isCorrect
                ? 'Jawaban benar!'
                : `Jawaban salah. Jawaban yang benar: ${question[question.correct_answer]}`}
              {question.explanation && (
                <span className="block text-gray-500 mt-1">{question.explanation}</span>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Divider antar soal */}
      {!isLast && <div className="border-t border-gray-200" />}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════
export default function MateriDetailClient({ materi }: { materi: any }) {
  const [isPlaying,   setIsPlaying]   = useState(false)
  const [quizOpen,    setQuizOpen]    = useState(false)
  const [copied,      setCopied]      = useState(false)

  const videoUrl   = materi.youtube_url || ''
  const youtubeId  = getYouTubeId(videoUrl)
  const thumb      = getYouTubeThumb(videoUrl)
  const kategori   = materi.keilmuan?.nama || 'Materi'
  const level      = materi.level || 'Mudah'
  const quiz       = materi.quizzes?.[0] || null
  const questions  = quiz?.quiz_questions?.sort((a: any, b: any) => (a.order_no || 0) - (b.order_no || 0)) || []

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      if (navigator.share) navigator.share({ title: materi.title, url: window.location.href })
    }
  }

  return (
    // Background hijau muda seperti screenshot, pt-[72px] untuk navbar fixed
    <div className="min-h-screen bg-[#edf7f3] pt-[72px]">
      <div className="max-w-[860px] mx-auto px-6 py-10 space-y-8">

        {/* ── BREADCRUMB ── */}
        <div className="flex items-center gap-2 text-sm">
          <Link href="/materi" className="text-gray-500 hover:text-[#1a7a53] transition-colors">
            {kategori}
          </Link>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-gray-800 font-bold">{level}</span>
        </div>

        {/* ── JUDUL ── */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
          {materi.title}
        </h1>

        {/* ── DESKRIPSI ── */}
        {materi.description && (
          <p className="text-gray-600 leading-relaxed text-base">
            {materi.description}
          </p>
        )}

        {/* ── VIDEO PLAYER ── */}
        <div className="rounded-2xl overflow-hidden shadow-lg bg-black">
          {isPlaying && youtubeId ? (
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div
              className="relative aspect-video cursor-pointer group"
              onClick={() => youtubeId && setIsPlaying(true)}
            >
              <img
                src={thumb} alt={materi.title}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = imgFallback }}
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-4">
                {/* Play button merah seperti YouTube */}
                <div className="w-[72px] h-[72px] bg-red-600 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                  <Play size={28} className="text-white ml-1.5" fill="white" />
                </div>
                <span className="text-white font-bold text-2xl drop-shadow">Youtube</span>
              </div>
            </div>
          )}
        </div>

        {/* ── TOMBOL: Tonton + Bagikan ── */}
        <div className="flex gap-3">
          <button
            onClick={() => youtubeId && setIsPlaying(true)}
            disabled={!youtubeId}
            className="flex-1 bg-[#1a7a53] text-white font-semibold py-4 rounded-xl hover:bg-[#15613f] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base"
          >
            Tonton Sekarang
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 border border-gray-300 text-gray-700 font-semibold px-6 py-4 rounded-xl hover:bg-gray-50 transition-colors whitespace-nowrap bg-white"
          >
            {copied
              ? '✓ Disalin!'
              : <><Share2 size={16} /> Bagikan</>
            }
          </button>
        </div>

        {/* ── KUIS SEPUTAR TOPIK ── */}
        {quiz && (
          <div className="rounded-2xl border border-[#1a7a53]/20 overflow-hidden bg-white shadow-sm">
            {/* Header kuis — bisa di-klik untuk expand */}
            <button
              onClick={() => setQuizOpen(!quizOpen)}
              className="w-full flex items-center gap-4 p-5 bg-[#edf7f3] hover:bg-[#e2f3ec] transition-colors text-left"
            >
              {/* Icon lampu */}
              <div className="w-11 h-11 bg-[#1a7a53] rounded-xl flex items-center justify-center flex-shrink-0">
                <Lightbulb size={20} className="text-white" />
              </div>

              <div className="flex-1">
                <p className="font-bold text-[#1a7a53] text-lg">Kuis Seputar Topik</p>
                <p className="text-gray-500 text-sm">{quiz.description || 'Beberapa pertanyaan mengenai materi pada video'}</p>
              </div>

              {/* Chevron */}
              <ChevronRight
                size={20}
                className={`text-gray-400 transition-transform flex-shrink-0 ${quizOpen ? 'rotate-90' : ''}`}
              />
            </button>

            {/* Quiz questions — expand */}
            {quizOpen && questions.length > 0 && (
              <div className="px-6 pb-4">
                {questions.map((q: any, i: number) => (
                  <QuizQuestion
                    key={q.id}
                    question={q}
                    index={i}
                    isLast={i === questions.length - 1}
                  />
                ))}
              </div>
            )}

            {/* Kalau quiz ada tapi belum ada soal */}
            {quizOpen && questions.length === 0 && (
              <div className="px-6 py-8 text-center text-gray-400 text-sm">
                Soal kuis belum tersedia
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}