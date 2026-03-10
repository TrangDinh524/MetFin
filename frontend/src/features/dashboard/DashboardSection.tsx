import { useState, useEffect } from 'react'
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Activity,
} from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { ScoreGauge } from '../../components/ui/ScoreGauge'
import { useFinanceStore } from '../../store/useFinanceStore'
import { fmt, fmtK, COLORS } from '../../lib/utils'
import { getIcon } from '../../lib/iconMap'

const tooltipStyle = {
  contentStyle: {
    background: COLORS.card,
    border: `1.5px solid ${COLORS.border}`,
    borderRadius: 10,
    color: COLORS.text,
    fontSize: 12,
    padding: '8px 12px',
    boxShadow: '0 4px 14px rgba(85,178,201,0.12)',
  },
  cursor: false,
}

export function DashboardSection() {
  const [rng, setRng] = useState('1Y')
  const setSection = useFinanceStore((s) => s.setSection)
  const dashboard = useFinanceStore((s) => s.dashboard)
  const wellness = useFinanceStore((s) => s.wellness)
  const insights = useFinanceStore((s) => s.insights)
  const fetchDashboard = useFinanceStore((s) => s.fetchDashboard)
  const fetchWellness = useFinanceStore((s) => s.fetchWellness)
  const fetchInsights = useFinanceStore((s) => s.fetchInsights)

  useEffect(() => {
    fetchDashboard()
    fetchWellness()
    fetchInsights()
  }, [fetchDashboard, fetchWellness, fetchInsights])

  if (!dashboard || !wellness || !insights) {
    return (
      <div className="flex items-center justify-center py-20 text-[#7a9fad]">
        Loading dashboard…
      </div>
    )
  }

  const { stats, netWorthHistory, assetAllocation: assetAlloc } = dashboard
  const { score: wellnessScore, subScores } = wellness
  const insightsList = insights.insights

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Net Worth"
          value={fmtK(stats.netWorth)}
          change={stats.netWorthChange}
          note="YTD"
          color={COLORS.primary}
          Icon={DollarSign}
        />
        <StatCard
          label="Total Assets"
          value={fmtK(stats.totalAssets)}
          change={stats.totalAssetsChange}
          note="vs last yr"
          color={COLORS.mint}
          Icon={TrendingUp}
        />
        <StatCard
          label="Total Liabilities"
          value={fmtK(stats.totalLiabilities)}
          change={stats.totalLiabilitiesChange}
          note="vs last yr"
          color={COLORS.rose}
          Icon={CreditCard}
        />
        <StatCard
          label="Wellness Score"
          value={`${wellnessScore}/100`}
          change={8.1}
          note="vs 6 mo"
          color={COLORS.purple}
          Icon={Activity}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_362px]">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-[#0d1117]">
                Net Worth Trend
              </div>
              <div className="mt-0.5 text-[11px] text-[#7a9fad]">
                12-month performance
              </div>
            </div>
            <div className="flex gap-1">
              {['1M', '3M', '6M', '1Y'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setRng(t)}
                  className="rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-colors"
                  style={{
                    background: rng === t ? COLORS.primary : 'transparent',
                    color: rng === t ? '#fff' : COLORS.textMuted,
                    borderColor: rng === t ? COLORS.primary : COLORS.border,
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={192}>
            <AreaChart
              data={netWorthHistory}
              margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="nwg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.16} />
                  <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="m"
                tick={{ fill: COLORS.textMuted, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => `$${v / 1000}K`}
                tick={{ fill: COLORS.textMuted, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={54}
              />
              <Tooltip
                {...tooltipStyle}
                formatter={(v) => (v != null ? [fmt(Number(v)), 'Net Worth'] : null)}
              />
              <Area
                type="monotone"
                dataKey="v"
                stroke={COLORS.primary}
                strokeWidth={2.5}
                fill="url(#nwg)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="flex flex-col gap-3">
          <div className="text-sm font-semibold text-[#0d1117]">
            Wealth Wellness Score
          </div>
          <div className="flex justify-center">
            <ScoreGauge score={wellnessScore} size={148} />
          </div>
          <div className="flex flex-col gap-2">
            {subScores.map((s) => (
              <div key={s.name} className="flex items-center gap-2">
                <span
                  className="w-28 flex-shrink-0 text-[11px] font-medium text-[#3a5260]"
                >
                  {s.name}
                </span>
                <div className="h-1.5 flex-1 overflow-hidden rounded bg-[#cae7ee]">
                  <div
                    className="h-full rounded"
                    style={{ width: `${s.score}%`, background: s.color }}
                  />
                </div>
                <span
                  className="w-6 text-right text-[11px] font-bold"
                  style={{ color: s.color }}
                >
                  {s.score}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[280px_1fr]">
        <Card>
          <div className="mb-0.5 text-sm font-semibold text-[#0d1117]">
            Asset Allocation
          </div>
          <div className="mb-2.5 text-[11px] text-[#7a9fad]">
            Total: {fmtK(stats.totalAssets)}
          </div>
          <div className="flex justify-center">
            <PieChart width={172} height={146}>
              <Pie
                data={assetAlloc}
                cx={86}
                cy={68}
                innerRadius={38}
                outerRadius={62}
                dataKey="pct"
                paddingAngle={3}
              >
                {assetAlloc.map((e, i) => (
                  <Cell key={i} fill={e.color} />
                ))}
              </Pie>
              <Tooltip
                {...tooltipStyle}
                formatter={(v, _n, props) => {
                  const val = props?.payload
                  if (val == null || v == null) return null
                  return [`${v}% · ${fmtK(val.amt)}`, val.name]
                }}
              />
            </PieChart>
          </div>
          <div className="mt-1 flex flex-col gap-1.5">
            {assetAlloc.map((a, i) => (
              <div
                key={i}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-1.5">
                  <div
                    className="h-2 w-2 rounded-sm"
                    style={{ background: a.color }}
                  />
                  <span className="text-[11px] text-[#3a5260]">{a.name}</span>
                </div>
                <span className="text-[11px] font-semibold text-[#0d1117]">
                  {a.pct}%
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold text-[#0d1117]">
              Top Insights & Actions
            </div>
            <button
              type="button"
              onClick={() => setSection('insights')}
              className="rounded-lg border border-[#cae7ee] bg-[rgba(85,178,201,0.10)] px-3 py-1.5 text-[11px] font-semibold text-[#3d96ad]"
            >
              View All →
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {insightsList.slice(0, 3).map((ins, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 rounded-r-xl border border-[#cae7ee] border-l-[3.5px] bg-[#f0f8fa] p-3"
                style={{ borderLeftColor: ins.color }}
              >
                <div
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{ background: `${ins.color}12` }}
                >
                  {(() => { const Icon = getIcon(ins.icon); return <Icon size={13} style={{ color: ins.color }} /> })()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 text-[12px] font-semibold text-[#0d1117]">
                    {ins.title}
                  </div>
                  <div className="text-[11px] leading-snug text-[#3a5260]">
                    {ins.desc}
                  </div>
                </div>
                <button
                  type="button"
                  className="flex-shrink-0 rounded-lg border px-2.5 py-1 text-[11px] font-semibold"
                  style={{
                    background: `${ins.color}12`,
                    color: ins.color,
                    borderColor: `${ins.color}28`,
                  }}
                >
                  {ins.action}
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
