export function SectionHeader({
  label,
  count,
  color = "text-neutral-400",
}: {
  label: string
  count?: number
  color?: string
}) {
  return (
    <div className="flex items-center gap-2 pb-1">
      <p className={`text-[11px] font-bold uppercase tracking-[0.15em] ${color}`}>{label}</p>
      {count !== undefined && (
        <span className="rounded-full bg-neutral-800 px-1.5 py-px text-[10px] tabular-nums text-neutral-500">
          {count}
        </span>
      )}
      <div className="flex-1 border-t border-neutral-800/80" />
    </div>
  )
}
