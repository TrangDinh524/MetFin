import { useState } from 'react'
import { PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, ArrowUpRight, Activity, Plus } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { AddButton } from '../../components/ui/AddButton'
import { holdings } from '../../data/mockData'
import { fmt, fmtK, COLORS } from '../../lib/utils'
import type { SectorItem } from '../../types'
import { useFinanceStore } from '../../store/useFinanceStore'

const assetTabs = [
  { id: 'public', label: 'Public Investments', total: fmtK(389120) },
  { id: 'private', label: 'Private Assets', total: fmtK(184320) },
  { id: 'employer', label: 'Employer Equity', total: fmtK(225280) },
  { id: 'digital', label: 'Digital Assets', total: fmtK(122880) },
  { id: 'bank', label: 'Bank Deposits', total: fmtK(102400) },
]

const sectors: SectorItem[] = [
  { n: 'Technology', v: 65, c: COLORS.primary },
  { n: 'ETF Blended', v: 19, c: COLORS.purple },
  { n: 'Bonds', v: 9, c: COLORS.mint },
  { n: 'Other', v: 7, c: COLORS.amber },
]

export function AssetsSection() {
  const section = useFinanceStore((s) => s.section)
  const subPage = section.startsWith('assets-') ? section.replace('assets-', '') : 'public'
  const [active, setActive] = useState(subPage)

  const currentTab = assetTabs.find((t) => t.id === active)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 overflow-x-auto pb-0.5">
        {assetTabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActive(t.id)}
            className="flex flex-shrink-0 flex-col items-start gap-0.5 rounded-xl border px-4 py-2 text-left text-[12px] transition-all"
            style={{
              background: active === t.id ? COLORS.primary : COLORS.card,
              color: active === t.id ? '#fff' : COLORS.textDim,
              borderColor: active === t.id ? COLORS.primary : COLORS.border,
              fontWeight: active === t.id ? 600 : 400,
              boxShadow: active === t.id ? '0 2px 8px rgba(85,178,201,0.25)' : 'none',
            }}
          >
            <span>{t.label}</span>
            <span
              className="text-[11px] font-medium"
              style={{
                color: active === t.id ? 'rgba(255,255,255,0.72)' : COLORS.textMuted,
              }}
            >
              {t.total}
            </span>
          </button>
        ))}
      </div>

      {active === 'public' ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Portfolio Value"
              value={fmtK(389120)}
              change={11.2}
              note="YTD"
              color={COLORS.primary}
              Icon={TrendingUp}
            />
            <StatCard
              label="Today's Gain"
              value="+$1,247"
              change={0.32}
              note="today"
              color={COLORS.mint}
              Icon={ArrowUpRight}
            />
            <StatCard
              label="All-Time Gain"
              value="+$42,100"
              change={12.1}
              note="total"
              color={COLORS.purple}
              Icon={Activity}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_252px]">
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm font-semibold text-[#0d1117]">
                  Holdings
                </div>
                <AddButton label="Add Holding" color={COLORS.primary} />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-[#cae7ee]">
                      {['Asset', 'Ticker', 'Shares', 'Value', 'Gain / Loss', 'Sector'].map(
                        (h) => (
                          <th
                            key={h}
                            className="px-2.5 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wider text-[#7a9fad]"
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map((h, i) => (
                      <tr
                        key={i}
                        className="border-b border-[#cae7ee]/30 transition-colors hover:bg-[#f0f8fa]"
                      >
                        <td className="px-2.5 py-2.5 text-[13px] font-medium text-[#0d1117]">
                          {h.name}
                        </td>
                        <td className="px-2.5 py-2.5">
                          <span className="rounded-md border border-[#cae7ee] bg-[rgba(85,178,201,0.10)] px-2 py-0.5 text-[11px] font-bold text-[#3d96ad]">
                            {h.tick}
                          </span>
                        </td>
                        <td className="px-2.5 py-2.5 text-[12px] text-[#3a5260]">
                          {h.shares}
                        </td>
                        <td className="px-2.5 py-2.5 text-[13px] font-semibold text-[#0d1117]">
                          {fmt(h.value)}
                        </td>
                        <td className="px-2.5 py-2.5">
                          <span
                            className={`text-[12px] font-bold ${h.gain >= 0 ? 'text-[#1cb08a]' : 'text-[#d44a4a]'}`}
                          >
                            {h.gain >= 0 ? '+' : ''}
                            {h.gain}%
                          </span>
                        </td>
                        <td className="px-2.5 py-2.5">
                          <span className="rounded-md bg-[#cae7ee] px-2 py-0.5 text-[11px] text-[#3a5260]">
                            {h.sector}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
            <Card className="flex flex-col gap-3">
              <div className="text-sm font-semibold text-[#0d1117]">
                Sector Breakdown
              </div>
              <PieChart width={196} height={148}>
                <Pie
                  data={sectors}
                  cx={98}
                  cy={68}
                  innerRadius={38}
                  outerRadius={62}
                  dataKey="v"
                  paddingAngle={3}
                >
                  {sectors.map((s, i) => (
                    <Cell key={i} fill={s.c} />
                  ))}
                </Pie>
              </PieChart>
              <div className="flex flex-col gap-2">
                {sectors.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-1.5">
                      <div
                        className="h-2 w-2 rounded-sm"
                        style={{ background: s.c }}
                      />
                      <span className="text-[11px] text-[#3a5260]">{s.n}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-[#0d1117]">
                      {s.v}%
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      ) : (
        <Card className="flex flex-col items-center gap-3 p-14">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#cae7ee]"
            style={{ background: COLORS.primarySoft }}
          >
            <Plus size={22} style={{ color: COLORS.primary }} />
          </div>
          <div className="text-[15px] font-semibold text-[#0d1117]">
            {currentTab?.label}
          </div>
          <p className="max-w-[300px] text-center text-[12px] leading-relaxed text-[#3a5260]">
            Connect an account via API or add assets manually to start tracking
            this category.
          </p>
          <div className="mt-1 flex gap-2">
            <button
              type="button"
              className="rounded-lg border-none bg-[#55b2c9] px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_2px_8px_rgba(85,178,201,0.28)]"
            >
              Connect API
            </button>
            <button
              type="button"
              className="rounded-lg border border-[#cae7ee] bg-white px-5 py-2.5 text-[13px] font-semibold text-[#0d1117]"
            >
              Manual Entry
            </button>
          </div>
        </Card>
      )}
    </div>
  )
}
