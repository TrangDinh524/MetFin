import {
  Home,
  TrendingUp,
  CreditCard,
  ChevronDown,
  ChevronRight,
  BarChart2,
  Zap,
  Settings,
  ArrowUpRight,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useEffect } from 'react'
import { useFinanceStore } from '../../store/useFinanceStore'
import type { SectionId } from '../../types'
import { COLORS, fmtK } from '../../lib/utils'

interface NavItem {
  id: SectionId
  Icon: LucideIcon
  label: string
  ek?: 'assets' | 'debt' | 'settings'
  badge?: number
  children?: { id: SectionId; l: string }[]
}

const nav: NavItem[] = [
  { id: 'dashboard', Icon: Home, label: 'Dashboard' },
  {
    id: 'assets',
    Icon: TrendingUp,
    label: 'Asset Details',
    ek: 'assets'
  },
  {
    id: 'debt',
    Icon: CreditCard,
    label: 'Debt Details',
    ek: 'debt'
  },
  { id: 'scenarios', Icon: BarChart2, label: 'Scenario Lab' },
  { id: 'insights', Icon: Zap, label: 'Insights & Actions', badge: 2 },
  {
    id: 'settings',
    Icon: Settings,
    label: 'Settings & Profile',
    ek: 'settings'
  },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { section, expanded, setSection, toggleExpanded } = useFinanceStore()
  const dashboard = useFinanceStore((s) => s.dashboard)
  const wellness = useFinanceStore((s) => s.wellness)
  const fetchDashboard = useFinanceStore((s) => s.fetchDashboard)
  const fetchWellness = useFinanceStore((s) => s.fetchWellness)

  useEffect(() => {
    if (!dashboard) fetchDashboard()
    if (!wellness) fetchWellness()
  }, [dashboard, wellness, fetchDashboard, fetchWellness])

  const base = section.split('-')[0] as SectionId
  const netWorth = dashboard?.stats.netWorth
  const netWorthChange = dashboard?.stats.netWorthChange
  const wellnessScore = wellness?.score

  return (
    <>
      {/* Overlay on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-full w-[242px] flex-col border-r border-[#cae7ee] bg-[#f7fbfc]
          overflow-y-auto transition-transform duration-200 ease-out
          lg:relative lg:translate-x-0 lg:flex-shrink-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        aria-label="Main navigation"
      >
        <div className="border-b border-[#cae7ee] p-4 pb-3">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#55b2c9] text-[15px] font-bold text-white">
              M
            </div>
            <span className="text-lg font-bold tracking-tight text-[#0d1117]">
              MetFin
            </span>
          </div>
          <div className="rounded-[13px] border border-[#cae7ee] bg-white p-3 shadow-[0_1px_4px_rgba(85,178,201,0.07)]">
            <div className="text-[9px] uppercase tracking-wider text-[#7a9fad]">
              Net Worth
            </div>
            <div className="text-[22px] font-bold tracking-tight text-[#0d1117]">
              {netWorth != null ? fmtK(netWorth) : '—'}
            </div>
            <div className="mt-1 flex items-center gap-1">
              {netWorthChange != null ? (
                <>
                  <ArrowUpRight
                    size={11}
                    className={netWorthChange >= 0 ? 'text-[#1cb08a]' : 'text-[#d44a4a]'}
                  />
                  <span
                    className={`text-[11px] font-semibold ${netWorthChange >= 0 ? 'text-[#1cb08a]' : 'text-[#d44a4a]'}`}
                  >
                    {netWorthChange >= 0 ? '+' : ''}
                    {netWorthChange}%
                  </span>
                  <span className="text-[11px] text-[#7a9fad]">YTD</span>
                </>
              ) : (
                <span className="text-[11px] text-[#7a9fad]">Loading…</span>
              )}
            </div>
            <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-[#cae7ee] bg-[#f0f8fa] p-2">
              <span className="text-[10px] text-[#7a9fad]">Wellness</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded bg-[#cae7ee]">
                <div
                  className="h-full rounded bg-[#55b2c9]"
                  style={{ width: `${wellnessScore ?? 0}%` }}
                />
              </div>
              <span className="text-[11px] font-bold text-[#3d96ad]">
                {wellnessScore ?? '—'}
              </span>
            </div>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 p-2">
          {nav.map((item) => {
            const isAct = base === item.id
            const isExp = item.ek ? expanded[item.ek] : false
            return (
              <div key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    if (item.ek) {
                      toggleExpanded(item.ek)
                      setSection(item.id)
                    } else {
                      setSection(item.id)
                    }
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-[13px] transition-colors"
                  style={{
                    background: isAct ? COLORS.primaryMed : 'transparent',
                    color: isAct ? COLORS.primaryDark : COLORS.textDim,
                    borderColor: isAct ? COLORS.borderStrong : 'transparent',
                    fontWeight: isAct ? 600 : 400,
                  }}
                >
                  <item.Icon size={15} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge != null && (
                    <span className="flex h-[17px] w-[17px] items-center justify-center rounded-full bg-[#d44a4a] text-[9px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                  {item.ek != null &&
                    (isExp ? (
                      <ChevronDown size={11} className="text-[#7a9fad]" />
                    ) : (
                      <ChevronRight size={11} className="text-[#7a9fad]" />
                    ))}
                </button>
                {item.children != null && isExp && (
                  <div className="mt-0.5 mb-1">
                    {item.children.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSection(c.id)}
                        className="flex w-full items-center gap-2 rounded-lg py-1.5 pl-9 pr-3 text-left text-[12px] transition-colors"
                        style={{
                          background: section === c.id ? COLORS.primarySoft : 'transparent',
                          color: section === c.id ? COLORS.primaryDark : COLORS.textMuted,
                          fontWeight: section === c.id ? 600 : 400,
                        }}
                      >
                        <div
                          className="h-1.5 w-1.5 flex-shrink-0 rounded-full opacity-40"
                          style={{ background: 'currentColor' }}
                        />
                        {c.l}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
