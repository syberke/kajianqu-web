import { router } from 'expo-router'
import { AiQuranHubScreen } from '@kajianku/ui-web'

export default function AiQuranPage() {
  return <AiQuranHubScreen navigate={(href) => router.push(href as never)} />
}
