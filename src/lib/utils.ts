export const fmt = (n: number): string => '$' + n.toLocaleString('en-US')
export const fmtK = (n: number): string =>
  n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : `$${(n / 1000).toFixed(0)}K`

export const COLORS = {
  primary: '#55b2c9',
  primaryDark: '#3d96ad',
  primarySoft: 'rgba(85,178,201,0.10)',
  primaryMed: 'rgba(85,178,201,0.16)',
  mint: '#1cb08a',
  mintSoft: 'rgba(28,176,138,0.10)',
  amber: '#d4860a',
  amberSoft: 'rgba(212,134,10,0.10)',
  rose: '#d44a4a',
  roseSoft: 'rgba(212,74,74,0.10)',
  purple: '#7155c9',
  purpleSoft: 'rgba(113,85,201,0.10)',
  border: '#cae7ee',
  borderStrong: '#a8d8e4',
  light: '#cae7ee',
  surface: '#f0f8fa',
  card: '#ffffff',
  text: '#0d1117',
  textDim: '#3a5260',
  textMuted: '#7a9fad',
  sidebar: '#f7fbfc',
  bg: '#ffffff',
} as const
