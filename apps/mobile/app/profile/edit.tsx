import { router } from 'expo-router'
import { ProfileEditScreen } from '@kajianku/ui-mobile'

export default function ProfileEditPage() {
  return (
    <ProfileEditScreen
      navigate={(href) => {
        if (href === '..') router.back()
        else router.push(href as never)
      }}
    />
  )
}
