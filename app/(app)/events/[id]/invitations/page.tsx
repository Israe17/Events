import { cookies } from "next/headers"
import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import type { Tables } from "@/types/supabase"
import { EmptyState } from "@/components/ui/empty-state"
import { StatusPill, type StatusVariant } from "@/components/ui/status-pill"
import { SectionHeader } from "@/components/ui/section-header"
import { Plus, QrCode, Users, CheckCircle2, Mail, Phone, ChevronRight } from "lucide-react"

const STATUS_CONFIG: Record<string, { label: string; variant: StatusVariant }> = {
  active:    { label: "Activa",    variant: "success" },
  paused:    { label: "Pausada",   variant: "warning" },
  exhausted: { label: "Agotada",   variant: "muted" },
  cancelled: { label: "Cancelada", variant: "danger" },
}

export default async function InvitationsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: invitations } = (await (supabase as any)
    .from("event_invitations")
    .select("*")
    .eq("event_id", id)
    .order("created_at", { ascending: false })) as {
    data: Tables<"event_invitations">[] | null
  }

  if (!invitations) notFound()

  const totalInvited  = invitations.length
  const totalEntered  = invitations.filter((i) => i.holder_has_entered).length
  const totalEntries  = invitations.reduce((s, i) => s + i.max_entries, 0)
  const usedEntries   = invitations.reduce((s, i) => s + i.used_entries, 0)

  return (
    <div className="space-y-5 fade-in">
      {/* Stats bar */}
      {invitations.length > 0 && (
        <div className="grid grid-cols-3 gap-2.5">
          <MiniStat label="Invitaciones" value={totalInvited} color="text-violet-400" />
          <MiniStat label="Entraron"     value={totalEntered} color="text-green-400" />
          <MiniStat label="Entradas"     value={`${usedEntries}/${totalEntries}`} color="text-pink-400" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <SectionHeader label="Invitados" count={invitations.length} color="text-violet-400" />
        <Link
          href={`/events/${id}/invitations/new`}
          className="btn-brand ml-3 flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white"
        >
          <Plus size={14} />
          Nueva
        </Link>
      </div>

      {invitations.length === 0 ? (
        <EmptyState
          icon={QrCode}
          title="Sin invitaciones"
          description="Crea invitaciones con QR para tus invitados"
        />
      ) : (
        <ul className="space-y-2.5">
          {invitations.map((inv) => (
            <li key={inv.id}>
              <InvitationCard eventId={id} inv={inv} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function MiniStat({
  label,
  value,
  color,
}: {
  label: string
  value: number | string
  color: string
}) {
  return (
    <div className="card p-3 text-center">
      <p className={`text-lg font-bold tabular-nums ${color}`}>{value}</p>
      <p className="text-[10px] font-medium uppercase tracking-widest text-neutral-500">{label}</p>
    </div>
  )
}

function InvitationCard({
  eventId,
  inv,
}: {
  eventId: string
  inv: Tables<"event_invitations">
}) {
  const cfg = STATUS_CONFIG[inv.invitation_status] ?? STATUS_CONFIG.active
  const usagePct = (inv.used_entries / Math.max(inv.max_entries, 1)) * 100

  return (
    <Link
      href={`/events/${eventId}/invitations/${inv.id}`}
      className="card card-hover group relative flex items-center gap-3 overflow-hidden p-3.5"
    >
      {/* QR avatar */}
      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl icon-badge">
        <QrCode size={20} className="text-violet-300" />
        {inv.holder_has_entered && (
          <span className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 ring-2 ring-neutral-900">
            <CheckCircle2 size={10} className="text-white" />
          </span>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-semibold text-neutral-100">{inv.holder_name}</p>
          <StatusPill variant={cfg.variant}>{cfg.label}</StatusPill>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-neutral-500">
          <span className="flex items-center gap-1">
            <Users size={10} />
            {inv.used_entries}/{inv.max_entries}
          </span>
          {inv.holder_email && (
            <span className="flex min-w-0 items-center gap-1 truncate">
              <Mail size={10} className="shrink-0" />
              <span className="truncate">{inv.holder_email}</span>
            </span>
          )}
          {!inv.holder_email && inv.holder_phone && (
            <span className="flex items-center gap-1">
              <Phone size={10} />
              {inv.holder_phone}
            </span>
          )}
        </div>

        {/* Usage bar */}
        <div className="h-1 overflow-hidden rounded-full bg-neutral-800/80">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all"
            style={{ width: `${Math.min(usagePct, 100)}%` }}
          />
        </div>
      </div>

      <ChevronRight size={14} className="shrink-0 text-neutral-700 transition group-hover:text-violet-400 group-hover:translate-x-0.5" />
    </Link>
  )
}
