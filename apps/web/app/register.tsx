import { router } from 'expo-router'
import { AuthScreen } from '@kajianku/ui-web'

export default function RegisterPage() {
  return <AuthScreen mode="register" navigate={(href) => router.replace(href as never)} />
}
