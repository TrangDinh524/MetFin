import { Plus } from 'lucide-react'

interface AddButtonProps {
  label: string
  color: string
  onClick?: () => void
}

export function AddButton({ label, color, onClick }: AddButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[11px] font-semibold"
      style={{
        background: `${color}12`,
        color,
        border: `1.5px solid ${color}35`,
      }}
    >
      <Plus size={11} />
      {label}
    </button>
  )
}
