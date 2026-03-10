import { useState } from 'react'
import { Card } from '../../components/ui/Card'
import { scenarios } from '../../data/mockData'
import { fmtK, COLORS } from '../../lib/utils'
import { wellnessScore } from '../../data/mockData'

export function ScenarioSection() {
  const [sel, setSel] = useState<string | null>(null)

  const crashActions = [
    { a: 'Increase cash buffer to 20% of portfolio', p: 'Critical', c: COLORS.rose },
    { a: 'Avoid panic selling — stay in diversified ETFs', p: 'Important', c: COLORS.amber },
    { a: 'Review private asset valuations post-recovery', p: 'Moderate', c: COLORS.primary },
    { a: 'Rebalance equity allocation toward bonds', p: 'Moderate', c: COLORS.primary },
  ]

  const crashStats = [
    ['New Wellness Score', '52/100', COLORS.rose],
    ['Liquidity Left', '$89K', COLORS.amber],
    ['Avg. Recovery', '2.3 yrs', COLORS.mint],
    ['Score Drop', `-${wellnessScore - 52} pts`, COLORS.purple],
  ] as const

  const selectedScenario = sel != null ? scenarios.find((s) => s.id === sel) : null

  return (
    <div className="flex flex-col gap-4">
      <Card className="bg-[#f0f8fa]">
        <div className="mb-1 text-sm font-semibold text-[#0d1117]">
          Scenario Lab
        </div>
        <p className="max-w-[620px] text-[12px] leading-relaxed text-[#3a5260]">
          Simulate &quot;what if&quot; events against your live portfolio. Select
          a scenario to explore its impact on your net worth and Wellness Score.
        </p>
      </Card>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {scenarios.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSel(sel === s.id ? null : s.id)}
            className="flex flex-col items-start gap-2.5 rounded-xl border p-4 text-left transition-all"
            style={{
              background: sel === s.id ? `${s.color}10` : COLORS.card,
              borderColor: sel === s.id ? s.color : COLORS.border,
              boxShadow: sel === s.id ? `0 2px 12px ${s.color}20` : 'none',
            }}
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl border"
              style={{
                background: `${s.color}12`,
                borderColor: `${s.color}22`,
              }}
            >
              <s.Icon size={18} style={{ color: s.color }} />
            </div>
            <div>
              <div className="mb-0.5 text-[12px] font-semibold text-[#0d1117]">
                {s.title}
              </div>
              <div className="text-[11px] text-[#3a5260]">{s.desc}</div>
            </div>
          </button>
        ))}
      </div>

      {sel === 'crash' && (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <Card>
            <div className="mb-1 text-sm font-semibold text-[#0d1117]">
              Market Crash Result
            </div>
            <div className="mb-4 text-[11px] text-[#7a9fad]">
              -30% equities · -50% crypto applied
            </div>
            <div className="mb-4 flex justify-between">
              <div>
                <div className="mb-1 text-[10px] uppercase tracking-wider text-[#7a9fad]">
                  Current
                </div>
                <div className="text-[22px] font-bold text-[#0d1117]">
                  {fmtK(1024000)}
                </div>
              </div>
              <div className="text-right">
                <div className="mb-1 text-[10px] uppercase tracking-wider text-[#7a9fad]">
                  Post-Crash
                </div>
                <div className="text-[22px] font-bold text-[#d44a4a]">
                  {fmtK(752000)}
                </div>
              </div>
            </div>
            <div className="mb-4 flex justify-between rounded-lg border border-[#d44a4a]/0.09 bg-[rgba(212,74,74,0.10)] px-3.5 py-2.5">
              <span className="text-[12px] text-[#3a5260]">Total Impact</span>
              <span className="text-[12px] font-bold text-[#d44a4a]">
                -$272K (-26.6%)
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {crashStats.map(([label, value, col], i) => (
                <div
                  key={i}
                  className="rounded-lg border border-[#cae7ee] bg-[#f0f8fa] p-3"
                >
                  <div className="mb-1 text-[10px] text-[#7a9fad]">{label}</div>
                  <div className="text-base font-bold" style={{ color: col }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <div className="mb-3 text-sm font-semibold text-[#0d1117]">
              Recommended Actions
            </div>
            <div className="flex flex-col gap-2">
              {crashActions.map((r, i) => (
                <div
                  key={i}
                  className="flex gap-2.5 rounded-xl border border-[#cae7ee] bg-[#f0f8fa] p-3"
                >
                  <div
                    className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border"
                    style={{
                      background: `${r.c}12`,
                      borderColor: `${r.c}22`,
                    }}
                  >
                    <span className="text-[11px] font-bold" style={{ color: r.c }}>
                      {i + 1}
                    </span>
                  </div>
                  <div>
                    <div className="text-[12px] font-medium leading-snug text-[#0d1117]">
                      {r.a}
                    </div>
                    <div
                      className="mt-0.5 text-[10px] font-semibold"
                      style={{ color: r.c }}
                    >
                      {r.p}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {sel != null && sel !== 'crash' && selectedScenario != null && (
        <Card className="py-12 text-center">
          <div className="mb-1.5 text-[15px] font-semibold text-[#0d1117]">
            {selectedScenario.title} Scenario
          </div>
          <p className="mb-5 text-[12px] leading-relaxed text-[#3a5260]">
            Configure inputs to run this simulation against your current
            portfolio.
          </p>
          <button
            type="button"
            className="rounded-lg border-none bg-[#55b2c9] px-7 py-2.5 text-[13px] font-semibold text-white shadow-[0_2px_10px_rgba(85,178,201,0.28)]"
          >
            Configure & Run Simulation
          </button>
        </Card>
      )}
    </div>
  )
}
