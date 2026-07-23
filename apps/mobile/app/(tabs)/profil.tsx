import { router } from 'expo-router'
import { AppScreen, PrimaryButton, SurfaceCard } from '@kajianku/ui-mobile'
import { Text } from 'react-native'

export default function ProfilePage() {
  return (
    <AppScreen>
      <SurfaceCard>
        <Text style={{ fontSize: 22, fontWeight: '800', marginBottom: 8 }}>Profil siswa</Text>
        <Text>Kelola profil, target belajar, achievement, bookmark, dan keamanan akun.</Text>
      </SurfaceCard>
      <PrimaryButton label="Masuk atau daftar" onPress={() => router.push('/login')} />
    </AppScreen>
  )
}
