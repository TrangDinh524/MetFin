import { create } from 'zustand'
import type { SectionId } from '../types'
import {
  api,
  type GoogleUser,
  type DashboardData,
  type InvestmentData,
  type BankingData,
  type CryptoData,
  type PrivateData,
  type PrivateAssetCreateInput,
  type WellnessData,
  type InsightsData,
  type ScenarioListData,
  type ScenarioRunData,
  type HoldingCreateInput,
  type DebtCreateInput,
  type ChatMessage,
  type UserProfile,
  type ProfileUpdateInput,
} from '../lib/api'

interface FinanceState {
  // Auth
  user: GoogleUser | null
  authLoading: boolean
  loginWithGoogle: (credential: string) => Promise<void>
  loginAsGuest: () => void
  logout: () => void

  section: SectionId
  expanded: { assets: boolean; debt: boolean; settings: boolean }
  setSection: (id: SectionId) => void
  toggleExpanded: (key: 'assets' | 'debt' | 'settings') => void
  dismissedInsights: number[]
  dismissInsight: (index: number) => void
  restoreInsight: (index: number) => void
  restoreAllInsights: () => void

  // API data
  loading: boolean
  dashboard: DashboardData | null
  investments: InvestmentData | null
  banking: BankingData | null
  crypto: CryptoData | null
  privateAssets: PrivateData | null
  wellness: WellnessData | null
  insights: InsightsData | null
  scenarioList: ScenarioListData | null
  scenarioResult: ScenarioRunData | null
  scenarioLoading: boolean

  // Advisor chat
  chatMessages: ChatMessage[]
  chatLoading: boolean
  sendChatMessage: (content: string) => Promise<void>
  clearChat: () => void

