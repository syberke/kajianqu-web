import { router } from 'expo-router'
import { AiQuranHubScreen } from '@kajianku/ui-mobile'

export default function AiQuranPage() {
  return <AiQuranHubScreen navigate={(href) => router.push(href as never)} />
}
