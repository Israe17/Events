import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export function PageHeader({
  title,
  subtitle,
  back,
  action,
}: {
  title: string
  subtitle?: string
  back?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {back && (
          <Link
            href={back}
            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-800/80 text-neutral-300 transition hover:bg-neutral-700 hover:text-neutral-100"
          >
            <ArrowLeft size={16} />
          </Link>
        )}
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold text-neutral-50 tracking-tight">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-neutral-500">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
