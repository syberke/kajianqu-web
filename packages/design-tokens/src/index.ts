export const colors = {
  primary: '#1B845E',
  primaryDark: '#0F6246',
  primarySoft: '#EAF5F0',
  gold: '#D6B000',
  goldSoft: '#FFF6D4',
  background: '#FAFCFB',
  surface: '#FFFFFF',
  surfaceMuted: '#F0F5F3',
  text: '#121A17',
  textMuted: '#6D7873',
  border: '#E2EAE7',
  danger: '#B42318',
  dangerSoft: '#FEE4E2',
  warning: '#B54708',
  warningSoft: '#FEF0C7',
  success: '#027A48',
  successSoft: '#D1FADF',
  white: '#FFFFFF',
  overlay: 'rgba(11, 81, 54, 0.55)',
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const

export const radius = {
  sm: 8,
  md: 16,
  lg: 22,
  pill: 999,
} as const

export const shadow = {
  card: {
    shadowColor: '#123C2E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 2,
  },
} as const

export const breakpoints = {
  mobile: 360,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
} as const

export type AppColors = typeof colors
