import { create } from 'zustand'
import type { SectionId } from '../types'

interface FinanceState {
  section: SectionId
  expanded: { assets: boolean; debt: boolean; settings: boolean }
  setSection: (id: SectionId) => void
  toggleExpanded: (key: 'assets' | 'debt' | 'settings') => void
  dismissedInsights: number[]
  dismissInsight: (index: number) => void
}

export const useFinanceStore = create<FinanceState>((set) => ({
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
}))
