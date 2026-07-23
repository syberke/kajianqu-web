import { router } from 'expo-router'
import { ChangePasswordScreen } from '@kajianku/ui-mobile'

export default function ChangePasswordPage() {
  return (
    <ChangePasswordScreen
      navigate={(href) => {
        if (href === '..') router.back()
        else router.push(href as never)
      }}
    />
  )
}
