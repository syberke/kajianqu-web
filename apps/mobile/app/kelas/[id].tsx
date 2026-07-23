import { router, useLocalSearchParams } from 'expo-router'
import { ClassDetailScreen } from '@kajianku/ui-mobile'

export default function ClassDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>()
  return (
    <ClassDetailScreen
      id={String(id)}
      navigate={(href) => {
        if (href === '..') router.back()
        else router.push(href as never)
      }}
    />
  )
}
