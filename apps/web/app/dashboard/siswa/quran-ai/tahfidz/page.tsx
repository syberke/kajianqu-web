import { redirect } from 'next/navigation'

export default function LegacyStudentQuranAiTahfidzPage() {
  redirect('/quran-ai?mode=murojaah')
}