  // Fetch actions
  fetchDashboard: () => Promise<void>
  fetchInvestments: () => Promise<void>
  addHolding: (body: HoldingCreateInput) => Promise<void>
  updateHolding: (id: string, body: HoldingCreateInput) => Promise<void>
  deleteHolding: (id: string) => Promise<void>
  addDebt: (body: DebtCreateInput) => Promise<void>
  updateDebt: (id: string, body: DebtCreateInput) => Promise<void>
  deleteDebt: (id: string) => Promise<void>
  fetchBanking: () => Promise<void>
  fetchCrypto: () => Promise<void>
  fetchPrivateAssets: () => Promise<void>
  addPrivateAsset: (body: PrivateAssetCreateInput) => Promise<void>
  updatePrivateAsset: (id: string, body: PrivateAssetCreateInput) => Promise<void>
  deletePrivateAsset: (id: string) => Promise<void>
  profile: UserProfile | null
  fetchProfile: () => Promise<void>
  updateProfile: (body: ProfileUpdateInput) => Promise<void>
  fetchWellness: () => Promise<void>
  fetchInsights: () => Promise<void>
  fetchScenarios: () => Promise<void>
  runScenario: (id: string, body?: unknown) => Promise<void>
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
      // Decode the Google ID token (JWT) payload directly — no backend needed
      const payload = JSON.parse(atob(credential.split('.')[1])) as {
        email: string
        name: string
        picture: string
        sub: string
      }
      const user: GoogleUser = {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        sub: payload.sub,
      }
      localStorage.setItem('metfin_user', JSON.stringify(user))
      set({ user })
    } finally {
      set({ authLoading: false })
    }
  },
  loginAsGuest: () => {
    const guest: GoogleUser = {
      email: 'guest@metfin.app',
      name: 'Guest User',
      picture: '',
      sub: 'guest',
    }
    localStorage.setItem('metfin_user', JSON.stringify(guest))
    set({ user: guest })
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
  restoreInsight: (index) =>
    set((s) => ({
      dismissedInsights: s.dismissedInsights.filter((i) => i !== index),
    })),
  restoreAllInsights: () => set({ dismissedInsights: [] }),

  // API data
  loading: false,
  dashboard: null,
  investments: null,
  banking: null,
  crypto: null,
  privateAssets: null,
  profile: null,
  wellness: null,
  insights: null,
  scenarioList: null,
  scenarioResult: null,
  scenarioLoading: false,

  chatMessages: [],
  chatLoading: false,
  sendChatMessage: async (content: string) => {
    const userMsg: ChatMessage = { role: 'user', content }
    set((s) => ({
      chatMessages: [...s.chatMessages, userMsg],
      chatLoading: true,
    }))
    try {
      const allMessages = [...useFinanceStore.getState().chatMessages]
      const data = await api.chatWithAdvisor(allMessages)
      const assistantMsg: ChatMessage = { role: 'assistant', content: data.reply }
      set((s) => ({ chatMessages: [...s.chatMessages, assistantMsg] }))
    } catch (err) {
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please make sure the OPENAI_API_KEY environment variable is set and try again.',
      }
      set((s) => ({ chatMessages: [...s.chatMessages, errorMsg] }))
    } finally {
      set({ chatLoading: false })
    }
  },
  clearChat: () => set({ chatMessages: [] }),

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
  addHolding: async (body) => {
    set({ loading: true })
    try {
      const data = await api.addHolding(body)
      set({ investments: data })
      // Refresh dashboard so Net Worth / Total Assets stay in sync
      const dash = await api.getDashboard()
      set({ dashboard: dash })
    } finally {
      set({ loading: false })
    }
  },
  updateHolding: async (id, body) => {
    set({ loading: true })
    try {
      const data = await api.updateHolding(id, body)
      set({ investments: data })
      // Refresh dashboard so Net Worth / Total Assets stay in sync
      const dash = await api.getDashboard()
      set({ dashboard: dash })
    } finally {
      set({ loading: false })
    }
  },
  deleteHolding: async (id) => {
    set({ loading: true })
    try {
      const data = await api.deleteHolding(id)
      set({ investments: data })
      // Refresh dashboard so Net Worth / Total Assets stay in sync
      const dash = await api.getDashboard()
      set({ dashboard: dash })
    } finally {
      set({ loading: false })
    }
  },
  addDebt: async (body) => {
    set({ loading: true })
    try {
      await api.addDebt(body)
      // Refresh dashboard so debtItems and stats update
      const data = await api.getDashboard()
      set({ dashboard: data })
    } finally {
      set({ loading: false })
    }
  },
  updateDebt: async (id, body) => {
    set({ loading: true })
    try {
      await api.updateDebt(id, body)
      const data = await api.getDashboard()
      set({ dashboard: data })
    } finally {
      set({ loading: false })
    }
  },
  deleteDebt: async (id) => {
    set({ loading: true })
    try {
      await api.deleteDebt(id)
      const data = await api.getDashboard()
      set({ dashboard: data })
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
  fetchPrivateAssets: async () => {
    set({ loading: true })
    try {
      const data = await api.getPrivate()
      set({ privateAssets: data })
    } finally {
      set({ loading: false })
    }
  },
  addPrivateAsset: async (body) => {
    set({ loading: true })
    try {
      const data = await api.addPrivateAsset(body)
      set({ privateAssets: data })
    } finally {
      set({ loading: false })
    }
  },
  updatePrivateAsset: async (id, body) => {
    set({ loading: true })
    try {
      const data = await api.updatePrivateAsset(id, body)
      set({ privateAssets: data })
    } finally {
      set({ loading: false })
    }
  },
  deletePrivateAsset: async (id) => {
    set({ loading: true })
    try {
      const data = await api.deletePrivateAsset(id)
      set({ privateAssets: data })
    } finally {
      set({ loading: false })
    }
  },
  fetchProfile: async () => {
    try {
      const data = await api.getProfile()
      set({ profile: data })
    } catch {
      // silently fall back to defaults
    }
  },
  updateProfile: async (body) => {
    const data = await api.updateProfile(body)
    set({ profile: data })
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
  runScenario: async (id: string, body?: unknown) => {
    set({ scenarioLoading: true, scenarioResult: null })
    try {
      const data = await api.runScenario(id, body)
      set({ scenarioResult: data })
    } finally {
      set({ scenarioLoading: false })
    }
  },
}))
