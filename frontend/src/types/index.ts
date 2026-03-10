import type { LucideIcon } from 'lucide-react'

export type SectionId =
  | 'dashboard'
  | 'assets'
  | 'assets-public'
  | 'assets-private'
  | 'assets-employer'
  | 'assets-digital'
  | 'assets-bank'
  | 'debt'
  | 'debt-mortgage'
  | 'debt-personal'
  | 'debt-cards'
  | 'debt-student'
  | 'debt-other'
  | 'scenarios'
  | 'insights'
  | 'settings'
  | 'settings-account'
  | 'settings-help'
  | 'settings-prefs'

export interface NetWorthPoint {
  m: string
  v: number
}

export interface AssetAllocItem {
  name: string
  pct: number
  amt: number
  color: string
}

export interface DebtItem {
  name: string
  type: string
  balance: number
  monthly: number
  rate: number
}

export interface SubScore {
  name: string
  score: number
  weight: number
  color: string
  description?: string
}

export type InsightSeverity = 'critical' | 'warning' | 'tip'

export interface Insight {
  sev: InsightSeverity
  Icon: LucideIcon
  title: string
  desc: string
  action: string
  color: string
}

export interface Holding {
  name: string
  tick: string
  shares: number
  value: number
  gain: number
  sector: string
}

export interface Scenario {
  id: string
  Icon: LucideIcon
  title: string
  desc: string
  color: string
}

export interface SectorItem {
  n: string
  v: number
  c: string
}

export interface ConnectedAccount {
  n: string
  t: string
  s: string
  c: string
}
