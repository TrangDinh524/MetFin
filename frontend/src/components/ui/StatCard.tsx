import type { LucideIcon } from 'lucide-react'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Card } from './Card'
import { InfoTooltip } from './InfoTooltip'

interface StatCardProps {
  label: string
  value: string
  change: number
  note: string
  color: string
  Icon: LucideIcon
  info?: React.ReactNode
}

export function StatCard({ label, value, change, note, color, Icon, info }: StatCardProps) {
  const pos = change >= 0
  return (
    <Card className="relative overflow-hidden">
      <div
        className="absolute -top-6 -right-6 h-[90px] w-[90px] rounded-full opacity-10"
        style={{ background: color }}
      />
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7a9fad]">
            {label}
          </span>
          {info && <InfoTooltip content={info} size={11} />}
        </div>
        <div
          className="rounded-lg p-1.5 px-2"
          style={{ background: `${color}14` }}
        >
          <Icon size={13} style={{ color, display: 'block' }} />
        </div>
      </div>
      <div className="mb-1.5 text-[23px] font-bold tracking-tight text-[#0d1117]">
        {value}
      </div>
      <div className="flex items-center gap-1">
        {pos ? (
          <ArrowUpRight size={13} className="text-[#1cb08a]" />
        ) : (
          <ArrowDownRight size={13} className="text-[#d44a4a]" />
        )}
        <span
          className={`text-[11px] font-semibold ${pos ? 'text-[#1cb08a]' : 'text-[#d44a4a]'}`}
        >
          {pos ? '+' : ''}
          {change}%
        </span>
        <span className="text-[11px] text-[#7a9fad]">{note}</span>
      </div>
    </Card>
  )
}
