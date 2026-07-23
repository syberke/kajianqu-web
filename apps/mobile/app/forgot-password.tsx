import { router } from 'expo-router'
import { ForgotPasswordScreen } from '@kajianku/ui-mobile'

export default function ForgotPasswordPage() {
  return (
    <ForgotPasswordScreen
      navigate={(href) => {
        if (href === '..') router.back()
        else router.replace(href as never)
      }}
    />
  )
}
