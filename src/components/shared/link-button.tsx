import { forwardRef } from "react"
import { Link, type LinkProps } from "react-router-dom"
import { cn } from "@/lib/cn"

/**
 * A router <Link> that looks exactly like the shared Button.
 *
 * The shared Button (spr-tech/interface-eng-shared-components) is a real <button> with no
 * `asChild`, which is right for actions. Navigation must stay a link (so it can be opened in a
 * new tab, and screen readers announce it as a link), so this mirrors the shared Button's
 * variant and size classes onto a <Link>. Keep these class lists in step with button.tsx.
 * Proposed to the group as an addition to the shared set.
 */
type Variant = "primary" | "secondary" | "danger" | "ghost"
type Size = "sm" | "md" | "lg"

const variantClasses: Record<Variant, string> = {
  primary: "bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:bg-[var(--color-primary-hover)]",
  secondary:
    "bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border-input)] hover:bg-[var(--color-surface)]",
  danger: "bg-[var(--color-danger)] text-[var(--color-on-danger)] hover:bg-[var(--color-danger-hover)]",
  ghost: "bg-transparent text-[var(--color-text)] hover:bg-[var(--color-surface)]",
}

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
}

export type LinkButtonProps = LinkProps & { variant?: Variant; size?: Size }

export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(function LinkButton(
  { variant = "primary", size = "md", className, ...rest },
  ref,
) {
  return (
    <Link
      ref={ref}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-medium no-underline",
        "rounded-[var(--radius-md)] font-[family-name:var(--font-sans)] transition-colors",
        "focus-visible:[outline:var(--focus-ring-width)_solid_var(--color-focus)]",
        "focus-visible:[outline-offset:var(--focus-ring-offset)]",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...rest}
    />
  )
})
