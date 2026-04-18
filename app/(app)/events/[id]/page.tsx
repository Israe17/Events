import { notFound, redirect } from "next/navigation"
import { cookies } from "next/headers"
import Link from "next/link"
import { createClient } from "@/utils/supabase/server"
import type { Tables } from "@/types/supabase"
import { CalendarDays, MapPin, QrCode, Users, Gift, Music } from "lucide-react"

const STATUS_LABEL: Record<string, string> = {
  draft: "Borrador",
  published: "Publicado",
  closed: "Cerrado",
  cancelled: "Cancelado",
}
const STATUS_COLOR: Record<string, string> = {
  draft: "bg-neutral-700 text-neutral-300",
  published: "bg-green-900/30 text-green-400",
  closed: "bg-neutral-700 text-neutral-400",
  cancelled: "bg-red-900/30 text-red-400",
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const anyClient = supabase as any

  const { data: event } = (await anyClient
    .from("events")
    .select("*")
    .eq("id", id)
    .single()) as { data: Tables<"events"> | null }

  if (!event) notFound()

  const [{ count: totalInvited }, { count: totalCheckedIn }, { count: totalGuests }] =
    await Promise.all([
      anyClient.from("event_invitations").select("*", { count: "exact", head: true }).eq("event_id", id),
      anyClient.from("event_checkins").select("*", { count: "exact", head: true }).eq("event_id", id),
      anyClient.from("event_users").select("*", { count: "exact", head: true }).eq("event_id", id).eq("role", "guest"),
    ]) as [{ count: number | null }, { count: number | null }, { count: number | null }]

  const statusColor = STATUS_COLOR[event.event_status] ?? STATUS_COLOR.draft
  const statusLabel = STATUS_LABEL[event.event_status] ?? event.event_status

  return (
    <div className="space-y-5 pb-8">
      {/* Status + description */}
      <div className="flex items-center gap-2">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      {event.description && (
        <p className="text-sm text-neutral-400 leading-relaxed">{event.description}</p>
      )}

      {/* Info cards */}
      <div className="space-y-2">
        {event.starts_at && (
          <div className="flex items-center gap-3 rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-3">
            <CalendarDays size={18} className="text-violet-400 shrink-0" />
            <div className="text-sm">
              <p className="text-neutral-100">
                {new Date(event.starts_at).toLocaleDateString("es-MX", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <p className="text-neutral-400">
                {new Date(event.starts_at).toLocaleTimeString("es-MX", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {event.ends_at &&
                  " – " +
                    new Date(event.ends_at).toLocaleTimeString("es-MX", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
              </p>
            </div>
          </div>
        )}

        {(event.venue_name || event.city) && (
          <div className="flex items-center gap-3 rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-3">
            <MapPin size={18} className="text-violet-400 shrink-0" />
            <div className="text-sm">
              {event.venue_name && <p className="text-neutral-100">{event.venue_name}</p>}
              {event.city && <p className="text-neutral-400">{event.city}</p>}
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Invitados", value: totalInvited ?? 0, icon: Users },
          { label: "Check-in", value: totalCheckedIn ?? 0, icon: QrCode },
          { label: "Confirmados", value: totalGuests ?? 0, icon: Users },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-xl bg-neutral-900 border border-neutral-800 p-4 text-center"
          >
            <Icon size={20} className="mx-auto mb-1 text-violet-400" />
            <p className="text-2xl font-bold text-neutral-100">{value}</p>
            <p className="text-xs text-neutral-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Acciones rápidas
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { href: `/events/${id}/invitations`, icon: QrCode, label: "Gestionar invitaciones" },
            { href: `/events/${id}/checkin`, icon: Users, label: "Scanner check-in" },
            { href: `/events/${id}/gifts`, icon: Gift, label: "Lista de regalos" },
            { href: `/events/${id}/songs`, icon: Music, label: "Playlist colaborativa" },
          ].map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-3.5 text-sm text-neutral-300 transition hover:border-violet-700 hover:text-neutral-100 active:scale-[0.97]"
            >
              <Icon size={18} className="text-violet-400 shrink-0" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
