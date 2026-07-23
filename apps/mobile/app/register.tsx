import { router, useLocalSearchParams } from 'expo-router'
import { AuthScreen } from '@kajianku/ui-mobile'

export default function RegisterPage() {
  const { role } = useLocalSearchParams<{ role?: string }>()
  return (
    <AuthScreen
      initialRole={role === 'asatidz' ? 'asatidz' : 'siswa'}
      mode="register"
      navigate={(href) => router.replace(href as never)}
    />
  )
}
