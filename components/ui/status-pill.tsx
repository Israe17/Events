const VARIANTS = {
  neutral:  "bg-neutral-800 text-neutral-300 border-neutral-700",
  brand:    "bg-violet-600/20 text-violet-300 border-violet-600/30",
  success:  "bg-green-600/15 text-green-300 border-green-600/30",
  warning:  "bg-yellow-600/15 text-yellow-300 border-yellow-600/30",
  danger:   "bg-red-600/15 text-red-300 border-red-600/30",
  muted:    "bg-neutral-900 text-neutral-500 border-neutral-800",
}

export type StatusVariant = keyof typeof VARIANTS

export function StatusPill({
  children,
  variant = "neutral",
  dot = true,
}: {
  children: React.ReactNode
  variant?: StatusVariant
  dot?: boolean
}) {
  const cls = VARIANTS[variant]
  const dotColor =
    variant === "success" ? "bg-green-400" :
    variant === "warning" ? "bg-yellow-400" :
    variant === "danger"  ? "bg-red-400" :
    variant === "brand"   ? "bg-violet-400" :
    variant === "muted"   ? "bg-neutral-600" : "bg-neutral-500"

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${cls}`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />}
      {children}
    </span>
  )
}
