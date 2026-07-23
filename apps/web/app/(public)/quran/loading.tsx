export default function QuranLoading() {
  return (
    <div className="min-h-screen bg-[#f7faf8] px-4 pb-20 pt-32">
      <div className="mx-auto max-w-5xl animate-pulse space-y-6">
        <div className="h-44 rounded-3xl bg-emerald-900/20" />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="h-40 rounded-2xl bg-slate-200" />
          <div className="h-40 rounded-2xl bg-slate-200" />
        </div>
        <div className="h-56 rounded-3xl bg-slate-200" />
      </div>
    </div>
  )
}
