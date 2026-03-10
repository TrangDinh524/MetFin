import { Bell, LogOut, Plus } from 'lucide-react'
import { useFinanceStore } from '../../store/useFinanceStore'
import { MobileMenuButton } from './MobileMenuButton'

const titles: Record<string, string> = {
  dashboard: 'Dashboard',
  assets: 'Asset Details',
  debt: 'Debt Details',
  scenarios: 'Scenario Lab',
  insights: 'Insights & Actions',
  settings: 'Settings & Profile',
}

interface HeaderProps {
  onOpenMenu?: () => void
}

export function Header({ onOpenMenu }: HeaderProps) {
  const section = useFinanceStore((s) => s.section)
  const user = useFinanceStore((s) => s.user)
  const logout = useFinanceStore((s) => s.logout)
  const base = section.split('-')[0] ?? 'dashboard'
  const subPage = section.includes('-') ? section.split('-')[1] : null
  const title = titles[base] ?? 'Dashboard'
  const subTitle = subPage
    ? subPage.charAt(0).toUpperCase() + subPage.slice(1)
    : null

  return (
    <header className="flex h-[58px] flex-shrink-0 items-center justify-between border-b border-[#cae7ee] bg-white px-7">
      <div className="flex items-center gap-2">
        {onOpenMenu != null && <MobileMenuButton onClick={onOpenMenu} />}
        <div className="flex items-center gap-1.5">
        <span className="text-[15px] font-bold text-[#0d1117]">{title}</span>
        {subTitle != null && (
          <span className="text-[12px] text-[#7a9fad]">/ {subTitle}</span>
        )}
        </div>
      </div>
      <div className="flex items-center gap-3.5">
        <span className="text-[11px] font-medium text-[#7a9fad]">
          Mon, 9 Mar 2026
        </span>
        <button
          type="button"
          className="relative rounded-lg border border-[#cae7ee] bg-[#f0f8fa] p-1.5"
          aria-label="Notifications"
        >
          <Bell size={15} className="text-[#3a5260]" />
          <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full border-2 border-white bg-[#d44a4a]" />
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg border-none bg-[#55b2c9] px-4 py-2 text-[12px] font-semibold text-white shadow-[0_2px_10px_rgba(85,178,201,0.30)]"
        >
          <Plus size={13} />
          Add Asset
        </button>
        {user && (
          <div className="flex items-center gap-2 border-l border-[#cae7ee] pl-3.5">
            {user.picture && (
              <img
                src={user.picture}
                alt={user.name}
                className="h-7 w-7 rounded-full border border-[#cae7ee]"
              />
            )}
            <span className="text-[12px] font-medium text-[#3a5260] max-w-[120px] truncate hidden sm:block">
              {user.name}
            </span>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-[#cae7ee] bg-[#f0f8fa] p-1.5"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut size={14} className="text-[#3a5260]" />
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
