import {
  Zap,
  AlertTriangle,
  Target,
  RefreshCw,
  Shield,
  TrendingDown,
  Building,
} from 'lucide-react'
import type { NetWorthPoint, AssetAllocItem, DebtItem, SubScore, Insight, Holding, Scenario } from '../types'
import { COLORS } from '../lib/utils'

export const netWorthHistory: NetWorthPoint[] = [
  { m: 'Jan', v: 820000 }, { m: 'Feb', v: 843000 }, { m: 'Mar', v: 831000 }, { m: 'Apr', v: 867000 },
  { m: 'May', v: 889000 }, { m: 'Jun', v: 904000 }, { m: 'Jul', v: 886000 }, { m: 'Aug', v: 921000 },
  { m: 'Sep', v: 947000 }, { m: 'Oct', v: 969000 }, { m: 'Nov', v: 958000 }, { m: 'Dec', v: 1024000 },
]

export const assetAlloc: AssetAllocItem[] = [
  { name: 'Public Investments', pct: 38, amt: 389120, color: COLORS.primary },
  { name: 'Employer Equity', pct: 22, amt: 225280, color: COLORS.purple },
  { name: 'Private Assets', pct: 18, amt: 184320, color: COLORS.mint },
  { name: 'Digital Assets', pct: 12, amt: 122880, color: COLORS.amber },
  { name: 'Bank Deposits', pct: 10, amt: 102400, color: COLORS.rose },
]

export const debtItems: DebtItem[] = [
  { name: 'Primary Mortgage', type: 'Mortgage', balance: 320000, monthly: 2100, rate: 3.8 },
  { name: 'Tesla Model 3', type: 'Auto', balance: 18500, monthly: 420, rate: 5.2 },
  { name: 'Chase Sapphire', type: 'Card', balance: 2800, monthly: 140, rate: 19.9 },
  { name: 'Amex Gold', type: 'Card', balance: 1400, monthly: 70, rate: 22.4 },
  { name: 'Federal Loans', type: 'Student', balance: 22000, monthly: 280, rate: 4.5 },
]

export const subScores: SubScore[] = [
  { name: 'Liquidity', score: 62, weight: 25, color: COLORS.amber },
  { name: 'Diversification', score: 78, weight: 25, color: COLORS.primary },
  { name: 'Growth Potential', score: 85, weight: 20, color: COLORS.mint },
  { name: 'Risk Resilience', score: 71, weight: 20, color: COLORS.purple },
  { name: 'Concentration Risk', score: 68, weight: 10, color: COLORS.rose },
]

export const wellnessScore = Math.round(
  subScores.reduce((a, s) => a + (s.score * s.weight) / 100, 0)
)

export const insightsList: Insight[] = [
  { sev: 'critical', Icon: Zap, title: 'Low Liquidity Buffer', desc: 'Tier 1 assets cover only 2.8 months of expenses. Target: 6 months.', action: 'Boost Cash', color: COLORS.rose },
  { sev: 'warning', Icon: AlertTriangle, title: 'Employer Stock Over-Concentration', desc: 'Your equity represents 22% of net worth, above the 15% safe threshold.', action: 'Review Plan', color: COLORS.amber },
  { sev: 'tip', Icon: Target, title: 'Uncaptured 401(k) Match', desc: 'Contributing 4% but employer matches up to 6% — $3,200/yr unclaimed.', action: 'Fix Now', color: COLORS.mint },
  { sev: 'warning', Icon: RefreshCw, title: 'Stale Private Asset Valuation', desc: 'Series B startup investment was last updated 94 days ago.', action: 'Update', color: COLORS.amber },
  { sev: 'tip', Icon: Shield, title: 'FDIC Exposure Detected', desc: '$27,400 at First National exceeds the $250k FDIC limit.', action: 'Spread Deposits', color: COLORS.purple },
]

export const holdings: Holding[] = [
  { name: 'Apple Inc.', tick: 'AAPL', shares: 145, value: 38612, gain: 12.4, sector: 'Tech' },
  { name: 'Vanguard S&P 500', tick: 'VOO', shares: 87, value: 44283, gain: 8.2, sector: 'ETF' },
  { name: 'Microsoft', tick: 'MSFT', shares: 52, value: 22412, gain: 15.7, sector: 'Tech' },
  { name: 'iShares Bonds', tick: 'AGG', shares: 210, value: 21945, gain: -1.3, sector: 'Bonds' },
  { name: 'Alphabet', tick: 'GOOGL', shares: 31, value: 58063, gain: 22.1, sector: 'Tech' },
]

export const scenarios: Scenario[] = [
  { id: 'crash', Icon: TrendingDown, title: 'Market Crash', desc: '-30% equities · -50% crypto', color: COLORS.rose },
  { id: 'jobloss', Icon: AlertTriangle, title: 'Job Loss', desc: 'Runway & liquidation plan', color: COLORS.amber },
  { id: 'purchase', Icon: Building, title: 'Major Purchase', desc: 'Home, car or large expense', color: COLORS.primary },
  { id: 'retire', Icon: Target, title: 'Retirement', desc: 'Monte Carlo projection', color: COLORS.mint },
  { id: 'windfall', Icon: Zap, title: 'Windfall', desc: 'Inheritance, exit or bonus', color: COLORS.purple },
]
