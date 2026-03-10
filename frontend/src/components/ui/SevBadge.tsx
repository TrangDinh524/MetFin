import type { InsightSeverity } from '../../types'

const map: Record<InsightSeverity, [string, string]> = {
  critical: ['#d44a4a', 'Critical'],
  warning: ['#d4860a', 'Warning'],
  tip: ['#1cb08a', 'Tip'],
}

interface SevBadgeProps {
  sev: InsightSeverity
}

export function SevBadge({ sev }: SevBadgeProps) {
  const [col, lbl] = map[sev] ?? ['#7a9fad', sev]
  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
      style={{
        background: `${col}14`,
        color: col,
        border: `1px solid ${col}28`,
      }}
    >
      {lbl}
    </span>
  )
}
