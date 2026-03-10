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
import { InfoTooltip } from '../../components/ui/InfoTooltip'
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

// ── Tooltip definitions ───────────────────────────────────────────
const INFO = {
  netWorth: (
    <>
      <p className="mb-1 font-semibold text-[#0d1117]">Net Worth</p>
      <p>Your total financial net worth at a point in time.</p>
      <p className="mt-1.5 rounded bg-[#f0f8fa] px-2 py-1 font-mono text-[10px]">
        Net Worth = Total Assets − Total Liabilities
      </p>
      <p className="mt-1.5 text-[#7a9fad]">YTD change shown below.</p>
    </>
  ),
  totalAssets: (
    <>
      <p className="mb-1 font-semibold text-[#0d1117]">Total Assets</p>
      <p>Sum of everything you own across all accounts.</p>
      <p className="mt-1.5 rounded bg-[#f0f8fa] px-2 py-1 font-mono text-[10px]">
        Assets = Banking + Investments + Crypto
      </p>
    </>
  ),
  totalLiabilities: (
    <>
      <p className="mb-1 font-semibold text-[#0d1117]">Total Liabilities</p>
      <p>Sum of all outstanding debt balances you owe.</p>
      <p className="mt-1.5 rounded bg-[#f0f8fa] px-2 py-1 font-mono text-[10px]">
        Liabilities = Loans + Credit Cards + Mortgages + Other Debt
      </p>
    </>
  ),
  wellnessScore: (
    <>
      <p className="mb-1 font-semibold text-[#0d1117]">Wealth Wellness Score</p>
      <p>A composite 0–100 score measuring your overall financial health across 5 dimensions.</p>
      <p className="mt-1.5 rounded bg-[#f0f8fa] px-2 py-1 font-mono text-[10px] leading-relaxed">
        Score = Liquidity×25% + Diversification×25%<br />
        + Growth×20% + Risk Resilience×20%<br />
        + Concentration Risk×10%
      </p>
      <p className="mt-1.5 text-[#7a9fad]">80–100 Excellent · 60–79 Good · 40–59 Fair · &lt;40 Poor</p>
    </>
  ),
  wealthWellnessCard: (
    <>
      <p className="mb-1 font-semibold text-[#0d1117]">Wealth Wellness Score</p>
      <p>Weighted average of 5 component scores that together paint a complete picture of your financial health.</p>
      <p className="mt-1.5 rounded bg-[#f0f8fa] px-2 py-1 font-mono text-[10px] leading-relaxed">
        Score = Liquidity×25% + Diversification×25%<br />
        + Growth×20% + Risk Resilience×20%<br />
        + Concentration Risk×10%
      </p>
    </>
  ),
  netWorthTrend: (
    <>
      <p className="mb-1 font-semibold text-[#0d1117]">Net Worth Trend</p>
      <p>Historical view of your Net Worth (Assets − Liabilities) over the selected time range.</p>
      <p className="mt-1.5 text-[#7a9fad]">Use the range buttons to zoom in or out.</p>
    </>
  ),
  assetAllocation: (
    <>
      <p className="mb-1 font-semibold text-[#0d1117]">Asset Allocation</p>
      <p>Percentage breakdown of your total assets across major categories.</p>
      <p className="mt-1.5 rounded bg-[#f0f8fa] px-2 py-1 font-mono text-[10px]">
        Category % = Category Value / Total Assets
      </p>
    </>
  ),
  topInsights: (
    <>
      <p className="mb-1 font-semibold text-[#0d1117]">Top Insights & Actions</p>
      <p>AI-generated recommendations based on your current financial data, ranked by severity and potential impact.</p>
    </>
  ),
}

