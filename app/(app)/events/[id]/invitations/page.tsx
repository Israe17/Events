import { cookies } from "next/headers"
import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import type { Tables } from "@/types/supabase"
import { Plus, QrCode, Users, CheckCircle2, XCircle } from "lucide-react"

const STATUS_COLOR: Record<string, string> = {
  active: "bg-green-900/30 text-green-400",
  paused: "bg-yellow-900/30 text-yellow-400",
  exhausted: "bg-neutral-700 text-neutral-400",
  cancelled: "bg-red-900/30 text-red-400",
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
    .order("created_at", { ascending: false })) as { data: Tables<"event_invitations">[] | null }

  if (!invitations) notFound()

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-400">{invitations.length} invitaciones</p>
        <Link
          href={`/events/${id}/invitations/new`}
          className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500"
        >
          <Plus size={15} />
          Nueva
        </Link>
      </div>

      {invitations.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-900 p-10 text-center">
          <QrCode size={36} className="text-neutral-600" />
          <div>
            <p className="font-semibold text-neutral-300">Sin invitaciones</p>
            <p className="mt-1 text-sm text-neutral-500">Crea invitaciones con QR para tus invitados</p>
          </div>
        </div>
      ) : (
        <ul className="space-y-2">
          {invitations.map((inv) => (
            <li key={inv.id}>
              <Link
                href={`/events/${id}/invitations/${inv.id}`}
                className="flex items-center gap-4 rounded-2xl border border-neutral-800 bg-neutral-900 px-4 py-3.5 transition hover:border-violet-700 active:scale-[0.98]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600/20">
                  <QrCode size={20} className="text-violet-400" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-neutral-100">{inv.holder_name}</p>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-neutral-500">
                    <span className="flex items-center gap-1">
                      <Users size={11} />
                      {inv.used_entries}/{inv.max_entries}
                    </span>
                    {inv.holder_email && <span className="truncate">{inv.holder_email}</span>}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[inv.invitation_status] ?? STATUS_COLOR.active}`}
                  >
                    {inv.invitation_status}
                  </span>
                  {inv.holder_has_entered ? (
                    <CheckCircle2 size={14} className="text-green-400" />
                  ) : (
                    <XCircle size={14} className="text-neutral-600" />
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
