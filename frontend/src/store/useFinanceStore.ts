import { create } from 'zustand'
import type { SectionId } from '../types'
import {
  api,
  type GoogleUser,
  type DashboardData,
  type InvestmentData,
  type BankingData,
  type CryptoData,
  type WellnessData,
  type InsightsData,
  type ScenarioListData,
  type ScenarioRunData,
} from '../lib/api'

interface FinanceState {
  // Auth
  user: GoogleUser | null
  authLoading: boolean
  loginWithGoogle: (credential: string) => Promise<void>
  logout: () => void

  section: SectionId
  expanded: { assets: boolean; debt: boolean; settings: boolean }
  setSection: (id: SectionId) => void
  toggleExpanded: (key: 'assets' | 'debt' | 'settings') => void
  dismissedInsights: number[]
  dismissInsight: (index: number) => void

  // API data
  loading: boolean
  dashboard: DashboardData | null
  investments: InvestmentData | null
  banking: BankingData | null
  crypto: CryptoData | null
  wellness: WellnessData | null
  insights: InsightsData | null
  scenarioList: ScenarioListData | null
  scenarioResult: ScenarioRunData | null
  scenarioLoading: boolean

  // Fetch actions
  fetchDashboard: () => Promise<void>
  fetchInvestments: () => Promise<void>
  fetchBanking: () => Promise<void>
  fetchCrypto: () => Promise<void>
  fetchWellness: () => Promise<void>
  fetchInsights: () => Promise<void>
  fetchScenarios: () => Promise<void>
  runScenario: (id: string) => Promise<void>
}

export const useFinanceStore = create<FinanceState>((set) => ({
  // Auth
  user: (() => {
    try { return JSON.parse(localStorage.getItem('metfin_user') ?? 'null') } catch { return null }
  })(),
  authLoading: false,
  loginWithGoogle: async (credential: string) => {
    set({ authLoading: true })
    try {
      const user = await api.loginWithGoogle(credential)
      localStorage.setItem('metfin_user', JSON.stringify(user))
      set({ user })
    } finally {
      set({ authLoading: false })
    }
  },
  logout: () => {
    localStorage.removeItem('metfin_user')
    set({ user: null })
  },

  section: 'dashboard',
  expanded: { assets: false, debt: false, settings: false },
  setSection: (id) => set({ section: id }),
  toggleExpanded: (key) =>
    set((s) => ({ expanded: { ...s.expanded, [key]: !s.expanded[key] } })),
  dismissedInsights: [],
  dismissInsight: (index) =>
    set((s) => ({
      dismissedInsights: [...s.dismissedInsights, index].sort((a, b) => a - b),
    })),

  // API data
  loading: false,
  dashboard: null,
  investments: null,
  banking: null,
  crypto: null,
  wellness: null,
  insights: null,
  scenarioList: null,
  scenarioResult: null,
  scenarioLoading: false,

  fetchDashboard: async () => {
    set({ loading: true })
    try {
      const data = await api.getDashboard()
      set({ dashboard: data })
    } finally {
      set({ loading: false })
    }
  },
  fetchInvestments: async () => {
    set({ loading: true })
    try {
      const data = await api.getInvestments()
      set({ investments: data })
    } finally {
      set({ loading: false })
    }
  },
  fetchBanking: async () => {
    set({ loading: true })
    try {
      const data = await api.getBanking()
      set({ banking: data })
    } finally {
      set({ loading: false })
    }
  },
  fetchCrypto: async () => {
    set({ loading: true })
    try {
      const data = await api.getCrypto()
      set({ crypto: data })
    } finally {
      set({ loading: false })
    }
  },
  fetchWellness: async () => {
    set({ loading: true })
    try {
      const data = await api.getWellness()
      set({ wellness: data })
    } finally {
      set({ loading: false })
    }
  },
  fetchInsights: async () => {
    set({ loading: true })
    try {
      const data = await api.getInsights()
      set({ insights: data })
    } finally {
      set({ loading: false })
    }
  },
  fetchScenarios: async () => {
    set({ loading: true })
    try {
      const data = await api.getScenarios()
      set({ scenarioList: data })
    } finally {
      set({ loading: false })
    }
  },
  runScenario: async (id: string) => {
    set({ scenarioLoading: true, scenarioResult: null })
    try {
      const data = await api.runScenario(id)
      set({ scenarioResult: data })
    } finally {
      set({ scenarioLoading: false })
    }
  },
}))
