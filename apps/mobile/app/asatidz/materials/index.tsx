import { router } from 'expo-router'
import { AsatidzMaterialsScreen } from '@kajianku/ui-mobile'

export default function AsatidzMaterialsPage() {
  return (
    <AsatidzMaterialsScreen
      navigate={(href) => {
        if (href === '..') router.back()
        else router.push(href as never)
      }}
    />
  )
}
