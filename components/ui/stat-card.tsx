import type { LucideIcon } from "lucide-react"

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "violet",
}: {
  label: string
  value: number | string
  icon: LucideIcon
  accent?: "violet" | "green" | "pink" | "amber"
}) {
  const iconColor = {
    violet: "text-violet-400",
    green:  "text-green-400",
    pink:   "text-pink-400",
    amber:  "text-amber-400",
  }[accent]

  const glow = {
    violet: "from-violet-500/20",
    green:  "from-green-500/20",
    pink:   "from-pink-500/20",
    amber:  "from-amber-500/20",
  }[accent]

  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4">
      <div className={`pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full bg-gradient-to-br ${glow} to-transparent blur-2xl`} />
      <div className="relative">
        <Icon size={18} className={iconColor} />
        <p className="mt-3 text-2xl font-bold text-neutral-50 tabular-nums tracking-tight">{value}</p>
        <p className="mt-0.5 text-xs text-neutral-500">{label}</p>
      </div>
    </div>
  )
}
