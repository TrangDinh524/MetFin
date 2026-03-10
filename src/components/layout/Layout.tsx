import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { DashboardSection } from '../../features/dashboard/DashboardSection'
import { AssetsSection } from '../../features/assets/AssetsSection'
import { DebtSection } from '../../features/debt/DebtSection'
import { ScenarioSection } from '../../features/scenarios/ScenarioSection'
import { InsightsSection } from '../../features/insights/InsightsSection'
import { SettingsSection } from '../../features/settings/SettingsSection'
import { useFinanceStore } from '../../store/useFinanceStore'

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const section = useFinanceStore((s) => s.section)
  const base = section.split('-')[0]

  return (
    <div className="flex h-screen overflow-hidden bg-white text-[#0d1117]">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onOpenMenu={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-white px-7 py-5">
          {base === 'dashboard' && <DashboardSection />}
          {base === 'assets' && <AssetsSection />}
          {base === 'debt' && <DebtSection />}
          {base === 'scenarios' && <ScenarioSection />}
          {base === 'insights' && <InsightsSection />}
          {base === 'settings' && <SettingsSection />}
        </main>
      </div>
    </div>
  )
}
