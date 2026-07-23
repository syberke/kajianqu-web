import { type ReactNode, useState } from 'react'
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native'
import { BookOpen, Menu, X } from 'lucide-react-native'
import { colors, radius, spacing } from '@kajianku/design-tokens'

export * from '@kajianku/ui-mobile'

type Navigate = (href: string) => void

const links = [
  ['Beranda', '/'],
  ['Materi', '/materi'],
  ['Asatidz', '/asatidz-list'],
  ["Al-Qur'an", '/quran'],
  ['AI Quran', '/ai-quran'],
  ['Donasi', '/donasi'],
]

export function WebChrome({ children, navigate }: { children: ReactNode; navigate: Navigate }) {
  const { width } = useWindowDimensions()
  const compact = width < 820
  const [open, setOpen] = useState(false)
  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={() => navigate('/')} style={styles.brand}>
          <BookOpen color={colors.gold} size={28} />
          <Text style={styles.brandText}>KajianQu</Text>
        </Pressable>
        {compact ? (
          <Pressable accessibilityLabel="Buka navigasi" onPress={() => setOpen((value) => !value)} style={styles.menuButton}>
            {open ? <X color={colors.white} size={24} /> : <Menu color={colors.white} size={24} />}
          </Pressable>
        ) : (
          <View style={styles.links}>
            {links.map(([label, href]) => (
              <Pressable key={href} onPress={() => navigate(href)} style={styles.linkButton}>
                <Text style={styles.linkText}>{label}</Text>
              </Pressable>
            ))}
            <Pressable onPress={() => navigate('/login')} style={styles.loginButton}>
              <Text style={styles.loginText}>Masuk</Text>
            </Pressable>
          </View>
        )}
      </View>
      {compact && open ? (
        <View style={styles.mobileMenu}>
          {links.map(([label, href]) => (
            <Pressable key={href} onPress={() => { setOpen(false); navigate(href) }} style={styles.mobileLink}>
              <Text style={styles.mobileLinkText}>{label}</Text>
            </Pressable>
          ))}
          <Pressable onPress={() => { setOpen(false); navigate('/login') }} style={styles.loginButton}>
            <Text style={styles.loginText}>Masuk</Text>
          </Pressable>
        </View>
      ) : null}
      <View style={styles.content}>{children}</View>
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerBrand}>KajianQu</Text>
          <Text style={styles.footerText}>Platform belajar Islam dan Al-Qur'an yang aman dan terarah.</Text>
        </View>
        <Text style={styles.footerText}>© 2026 KajianQu</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { minHeight: 74, backgroundColor: colors.primaryDark, paddingHorizontal: spacing.xl, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.lg, zIndex: 50 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  brandText: { color: colors.white, fontSize: 23, fontWeight: '900' },
  links: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  linkButton: { paddingVertical: spacing.md, paddingHorizontal: spacing.sm },
  linkText: { color: '#E4F3ED', fontWeight: '700' },
  loginButton: { minHeight: 42, borderRadius: radius.pill, backgroundColor: colors.gold, paddingHorizontal: spacing.lg, alignItems: 'center', justifyContent: 'center' },
  loginText: { color: colors.primaryDark, fontWeight: '900' },
  menuButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  mobileMenu: { position: 'absolute', top: 74, left: 0, right: 0, backgroundColor: colors.surface, padding: spacing.lg, gap: spacing.sm, zIndex: 49, borderBottomWidth: 1, borderBottomColor: colors.border },
  mobileLink: { padding: spacing.md, borderRadius: radius.sm, backgroundColor: colors.surfaceMuted },
  mobileLinkText: { color: colors.text, fontWeight: '800' },
  content: { flex: 1 },
  footer: { backgroundColor: colors.primaryDark, padding: spacing.xl, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: spacing.xl },
  footerBrand: { color: colors.white, fontSize: 21, fontWeight: '900', marginBottom: spacing.sm },
  footerText: { color: '#C5DDD4', lineHeight: 20 },
})
