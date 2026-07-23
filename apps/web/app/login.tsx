import { router } from 'expo-router'
import { AuthScreen } from '@kajianku/ui-web'

export default function LoginPage() {
  return <AuthScreen mode="login" navigate={(href) => router.replace(href as never)} />
}
