import { router } from 'expo-router'
import { NotFoundScreen } from '@kajianku/ui-web'

export default function CatchAllPage() {
  return <NotFoundScreen navigate={(href) => router.replace(href as never)} />
}
