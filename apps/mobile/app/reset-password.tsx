import { router } from 'expo-router'
import { ResetPasswordScreen } from '@kajianku/ui-mobile'

export default function ResetPasswordPage() {
  return (
    <ResetPasswordScreen
      navigate={(href) => {
        if (href === '..') router.back()
        else router.replace(href as never)
      }}
    />
  )
}
