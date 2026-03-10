import { useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip } from 'recharts'
import { CreditCard, Activity, TrendingDown, Plus } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { AddButton } from '../../components/ui/AddButton'
import { useFinanceStore } from '../../store/useFinanceStore'
import { fmt, fmtK, COLORS } from '../../lib/utils'

const debtColors = [COLORS.primary, COLORS.purple, COLORS.rose, COLORS.rose, COLORS.mint]

export function DebtSection() {
  const dashboard = useFinanceStore((s) => s.dashboard)
  const fetchDashboard = useFinanceStore((s) => s.fetchDashboard)

  useEffect(() => {
    if (!dashboard) fetchDashboard()
  }, [dashboard, fetchDashboard])

  const debtItems = dashboard?.debtItems ?? []
  const isEmpty = debtItems.length === 0
  const total = debtItems.reduce((a, d) => a + d.balance, 0)
  const monthly = debtItems.reduce((a, d) => a + d.monthly, 0)
  const dd = debtItems.map((d, i) => ({
    name: d.name,
    v: d.balance,
    c: debtColors[i],
  }))

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          label="Total Debt"
          value={fmtK(total)}
          change={isEmpty ? 0 : -3.2}
          note={isEmpty ? '—' : 'vs last yr'}
          color={COLORS.rose}
          Icon={CreditCard}
        />
        <StatCard
          label="Monthly Payments"
          value={fmt(monthly)}
          change={0}
          note={isEmpty ? '—' : 'unchanged'}
          color={COLORS.amber}
          Icon={Activity}
        />
        <StatCard
          label="Avg Interest Rate"
          value={isEmpty ? '—' : '6.2%'}
          change={isEmpty ? 0 : -0.4}
          note={isEmpty ? '—' : 'vs last yr'}
          color={COLORS.mint}
          Icon={TrendingDown}
        />
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_262px]">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold text-[#0d1117]">
              Debt Accounts
            </div>
            <AddButton label="Add Debt" color={COLORS.rose} />
          </div>
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#cae7ee]"
                style={{ background: `${COLORS.rose}12` }}
              >
                <CreditCard size={26} style={{ color: COLORS.rose }} />
              </div>
              <div className="text-center">
                <div className="text-[13px] font-semibold text-[#0d1117]">
                  No debt accounts yet
                </div>
                <div className="mt-1 text-[12px] text-[#7a9fad]">
                  Track mortgages, credit cards, loans and more
                </div>
              </div>
              <button
                type="button"
                className="mt-1 flex items-center gap-1.5 rounded-lg px-4 py-2 text-[12px] font-semibold text-white transition-opacity hover:opacity-80"
                style={{ background: COLORS.rose }}
              >
                <Plus size={13} />
                Add your first debt
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {debtItems.map((d, i) => {
                const rc =
                  d.rate > 15 ? COLORS.rose : d.rate > 8 ? COLORS.amber : COLORS.primary
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl border border-[#cae7ee] bg-[#f0f8fa] px-4 py-3"
                  >
                    <div
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-[rgba(0,0,0,0.13)]"
                      style={{ background: `${rc}12` }}
                    >
                      <CreditCard size={14} style={{ color: rc }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold text-[#0d1117]">
                        {d.name}
                      </div>
                      <div className="mt-0.5 text-[11px] text-[#7a9fad]">
                        {d.type}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[13px] font-bold text-[#0d1117]">
                        {fmt(d.balance)}
                      </div>
                      <div className="mt-0.5 text-[11px] text-[#7a9fad]">
                        {fmt(d.monthly)}/mo
                      </div>
                    </div>
                    <div
                      className="flex-shrink-0 rounded-lg border px-2.5 py-1"
                      style={{
                        background: `${rc}12`,
                        borderColor: `${rc}22`,
                      }}
                    >
                      <span className="text-[12px] font-bold" style={{ color: rc }}>
                        {d.rate}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
        <Card className="flex flex-col gap-3">
          <div className="text-sm font-semibold text-[#0d1117]">
            Breakdown
          </div>
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8">
              <div
                className="flex h-[150px] w-[150px] items-center justify-center rounded-full border-4 border-dashed"
                style={{ borderColor: `${COLORS.rose}30` }}
              >
                <span className="text-[11px] text-[#b0c8d0]">No data</span>
              </div>
            </div>
          ) : (
            <>
              <PieChart width={204} height={150}>
                <Pie
                  data={dd}
                  cx={102}
                  cy={70}
                  innerRadius={40}
                  outerRadius={64}
                  dataKey="v"
                  paddingAngle={3}
                >
                  {dd.map((e, i) => (
                    <Cell key={i} fill={e.c} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: COLORS.card,
                    border: `1.5px solid ${COLORS.border}`,
                    borderRadius: 10,
                    fontSize: 12,
                    padding: '8px 12px',
                  }}
                  formatter={(v) => (v != null ? [fmt(Number(v))] : null)}
                />
              </PieChart>
              <div className="flex flex-col gap-1.5">
                {dd.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div
                      className="h-2 w-2 flex-shrink-0 rounded-sm"
                      style={{ background: d.c }}
                    />
                    <span className="flex-1 text-[11px] text-[#3a5260]">
                      {d.name}
                    </span>
                    <span className="text-[11px] font-semibold text-[#0d1117]">
                      {Math.round((d.v / total) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
          <div className="rounded-xl border border-[#cae7ee] bg-[#f0f8fa] p-3 text-center">
            <div className="text-[10px] uppercase tracking-wider text-[#7a9fad]">
              Debt-to-Asset Ratio
            </div>
            <div className="text-2xl font-bold text-[#d4860a]">
              {(dashboard?.stats.totalAssets ?? 0) > 0 && total > 0
                ? ((total / (dashboard?.stats.totalAssets ?? 1)) * 100).toFixed(1)
                : 0}%
            </div>
            <div className="mt-1 text-[11px] text-[#7a9fad]">
              Healthy: below 35%
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
