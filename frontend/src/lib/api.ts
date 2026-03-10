/**
 * MetFin API service — connects frontend to the FastAPI backend.
 * In dev, Vite proxies /api → http://127.0.0.1:8000.
 * In production (Vercel), /api routes to the serverless function.
 */

const BASE = '/api'

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`)
  return res.json() as Promise<T>
}

async function post<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    ...(body ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}),
  })
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`)
  return res.json() as Promise<T>
}

// ── Response types matching backend schemas ───────────────────────

export interface DashboardStats {
  netWorth: number
  netWorthChange: number
  totalAssets: number
  totalAssetsChange: number
  totalLiabilities: number
  totalLiabilitiesChange: number
}

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

export interface ApiDebtItem {
  name: string
  type: string
  balance: number
  monthly: number
  rate: number
}

export interface DashboardData {
  stats: DashboardStats
  netWorthHistory: NetWorthPoint[]
  assetAllocation: AssetAllocItem[]
  debtItems: ApiDebtItem[]
}

export interface ApiHolding {
  id: string
  name: string
  ticker: string
  shares: number
  currentPrice: number
  value: number
  costBasis: number
  gain: number
  gainPct: number
  sector: string
  lastUpdated: string
}

export interface InvestmentSummary {
  totalValue: number
  todayGain: number
  todayGainPct: number
  allTimeGain: number
  allTimeGainPct: number
  liquidity: string
  volatility: string
  allocation: Record<string, number>
  geographic: Record<string, number>
  sectors: Record<string, number>
}

export interface InvestmentData {
  summary: InvestmentSummary
  holdings: ApiHolding[]
}

export interface BankAccount {
  id: string
  bankName: string
  accountType: string
  balance: number
  apy: number
  monthlyAvgBalance: number
  fdicInsured: number
  maturityDate: string | null
  lastUpdated: string
}

export interface BankingSummary {
  totalBalance: number
  accountTypeMix: Record<string, number>
  fdicCovered: number
  fdicExposed: number
  fdicCoveredPct: number
  liquidity: string
  volatility: string
}

export interface BankingData {
  summary: BankingSummary
  accounts: BankAccount[]
}

export interface CryptoHolding {
  id: string
  name: string
  symbol: string
  quantity: number
  currentPrice: number
  value: number
  costBasis: number
  gain: number
  gainPct: number
  walletAddress: string
  chain: string
  type: string | null
  lastUpdated: string
}

export interface CryptoSummary {
  totalValue: number
  assetMix: Record<string, number>
  walletsTracked: number
  liquidity: string
  volatility: string
}

export interface CryptoData {
  summary: CryptoSummary
  holdings: CryptoHolding[]
}

export interface SubScoreApi {
  name: string
  score: number
  weight: number
  description: string
  color: string
}

export interface WellnessData {
  score: number
  label: string
  subScores: SubScoreApi[]
}

export interface InsightApi {
  id: number
  sev: 'critical' | 'warning' | 'tip'
  icon: string
  title: string
  desc: string
  action: string
  color: string
}

export interface InsightsData {
  insights: InsightApi[]
  counts: { critical: number; warning: number; tip: number }
}

export interface ScenarioOption {
  id: string
  icon: string
  title: string
  desc: string
  color: string
}

export interface ActionItem {
  action: string
  priority: string
  color: string
}

export interface ScenarioStat {
  label: string
  value: string
  color: string
}

export interface ScenarioResult {
  title: string
  subtitle: string
  currentNetWorth: number
  projectedNetWorth: number
  impact: number
  impactPct: number
  stats: ScenarioStat[]
  actions: ActionItem[]
}

export interface ScenarioRunData {
  scenario: ScenarioOption
  result: ScenarioResult
}

export interface ScenarioListData {
  scenarios: ScenarioOption[]
}

// ── API calls ─────────────────────────────────────────────────────

export interface GoogleUser {
  email: string
  name: string
  picture: string
  sub: string
}

export interface HoldingCreateInput {
  name: string
  ticker: string
  shares: number
  currentPrice: number
  costBasis: number
  sector: string
}

export const api = {
  loginWithGoogle: (credential: string) =>
    post<GoogleUser>('/auth/google', { credential }),
  getDashboard: () => get<DashboardData>('/dashboard'),
  getInvestments: () => get<InvestmentData>('/investments'),
  addHolding: (body: HoldingCreateInput) => post<InvestmentData>('/investments', body),
  getBanking: () => get<BankingData>('/banking'),
  getCrypto: () => get<CryptoData>('/crypto'),
  getWellness: () => get<WellnessData>('/wellness'),
  getInsights: () => get<InsightsData>('/insights'),
  getScenarios: () => get<ScenarioListData>('/scenarios'),
  runScenario: (id: string, body?: unknown) => post<ScenarioRunData>(`/scenarios/${id}`, body),
}
