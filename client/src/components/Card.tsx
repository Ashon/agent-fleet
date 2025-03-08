import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export default function Card({
  children,
  className = '',
  hover = false,
}: CardProps) {
  return (
    <div
      className={`card bg-base-100 shadow-xl ${
        hover ? 'hover:shadow-2xl transition-shadow' : ''
      } ${className}`}
    >
      <div className="card-body">{children}</div>
    </div>
  )
}
