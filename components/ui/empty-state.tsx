import type { LucideIcon } from "lucide-react"

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="fade-in flex flex-col items-center gap-4 rounded-3xl border border-dashed border-neutral-800 px-6 py-14 text-center">
      <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl icon-badge">
        <Icon size={34} className="text-violet-400" />
        <span className="absolute inset-0 rounded-3xl bg-violet-500/10 blur-xl -z-10" />
      </div>
      <div>
        <p className="text-lg font-semibold text-neutral-100">{title}</p>
        {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
      </div>
      {action}
    </div>
  )
}
