import { useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { getSupabase } from '@kajianku/api-client'
import { colors } from '@kajianku/design-tokens'

export default function AuthCallbackPage() {
  const { code, next } = useLocalSearchParams<{ code?: string; next?: string }>()
  const [message, setMessage] = useState('Memverifikasi tautan...')

  useEffect(() => {
    async function finish() {
      if (!code) {
        setMessage('Kode pemulihan tidak ditemukan. Minta tautan baru dari halaman lupa kata sandi.')
        return
      }
      const { error } = await getSupabase().auth.exchangeCodeForSession(code)
      if (error) {
        setMessage(error.message)
        return
      }
      router.replace((next?.startsWith('/') ? next : '/') as never)
    }
    void finish()
  }, [code, next])

  return (
    <View style={styles.screen}>
      <ActivityIndicator color={colors.primary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 28 },
  text: { color: colors.text, textAlign: 'center', lineHeight: 21 },
})