const SUB_SCORE_INFO: Record<string, React.ReactNode> = {
  Liquidity: (
    <>
      <p className="mb-1 font-semibold text-[#0d1117]">Liquidity <span className="font-normal text-[#7a9fad]">(25%)</span></p>
      <p>How quickly you can access your funds in an emergency.</p>
      <p className="mt-1.5 rounded bg-[#f0f8fa] px-2 py-1 font-mono text-[10px]">
        Score = (Bank + Investments) / Net Worth × 100
      </p>
      <p className="mt-1.5 text-[#7a9fad]">Higher = more wealth in immediately accessible accounts.</p>
    </>
  ),
  Diversification: (
    <>
      <p className="mb-1 font-semibold text-[#0d1117]">Diversification <span className="font-normal text-[#7a9fad]">(25%)</span></p>
      <p>How well your wealth is spread across different asset classes.</p>
      <p className="mt-1.5 rounded bg-[#f0f8fa] px-2 py-1 font-mono text-[10px]">
        Score = 100 − (HHI / 100)<br />
        HHI = Σ(each class % of net worth)²
      </p>
      <p className="mt-1.5 text-[#7a9fad]">Lower concentration → higher score.</p>
    </>
  ),
  'Growth Potential': (
    <>
      <p className="mb-1 font-semibold text-[#0d1117]">Growth Potential <span className="font-normal text-[#7a9fad]">(20%)</span></p>
      <p>Expected return potential based on your asset mix.</p>
      <p className="mt-1.5 rounded bg-[#f0f8fa] px-2 py-1 font-mono text-[10px] leading-relaxed">
        High growth (stocks, crypto) → 100 pts<br />
        Medium (bonds, ETFs) → 60 pts<br />
        Low (cash, bank) → 20 pts<br />
        Score = weighted average by allocation
      </p>
    </>
  ),
  'Risk Resilience': (
    <>
      <p className="mb-1 font-semibold text-[#0d1117]">Risk Resilience <span className="font-normal text-[#7a9fad]">(20%)</span></p>
      <p>Ability to withstand financial shocks without selling long-term assets.</p>
      <p className="mt-1.5 rounded bg-[#f0f8fa] px-2 py-1 font-mono text-[10px] leading-relaxed">
        Emergency ratio = min(1, Liquid / (6 × monthly expenses))<br />
        Protection = 100 − volatile assets % × 0.5<br />
        Score = Emergency ratio × Protection
      </p>
      <p className="mt-1.5 text-[#7a9fad]">Volatile = stocks + crypto. Target: 6 months liquid.</p>
    </>
  ),
  'Concentration Risk': (
    <>
      <p className="mb-1 font-semibold text-[#0d1117]">Concentration Risk <span className="font-normal text-[#7a9fad]">(10%)</span></p>
      <p>Starts at 100 and deducts points for dangerous over-concentration.</p>
      <p className="mt-1.5 rounded bg-[#f0f8fa] px-2 py-1 font-mono text-[10px] leading-relaxed">
        −20 if any sector &gt; 40% of net worth<br />
        −10 if any sector &gt; 30% of net worth<br />
        −15 if crypto &gt; 20% of net worth<br />
        −10 if any single holding &gt; 15%
      </p>
    </>
  ),
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
          info={INFO.netWorth}
        />
        <StatCard
          label="Total Assets"
          value={fmtK(stats.totalAssets)}
          change={stats.totalAssetsChange}
          note="vs last yr"
          color={COLORS.mint}
          Icon={TrendingUp}
          info={INFO.totalAssets}
        />
        <StatCard
          label="Total Liabilities"
          value={fmtK(stats.totalLiabilities)}
          change={stats.totalLiabilitiesChange}
          note="vs last yr"
          color={COLORS.rose}
          Icon={CreditCard}
          info={INFO.totalLiabilities}
        />
        <StatCard
          label="Wellness Score"
          value={`${wellnessScore}/100`}
          change={8.1}
          note="vs 6 mo"
          color={COLORS.purple}
          Icon={Activity}
          info={INFO.wellnessScore}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_362px]">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <div className="text-sm font-semibold text-[#0d1117]">Net Worth Trend</div>
                <InfoTooltip content={INFO.netWorthTrend} />
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
          <div className="flex items-center gap-1.5">
            <div className="text-sm font-semibold text-[#0d1117]">Wealth Wellness Score</div>
            <InfoTooltip content={INFO.wealthWellnessCard} />
          </div>
          <div className="flex justify-center">
            <ScoreGauge score={wellnessScore} size={148} />
          </div>
          <div className="flex flex-col gap-2">
            {subScores.map((s) => (
              <div key={s.name} className="flex items-center gap-2">
                <div className="flex w-28 flex-shrink-0 items-center gap-0.5">
                  <span className="text-[11px] font-medium text-[#3a5260]">
                    {s.name}
                  </span>
                  {SUB_SCORE_INFO[s.name] && (
                    <InfoTooltip content={SUB_SCORE_INFO[s.name]} size={10} />
                  )}
                </div>
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
          <div className="mb-0.5 flex items-center gap-1.5">
            <span className="text-sm font-semibold text-[#0d1117]">Asset Allocation</span>
            <InfoTooltip content={INFO.assetAllocation} />
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
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-[#0d1117]">Top Insights & Actions</span>
              <InfoTooltip content={INFO.topInsights} />
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
