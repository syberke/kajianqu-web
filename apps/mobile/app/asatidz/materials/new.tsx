import { router } from 'expo-router'
import { CreateMaterialScreen } from '@kajianku/ui-mobile'

export default function CreateMaterialPage() {
  return (
    <CreateMaterialScreen
      navigate={(href) => {
        if (href === '..') router.back()
        else router.push(href as never)
      }}
    />
  )
}
