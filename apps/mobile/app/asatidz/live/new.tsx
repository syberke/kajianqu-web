import { router } from 'expo-router'
import { CreateLiveEventScreen } from '@kajianku/ui-mobile'

export default function CreateLiveEventPage() {
  return (
    <CreateLiveEventScreen
      navigate={(href) => {
        if (href === '..') router.back()
        else router.push(href as never)
      }}
    />
  )
}
