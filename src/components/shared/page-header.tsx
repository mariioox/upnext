import React from "react"
import { cn } from "@/lib/cn"

export interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
      <div className="min-w-0">
        <h1 className="m-0 text-4xl font-black leading-none tracking-tight md:text-5xl">{title}</h1>
        {description && <p className="mt-3 mb-0 max-w-2xl text-base leading-relaxed text-ink-muted md:text-lg">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
