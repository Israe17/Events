import { notFound, redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import type { Tables } from "@/types/supabase"
import { QRCodeDisplay } from "@/components/qr-code-display"
import { deleteInvitation } from "../actions"
import { CalendarCheck, Mail, Phone, Users } from "lucide-react"

const STATUS_LABEL: Record<string, string> = {
  active: "Activa",
  paused: "Pausada",
  exhausted: "Agotada",
  cancelled: "Cancelada",
}
const STATUS_COLOR: Record<string, string> = {
  active: "bg-green-900/30 text-green-400",
  paused: "bg-yellow-900/30 text-yellow-400",
  exhausted: "bg-neutral-700 text-neutral-400",
  cancelled: "bg-red-900/30 text-red-400",
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

  const statusColor = STATUS_COLOR[inv.invitation_status] ?? STATUS_COLOR.active
  const statusLabel = STATUS_LABEL[inv.invitation_status] ?? inv.invitation_status

  return (
    <div className="space-y-5 pb-10">
      {/* Status + name */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-neutral-100">{inv.holder_name}</h2>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      {/* QR Code */}
      <QRCodeDisplay value={inv.qr_token} />

      {/* Usage */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Uso de entradas
        </p>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="h-2 rounded-full bg-neutral-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-violet-600 transition-all"
                style={{ width: `${Math.min((inv.used_entries / inv.max_entries) * 100, 100)}%` }}
              />
            </div>
          </div>
          <span className="text-sm font-semibold text-neutral-300 tabular-nums">
            {inv.used_entries}/{inv.max_entries}
          </span>
        </div>
        {inv.holder_must_enter_first && (
          <p className="mt-2 text-xs text-neutral-500">
            Titular {inv.holder_has_entered ? "ya entró ✓" : "debe entrar primero"}
          </p>
        )}
      </div>

      {/* Info */}
      <div className="space-y-2">
        {inv.holder_email && (
          <div className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3">
            <Mail size={16} className="text-violet-400 shrink-0" />
            <span className="text-sm text-neutral-300">{inv.holder_email}</span>
          </div>
        )}
        {inv.holder_phone && (
          <div className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3">
            <Phone size={16} className="text-violet-400 shrink-0" />
            <span className="text-sm text-neutral-300">{inv.holder_phone}</span>
          </div>
        )}
        <div className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3">
          <Users size={16} className="text-violet-400 shrink-0" />
          <span className="text-sm text-neutral-300">{inv.max_entries} {inv.max_entries === 1 ? "entrada" : "entradas"}</span>
        </div>
        {inv.approved_at && (
          <div className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3">
            <CalendarCheck size={16} className="text-violet-400 shrink-0" />
            <span className="text-sm text-neutral-300">
              Creada {new Date(inv.approved_at).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
        )}
      </div>

      {/* Token (for debugging / sharing) */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3">
        <p className="mb-1 text-xs text-neutral-500">Token QR</p>
        <p className="font-mono text-xs text-neutral-400 break-all">{inv.qr_token}</p>
      </div>

      {/* Danger zone */}
      <form action={deleteAction}>
        <button
          type="submit"
          className="w-full rounded-xl border border-red-800/50 bg-red-900/20 px-4 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-900/40 active:scale-95"
        >
          Eliminar invitación
        </button>
      </form>
    </div>
  )
}
