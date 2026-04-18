import { notFound } from "next/navigation"
import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import type { Tables } from "@/types/supabase"
import { QRCodeDisplay } from "@/components/qr-code-display"
import { StatusPill, type StatusVariant } from "@/components/ui/status-pill"
import { deleteInvitation } from "../actions"
import { CalendarCheck, Mail, Phone, Users, Shield, Trash2 } from "lucide-react"

const STATUS_CONFIG: Record<string, { label: string; variant: StatusVariant }> = {
  active:    { label: "Activa",    variant: "success" },
  paused:    { label: "Pausada",   variant: "warning" },
  exhausted: { label: "Agotada",   variant: "muted" },
  cancelled: { label: "Cancelada", variant: "danger" },
}

export default async function InvitationDetailPage({
  params,
}: {
  params: Promise<{ id: string; invId: string }>
}) {
  const { id, invId } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: inv } = (await (supabase as any)
    .from("event_invitations")
    .select("*")
    .eq("id", invId)
    .eq("event_id", id)
    .single()) as { data: Tables<"event_invitations"> | null }

  if (!inv) notFound()

  const deleteAction = deleteInvitation.bind(null, id, invId)
  const cfg = STATUS_CONFIG[inv.invitation_status] ?? STATUS_CONFIG.active
  const usagePct = (inv.used_entries / Math.max(inv.max_entries, 1)) * 100

  return (
    <div className="space-y-5 fade-in pb-6">
      {/* Name + status */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-neutral-50">{inv.holder_name}</h2>
        <div className="mt-2 flex justify-center">
          <StatusPill variant={cfg.variant}>{cfg.label}</StatusPill>
        </div>
      </div>

      {/* QR Code with glow */}
      <div className="relative mx-auto max-w-xs">
        <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-br from-violet-500/30 via-fuchsia-500/20 to-transparent blur-2xl" />
        <div className="relative scale-in">
          <QRCodeDisplay value={inv.qr_token} />
        </div>
      </div>

      {/* Usage */}
      <div className="card p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
            Uso de entradas
          </p>
          <span className="text-sm font-bold text-neutral-200 tabular-nums">
            {inv.used_entries}/{inv.max_entries}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-neutral-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-[0_0_10px_rgba(139,92,246,0.6)] transition-all"
            style={{ width: `${Math.min(usagePct, 100)}%` }}
          />
        </div>
        {inv.holder_must_enter_first && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-neutral-500">
            <Shield size={11} className="text-violet-400" />
            Titular {inv.holder_has_entered ? (
              <span className="text-green-400">ya entró ✓</span>
            ) : (
              <span>debe entrar primero</span>
            )}
          </p>
        )}
      </div>

      {/* Contact info */}
      <div className="space-y-2">
        {inv.holder_email && <InfoRow icon={Mail}          label={inv.holder_email} />}
        {inv.holder_phone && <InfoRow icon={Phone}         label={inv.holder_phone} />}
        <InfoRow icon={Users} label={`${inv.max_entries} ${inv.max_entries === 1 ? "entrada" : "entradas"} disponibles`} />
        {inv.approved_at && (
          <InfoRow
            icon={CalendarCheck}
            label={`Creada ${new Date(inv.approved_at).toLocaleDateString("es-MX", {
              day: "numeric", month: "short", year: "numeric",
            })}`}
          />
        )}
      </div>

      {/* QR Token */}
      <details className="card group overflow-hidden">
        <summary className="cursor-pointer list-none px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500 select-none group-open:border-b group-open:border-neutral-800">
          Token QR
        </summary>
        <p className="px-4 py-3 font-mono text-[10px] break-all text-neutral-500">{inv.qr_token}</p>
      </details>

      {/* Delete */}
      <form action={deleteAction}>
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-900/40 bg-red-950/30 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-900/30 active:scale-95"
        >
          <Trash2 size={15} />
          Eliminar invitación
        </button>
      </form>
    </div>
  )
}

function InfoRow({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="card flex items-center gap-3 px-4 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg icon-badge">
        <Icon size={14} className="text-violet-300" />
      </div>
      <span className="text-sm text-neutral-300">{label}</span>
    </div>
  )
}
