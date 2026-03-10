import { Card } from '../../components/ui/Card'
import { SevBadge } from '../../components/ui/SevBadge'
import { X } from 'lucide-react'
import { insightsList } from '../../data/mockData'
import { useFinanceStore } from '../../store/useFinanceStore'
import { COLORS } from '../../lib/utils'

export function InsightsSection() {
  const dismissedInsights = useFinanceStore((s) => s.dismissedInsights)
  const dismissInsight = useFinanceStore((s) => s.dismissInsight)
  const visible = insightsList.filter((_, i) => !dismissedInsights.includes(i))

  const criticalCount = visible.filter((i) => i.sev === 'critical').length
  const warningCount = visible.filter((i) => i.sev === 'warning').length
  const tipCount = visible.filter((i) => i.sev === 'tip').length

  return (
    <div className="flex flex-col gap-3">
      <div className="mb-1 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-[#0d1117]">
            Insights & Actions
          </div>
          <div className="mt-0.5 text-[11px] text-[#7a9fad]">
            {criticalCount} critical · {warningCount} warnings · {tipCount} tips
          </div>
        </div>
        <button
          type="button"
          className="rounded-lg border border-[#cae7ee] bg-[#f0f8fa] px-3 py-1.5 text-[11px] font-medium text-[#3a5260]"
        >
          Show Dismissed
        </button>
      </div>
      {visible.map((ins) => {
        const idx = insightsList.indexOf(ins)
        return (
          <div
            key={idx}
            className="flex gap-3 rounded-r-[14px] border border-[#cae7ee] border-l-4 p-4 shadow-[0_1px_3px_rgba(85,178,201,0.05)]"
            style={{ borderLeftColor: ins.color, background: COLORS.card }}
          >
            <div
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border"
              style={{
                background: `${ins.color}12`,
                borderColor: `${ins.color}20`,
              }}
            >
              <ins.Icon size={16} style={{ color: ins.color }} />
            </div>
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-[13px] font-semibold text-[#0d1117]">
                  {ins.title}
                </span>
                <SevBadge sev={ins.sev} />
              </div>
              <div className="text-[12px] leading-relaxed text-[#3a5260]">
                {ins.desc}
              </div>
            </div>
            <div className="flex flex-shrink-0 items-center gap-1.5">
              <button
                type="button"
                className="rounded-lg border px-3 py-1.5 text-[12px] font-semibold"
                style={{
                  background: `${ins.color}12`,
                  color: ins.color,
                  borderColor: `${ins.color}30`,
                }}
              >
                {ins.action}
              </button>
              <button
                type="button"
                onClick={() => dismissInsight(idx)}
                className="flex items-center rounded-lg border border-[#cae7ee] bg-transparent p-1.5 text-[#7a9fad]"
                aria-label="Dismiss"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        )
      })}
      {visible.length === 0 && (
        <Card className="py-12 text-center">
          <div className="mb-1.5 text-[15px] font-semibold text-[#0d1117]">
            All clear!
          </div>
          <div className="text-[12px] text-[#3a5260]">
            No active insights. We&apos;ll notify you when something needs
            attention.
          </div>
        </Card>
      )}
    </div>
  )
}
