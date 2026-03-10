import Link from 'next/link'

export default function WelcomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-xl text-center space-y-6">
        <h1 className="text-4xl font-bold">KajianQu</h1>
        <p className="text-gray-600">
          Belajar Islam lebih mudah melalui live, kajian tematik, keilmuan, dan AI Al-Qur&apos;an.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/login" className="rounded bg-black text-white px-5 py-3">
            Login
          </Link>
          <Link href="/register" className="rounded border px-5 py-3">
            Register
          </Link>
        </div>
      </div>
    </main>
  )
}