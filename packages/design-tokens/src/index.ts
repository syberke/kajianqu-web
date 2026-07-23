export const colors = {
  primary: '#157A52',
  primaryDark: '#0B5136',
  primarySoft: '#E7F4EF',
  gold: '#D4A800',
  goldSoft: '#FFF7D6',
  background: '#F7FAF9',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF4F2',
  text: '#14211D',
  textMuted: '#66736E',
  border: '#DDE7E3',
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
  sm: 10,
  md: 16,
  lg: 24,
  pill: 999,
} as const

export const shadow = {
  card: {
    shadowColor: '#0B5136',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
} as const

export const breakpoints = {
  mobile: 360,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
} as const

export type AppColors = typeof colors
