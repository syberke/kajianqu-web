import { Tabs } from 'expo-router'
import { BookOpen, Bot, GraduationCap, Home, MessageCircle, UserRound } from 'lucide-react-native'
import { colors } from '@kajianku/design-tokens'
import { View } from 'react-native'

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          height: 78,
          paddingTop: 9,
          paddingBottom: 11,
          borderTopColor: '#D8E1DD',
          borderTopWidth: 1,
          backgroundColor: colors.surface,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: 2 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Beranda', tabBarIcon: ({ color }) => <Home color={color} size={22} /> }} />
      <Tabs.Screen name="kelas" options={{ title: 'Kelas', tabBarIcon: ({ color }) => <GraduationCap color={color} size={22} /> }} />
      <Tabs.Screen
        name="ai-quran"
        options={{
          title: 'AI Quran',
          tabBarLabel: () => null,
          tabBarIcon: () => (
            <View style={{ width: 58, height: 58, marginTop: -22, borderRadius: 29, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: colors.surface }}>
              <Bot color={colors.white} size={25} />
            </View>
          ),
        }}
      />
      <Tabs.Screen name="chat" options={{ title: 'Chat', tabBarIcon: ({ color }) => <MessageCircle color={color} size={22} /> }} />
      <Tabs.Screen name="profil" options={{ title: 'Profil', tabBarIcon: ({ color }) => <UserRound color={color} size={22} /> }} />
      <Tabs.Screen name="quran" options={{ href: null, title: "Al-Qur'an", tabBarIcon: ({ color }) => <BookOpen color={color} size={22} /> }} />
    </Tabs>
  )
}
