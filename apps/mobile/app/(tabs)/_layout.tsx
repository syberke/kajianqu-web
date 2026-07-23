import { Tabs } from 'expo-router'
import { BookOpen, Bot, GraduationCap, Home, UserRound } from 'lucide-react-native'
import { colors } from '@kajianku/design-tokens'

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { height: 68, paddingTop: 7, paddingBottom: 8, borderTopColor: colors.border },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Beranda', tabBarIcon: ({ color }) => <Home color={color} size={22} /> }} />
      <Tabs.Screen name="quran" options={{ title: "Al-Qur'an", tabBarIcon: ({ color }) => <BookOpen color={color} size={22} /> }} />
      <Tabs.Screen name="ai-quran" options={{ title: 'AI Quran', tabBarIcon: ({ color }) => <Bot color={color} size={22} /> }} />
      <Tabs.Screen name="kelas" options={{ title: 'Kelas', tabBarIcon: ({ color }) => <GraduationCap color={color} size={22} /> }} />
      <Tabs.Screen name="profil" options={{ title: 'Profil', tabBarIcon: ({ color }) => <UserRound color={color} size={22} /> }} />
    </Tabs>
  )
}
