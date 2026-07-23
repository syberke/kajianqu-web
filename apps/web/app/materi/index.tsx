import { router } from 'expo-router'
import { MaterialCatalogScreen } from '@kajianku/ui-web'

export default function MaterialsPage() {
  return <MaterialCatalogScreen navigate={(href) => router.push(href as never)} />
}
