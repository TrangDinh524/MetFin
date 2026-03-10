import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={
        'rounded-2xl border-[1.5px] border-[#cae7ee] bg-white p-5 shadow-[0_1px_4px_rgba(85,178,201,0.06)] ' +
        className
      }
    >
      {children}
    </div>
  )
}
