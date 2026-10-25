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
    <div className={cn("flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-gray-200 mb-6", className)}>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">{title}</h1>
        {description && <p className="mt-1 text-sm md:text-base text-gray-500">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
