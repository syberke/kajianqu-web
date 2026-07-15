import { redirect } from 'next/navigation'

export default function LegacyQuranAiTahfidzPage() {
  redirect('/quran-ai?mode=murojaah')
}
