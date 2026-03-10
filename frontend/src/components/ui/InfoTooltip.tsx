import { useState, useRef } from 'react'
import { Info } from 'lucide-react'

interface InfoTooltipProps {
  content: React.ReactNode
  size?: number
}

export function InfoTooltip({ content, size = 12 }: InfoTooltipProps) {
  const [visible, setVisible] = useState(false)
  const [style, setStyle] = useState<React.CSSProperties>({})
  const btnRef = useRef<HTMLButtonElement>(null)

  const computePosition = () => {
    if (!btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    const TOOLTIP_W = 230
    const GAP = 8

    // Prefer dropping below the icon; flip above if too close to bottom
    const spaceBelow = window.innerHeight - rect.bottom
    const top =
      spaceBelow > 120
        ? rect.bottom + GAP
        : rect.top - GAP - 10 // approximate, tooltip height varies

    // Prefer aligning left edge with icon; clamp to viewport
    let left = rect.left
    if (left + TOOLTIP_W > window.innerWidth - 12) {
      left = window.innerWidth - TOOLTIP_W - 12
    }
    if (left < 8) left = 8

    setStyle({ position: 'fixed', top, left, width: TOOLTIP_W, zIndex: 9999 })
  }

  const show = () => {
    computePosition()
    setVisible(true)
  }

  const hide = () => setVisible(false)

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className="inline-flex flex-shrink-0 items-center justify-center rounded-full text-[#7a9fad] transition-colors hover:text-[#55b2c9] focus:outline-none"
        style={{ width: size + 6, height: size + 6 }}
        aria-label="More information"
      >
        <Info size={size} strokeWidth={2} />
      </button>

      {visible && (
        <div
          style={style}
          className="rounded-xl border border-[#cae7ee] bg-white p-3 text-[11px] leading-relaxed text-[#3a5260] shadow-[0_6px_24px_rgba(85,178,201,0.18)]"
          onMouseEnter={show}
          onMouseLeave={hide}
        >
          {content}
        </div>
      )}
    </>
  )
}
