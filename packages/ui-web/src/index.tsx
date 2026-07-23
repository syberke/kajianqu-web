import { type ReactNode, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native'
import { BookOpen, ChevronRight, HeartHandshake, Menu, MessageCircle, Sparkles, X } from 'lucide-react-native'
import { colors, radius, shadow, spacing } from '@kajianku/design-tokens'

export * from '@kajianku/ui-mobile'

type Navigate = (href: string) => void

const primaryLinks = [
  ['Beranda', '/'],
  ['Materi', '/materi'],
  ['Asatidz', '/asatidz-list'],
  ["Al-Qur'an", '/quran'],
  ['AI Quran', '/ai-quran'],
  ['Kelas', '/kelas'],
  ['Live', '/live'],
] as const

const secondaryLinks = [
  ["Do'a", '/doa'],
  ['Dzikir', '/dzikir'],
  ['Kiblat', '/kiblat'],
  ['Quote', '/quote'],
  ['Bahtsul Masail', '/bahtsul-masail'],
  ['Muamalat', '/muamalat'],
  ['Chat', '/chat'],
  ['Donasi', '/donasi'],
] as const

export function WebChrome({ children, navigate }: { children: ReactNode; navigate: Navigate }) {
  const { width } = useWindowDimensions()
  const compact = width < 980
  const [open, setOpen] = useState(false)

  function go(href: string) {
    setOpen(false)
    navigate(href)
  }

  return (
    <View style={styles.root}>
      <View style={styles.stickyHeader}>
        <View style={styles.utilityBar}>
          <View style={styles.headerInner}>
            <Text style={styles.utilityText}>Platform belajar Islam dan Al-Qur'an yang aman, terarah, dan ramah keluarga</Text>
            {!compact ? (
              <View style={styles.utilityActions}>
                <Pressable onPress={() => go('/chat')} style={styles.utilityLink}>
                  <MessageCircle color="#CFE6DD" size={14} />
                  <Text style={styles.utilityLinkText}>Pesan</Text>
                </Pressable>
                <Pressable onPress={() => go('/donasi')} style={styles.utilityLink}>
                  <HeartHandshake color="#CFE6DD" size={14} />
                  <Text style={styles.utilityLinkText}>Donasi</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        </View>
        <View style={styles.navbar}>
          <View style={styles.headerInner}>
            <Pressable accessibilityRole="link" onPress={() => go('/')} style={styles.brand}>
              <View style={styles.brandIcon}><BookOpen color={colors.gold} size={27} strokeWidth={2.4} /></View>
              <View>
                <Text style={styles.brandText}>KajianQu</Text>
                <Text style={styles.brandTagline}>Sahabat belajar Anda</Text>
              </View>
            </Pressable>
            {compact ? (
              <Pressable accessibilityLabel={open ? 'Tutup navigasi' : 'Buka navigasi'} onPress={() => setOpen((value) => !value)} style={styles.menuButton}>
                {open ? <X color={colors.primaryDark} size={25} /> : <Menu color={colors.primaryDark} size={25} />}
              </Pressable>
            ) : (
              <View style={styles.links}>
                {primaryLinks.map(([label, href]) => (
                  <Pressable key={href} onPress={() => go(href)} style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}>
                    <Text style={styles.linkText}>{label}</Text>
                  </Pressable>
                ))}
                <Pressable onPress={() => go('/login')} style={({ pressed }) => [styles.loginButton, pressed && styles.pressed]}>
                  <Text style={styles.loginText}>Masuk</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
        {!compact ? (
          <View style={styles.secondaryNav}>
            <View style={styles.secondaryInner}>
              {secondaryLinks.map(([label, href]) => (
                <Pressable key={href} onPress={() => go(href)} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
                  <Text style={styles.secondaryText}>{label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}
      </View>

      {compact && open ? (
        <View style={styles.mobileMenuLayer}>
          <ScrollView contentContainerStyle={styles.mobileMenu} keyboardShouldPersistTaps="handled">
            <Text style={styles.mobileSectionLabel}>Menu utama</Text>
            {[...primaryLinks, ...secondaryLinks].map(([label, href]) => (
              <Pressable key={href} onPress={() => go(href)} style={({ pressed }) => [styles.mobileLink, pressed && styles.pressed]}>
                <Text style={styles.mobileLinkText}>{label}</Text>
                <ChevronRight color={colors.primary} size={18} />
              </Pressable>
            ))}
            <Pressable onPress={() => go('/login')} style={styles.mobileLogin}>
              <Text style={styles.loginText}>Masuk atau daftar</Text>
            </Pressable>
          </ScrollView>
        </View>
      ) : null}

      <View style={styles.content}>{children}</View>
      <View style={styles.footer}>
        <View style={styles.footerInner}>
          <View style={styles.footerIntro}>
            <View style={styles.footerBrandRow}>
              <BookOpen color={colors.gold} size={27} />
              <Text style={styles.footerBrand}>KajianQu</Text>
            </View>
            <Text style={styles.footerText}>Baca Al-Qur'an, ikuti materi dan kelas, berlatih dengan AI Quran, lalu terhubung dengan asatidz melalui ruang yang aman.</Text>
          </View>
          <View style={styles.footerColumn}>
            <Text style={styles.footerTitle}>Belajar</Text>
            {primaryLinks.slice(1, 6).map(([label, href]) => (
              <Pressable key={href} onPress={() => go(href)}><Text style={styles.footerLink}>{label}</Text></Pressable>
            ))}
          </View>
          <View style={styles.footerColumn}>
            <Text style={styles.footerTitle}>Layanan</Text>
            {secondaryLinks.slice(0, 5).map(([label, href]) => (
              <Pressable key={href} onPress={() => go(href)}><Text style={styles.footerLink}>{label}</Text></Pressable>
            ))}
          </View>
          <View style={styles.footerCallout}>
            <Sparkles color={colors.gold} size={24} />
            <Text style={styles.footerTitle}>AI Quran</Text>
            <Text style={styles.footerText}>Pendamping latihan bacaan. Hasilnya tetap perlu dikonfirmasi kepada guru untuk penilaian tajwid.</Text>
          </View>
        </View>
        <View style={styles.copyright}>
          <Text style={styles.copyrightText}>© 2026 KajianQu. Seluruh hak dilindungi.</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, minHeight: '100%', backgroundColor: colors.background },
  stickyHeader: { zIndex: 60, ...({ position: 'sticky', top: 0 } as object) },
  utilityBar: { backgroundColor: colors.primaryDark },
  headerInner: { width: '100%', maxWidth: 1240, alignSelf: 'center', paddingHorizontal: spacing.xl, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  utilityText: { color: '#CFE6DD', fontSize: 12, paddingVertical: 8 },
  utilityActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  utilityLink: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  utilityLinkText: { color: '#E5F3EE', fontSize: 12, fontWeight: '700' },
  navbar: { minHeight: 76, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, ...shadow.card },
  brand: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  brandIcon: { width: 45, height: 45, borderRadius: radius.md, backgroundColor: colors.primaryDark, alignItems: 'center', justifyContent: 'center' },
  brandText: { color: colors.primaryDark, fontSize: 23, fontWeight: '900', letterSpacing: -0.5 },
  brandTagline: { color: colors.textMuted, fontSize: 10, fontWeight: '700', marginTop: 1 },
  links: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  linkButton: { paddingVertical: spacing.md, paddingHorizontal: 10, borderRadius: radius.sm },
  linkText: { color: colors.text, fontSize: 13, fontWeight: '800' },
  loginButton: { minHeight: 42, borderRadius: radius.pill, backgroundColor: colors.gold, paddingHorizontal: spacing.lg, marginLeft: spacing.sm, alignItems: 'center', justifyContent: 'center' },
  loginText: { color: colors.primaryDark, fontWeight: '900' },
  menuButton: { width: 45, height: 45, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  secondaryNav: { backgroundColor: '#F5FAF8', borderBottomWidth: 1, borderBottomColor: colors.border },
  secondaryInner: { width: '100%', maxWidth: 1240, alignSelf: 'center', paddingHorizontal: spacing.xl, minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  secondaryButton: { paddingVertical: 12, paddingHorizontal: 4 },
  secondaryText: { color: colors.primaryDark, fontSize: 12, fontWeight: '800' },
  mobileMenuLayer: { position: 'absolute', top: 108, left: 0, right: 0, maxHeight: 620, backgroundColor: colors.surface, zIndex: 55, borderBottomWidth: 1, borderBottomColor: colors.border, ...shadow.card },
  mobileMenu: { padding: spacing.lg, gap: spacing.sm },
  mobileSectionLabel: { color: colors.primary, fontSize: 11, fontWeight: '900', letterSpacing: 1, marginBottom: spacing.sm },
  mobileLink: { minHeight: 48, paddingHorizontal: spacing.md, borderRadius: radius.sm, backgroundColor: colors.surfaceMuted, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  mobileLinkText: { color: colors.text, fontWeight: '800' },
  mobileLogin: { minHeight: 48, borderRadius: radius.md, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center', marginTop: spacing.sm },
  content: { flex: 1, minHeight: 500 },
  pressed: { opacity: 0.65 },
  footer: { backgroundColor: colors.primaryDark },
  footerInner: { width: '100%', maxWidth: 1240, alignSelf: 'center', padding: spacing.xxl, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: spacing.xl },
  footerIntro: { minWidth: 250, maxWidth: 420, flex: 2 },
  footerBrandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  footerBrand: { color: colors.white, fontSize: 23, fontWeight: '900' },
  footerText: { color: '#C5DDD4', lineHeight: 21 },
  footerColumn: { minWidth: 130, gap: spacing.sm },
  footerTitle: { color: colors.white, fontSize: 15, fontWeight: '900' },
  footerLink: { color: '#CFE6DD', lineHeight: 22 },
  footerCallout: { minWidth: 230, maxWidth: 300, borderRadius: radius.md, backgroundColor: '#0C5E44', padding: spacing.lg, gap: spacing.sm },
  copyright: { borderTopWidth: 1, borderTopColor: '#2B745D', padding: spacing.lg, alignItems: 'center' },
  copyrightText: { color: '#AFCFC3', fontSize: 12 },
})
