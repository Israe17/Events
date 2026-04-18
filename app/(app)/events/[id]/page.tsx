import { notFound, redirect } from "next/navigation"
import { cookies } from "next/headers"
import Link from "next/link"
import { createClient } from "@/utils/supabase/server"
import type { Tables } from "@/types/supabase"
import { StatCard } from "@/components/ui/stat-card"
import { SectionHeader } from "@/components/ui/section-header"
import {
  CalendarDays, MapPin, QrCode, Users, Gift, Music, ChevronRight, Clock, ScanLine,
} from "lucide-react"

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const anyClient = supabase as any

  const { data: event } = (await anyClient
    .from("events")
    .select("*")
    .eq("id", id)
    .single()) as { data: Tables<"events"> | null }

  if (!event) notFound()

  const [{ count: totalInvited }, { count: totalCheckedIn }, { data: songAgg }] =
    await Promise.all([
      anyClient.from("event_invitations").select("*", { count: "exact", head: true }).eq("event_id", id),
      anyClient.from("event_checkins").select("*", { count: "exact", head: true }).eq("event_id", id),
      anyClient.from("event_song_suggestions").select("id,song_status").eq("event_id", id),
    ])

  const songList = (songAgg ?? []) as { id: string; song_status: string }[]
  const approvedSongs = songList.filter((s) =>
    s.song_status === "approved" || s.song_status === "added_to_playlist"
  ).length

  return (
    <div className="space-y-6 fade-in">
      {/* Description */}
      {event.description && (
        <p className="text-sm leading-relaxed text-neutral-300">{event.description}</p>
      )}

      {/* Date & location cards */}
      <div className="grid gap-2">
        {event.starts_at && (
          <InfoRow icon={CalendarDays} accent="violet">
            <p className="text-sm font-medium text-neutral-100">
              {new Date(event.starts_at).toLocaleDateString("es-MX", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <p className="flex items-center gap-1 text-xs text-neutral-500">
              <Clock size={10} />
              {new Date(event.starts_at).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
              {event.ends_at && (
                <> – {new Date(event.ends_at).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}</>
              )}
            </p>
          </InfoRow>
        )}

        {(event.venue_name || event.city) && (
          <InfoRow icon={MapPin} accent="pink">
            {event.venue_name && (
              <p className="text-sm font-medium text-neutral-100">{event.venue_name}</p>
            )}
            {event.city && <p className="text-xs text-neutral-500">{event.city}</p>}
          </InfoRow>
        )}
      </div>

      {/* Stats */}
      <section className="space-y-3">
        <SectionHeader label="Resumen" />
        <div className="grid grid-cols-3 gap-2.5">
          <StatCard icon={Users}   label="Invitados" value={totalInvited ?? 0}   accent="violet" />
          <StatCard icon={QrCode}  label="Check-in"  value={totalCheckedIn ?? 0} accent="green"  />
          <StatCard icon={Music}   label="Canciones" value={approvedSongs}       accent="pink"   />
        </div>
      </section>

      {/* Quick actions */}
      <section className="space-y-3">
        <SectionHeader label="Acciones rápidas" />
        <div className="grid grid-cols-2 gap-2.5">
          <QuickAction href={`/events/${id}/invitations`} icon={QrCode}   label="Invitaciones" />
          <QuickAction href={`/events/${id}/checkin`}     icon={ScanLine} label="Scanner QR" />
          <QuickAction href={`/events/${id}/gifts`}       icon={Gift}     label="Lista de regalos" />
          <QuickAction href={`/events/${id}/songs`}       icon={Music}    label="Playlist" />
        </div>
      </section>
    </div>
  )
}

function InfoRow({
  icon: Icon,
  accent,
  children,
}: {
  icon: React.ElementType
  accent: "violet" | "pink"
  children: React.ReactNode
}) {
  const iconBg = accent === "violet"
    ? "bg-violet-600/15 text-violet-400 ring-violet-500/20"
    : "bg-pink-600/15 text-pink-400 ring-pink-500/20"
  return (
    <div className="card flex items-center gap-3 p-4">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${iconBg}`}>
        <Icon size={17} />
      </div>
      <div className="min-w-0 flex-1 space-y-0.5">{children}</div>
    </div>
  )
}

function QuickAction({
  href,
  icon: Icon,
  label,
}: {
  href: string
  icon: React.ElementType
  label: string
}) {
  return (
    <Link
      href={href}
      className="card card-hover group flex items-center gap-3 px-4 py-3.5"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl icon-badge">
        <Icon size={16} className="text-violet-300" />
      </div>
      <span className="flex-1 text-sm font-medium text-neutral-200">{label}</span>
      <ChevronRight size={14} className="text-neutral-600 transition group-hover:text-violet-400 group-hover:translate-x-0.5" />
    </Link>
  )
}

