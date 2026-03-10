import { Menu } from 'lucide-react'

interface MobileMenuButtonProps {
  onClick: () => void
}

export function MobileMenuButton({ onClick }: MobileMenuButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center rounded-lg border border-[#cae7ee] bg-[#f0f8fa] p-2 lg:hidden"
      aria-label="Open menu"
    >
      <Menu size={20} className="text-[#3a5260]" />
    </button>
  )
}
