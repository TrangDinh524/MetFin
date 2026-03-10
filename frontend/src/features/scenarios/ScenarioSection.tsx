import { useState, useEffect } from 'react'
import { Card } from '../../components/ui/Card'
import { fmtK, COLORS } from '../../lib/utils'
import { getIcon } from '../../lib/iconMap'
import { useFinanceStore } from '../../store/useFinanceStore'

export function ScenarioSection() {
  const [sel, setSel] = useState<string | null>(null)

  const scenarioList = useFinanceStore((s) => s.scenarioList)
  const scenarioResult = useFinanceStore((s) => s.scenarioResult)
  const scenarioLoading = useFinanceStore((s) => s.scenarioLoading)
  const fetchScenarios = useFinanceStore((s) => s.fetchScenarios)
  const runScenario = useFinanceStore((s) => s.runScenario)

  useEffect(() => {
    fetchScenarios()
  }, [fetchScenarios])

  const handleSelect = (id: string) => {
    if (sel === id) {
      setSel(null)
    } else {
      setSel(id)
      runScenario(id)
    }
  }

  const scenarios = scenarioList?.scenarios ?? []
  const result = scenarioResult

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
        {scenarios.map((s) => {
          const Icon = getIcon(s.icon)
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => handleSelect(s.id)}
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
                <Icon size={18} style={{ color: s.color }} />
              </div>
              <div>
                <div className="mb-0.5 text-[12px] font-semibold text-[#0d1117]">
                  {s.title}
                </div>
                <div className="text-[11px] text-[#3a5260]">{s.desc}</div>
              </div>
            </button>
          )
        })}
      </div>

      {sel != null && scenarioLoading && (
        <div className="flex items-center justify-center py-12 text-[#7a9fad]">
          Running simulation…
        </div>
      )}

      {sel != null && !scenarioLoading && result && (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <Card>
            <div className="mb-1 text-sm font-semibold text-[#0d1117]">
              {result.result.title}
            </div>
            <div className="mb-4 text-[11px] text-[#7a9fad]">
              {result.result.subtitle}
            </div>
            <div className="mb-4 flex justify-between">
              <div>
                <div className="mb-1 text-[10px] uppercase tracking-wider text-[#7a9fad]">
                  Current
                </div>
                <div className="text-[22px] font-bold text-[#0d1117]">
                  {fmtK(result.result.currentNetWorth)}
                </div>
              </div>
              <div className="text-right">
                <div className="mb-1 text-[10px] uppercase tracking-wider text-[#7a9fad]">
                  Projected
                </div>
                <div
                  className="text-[22px] font-bold"
                  style={{ color: result.result.impact < 0 ? '#d44a4a' : '#1cb08a' }}
                >
                  {fmtK(result.result.projectedNetWorth)}
                </div>
              </div>
            </div>
            <div
              className="mb-4 flex justify-between rounded-lg border px-3.5 py-2.5"
              style={{
                borderColor: result.result.impact < 0 ? 'rgba(212,74,74,0.09)' : 'rgba(28,176,138,0.09)',
                background: result.result.impact < 0 ? 'rgba(212,74,74,0.10)' : 'rgba(28,176,138,0.10)',
              }}
            >
              <span className="text-[12px] text-[#3a5260]">Total Impact</span>
              <span
                className="text-[12px] font-bold"
                style={{ color: result.result.impact < 0 ? '#d44a4a' : '#1cb08a' }}
              >
                {result.result.impact < 0 ? '-' : '+'}${Math.abs(result.result.impact / 1000).toFixed(0)}K ({result.result.impactPct.toFixed(1)}%)
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {result.result.stats.map((stat, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-[#cae7ee] bg-[#f0f8fa] p-3"
                >
                  <div className="mb-1 text-[10px] text-[#7a9fad]">{stat.label}</div>
                  <div className="text-base font-bold" style={{ color: stat.color }}>
                    {stat.value}
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
              {result.result.actions.map((r, i) => (
                <div
                  key={i}
                  className="flex gap-2.5 rounded-xl border border-[#cae7ee] bg-[#f0f8fa] p-3"
                >
                  <div
                    className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border"
                    style={{
                      background: `${r.color}12`,
                      borderColor: `${r.color}22`,
                    }}
                  >
                    <span className="text-[11px] font-bold" style={{ color: r.color }}>
                      {i + 1}
                    </span>
                  </div>
                  <div>
                    <div className="text-[12px] font-medium leading-snug text-[#0d1117]">
                      {r.action}
                    </div>
                    <div
                      className="mt-0.5 text-[10px] font-semibold"
                      style={{ color: r.color }}
                    >
                      {r.priority}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
