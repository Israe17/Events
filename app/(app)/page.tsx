import Link from "next/link"
import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import { EmptyState } from "@/components/ui/empty-state"
import { SectionHeader } from "@/components/ui/section-header"
import { StatusPill } from "@/components/ui/status-pill"
import { CalendarDays, ChevronRight, Plus, Sparkles } from "lucide-react"

export default async function HomePage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()

  const { data: memberships } = await (supabase as any)
    .from("event_users")
    .select("role, event:events(id, title, starts_at, venue_name, city, event_status)")
    .order("created_at", { ascending: false })

  const events = ((memberships ?? []) as any[])
    .map((m) => m.event ? { ...m.event, role: m.role } : null)
    .filter(Boolean) as Array<{ id: string; title: string; starts_at: string | null; venue_name: string | null; city: string | null; event_status: string; role: string }>

  const now = new Date()
  const upcoming = events.filter((e) => !e.starts_at || new Date(e.starts_at) >= now)
  const past = events.filter((e) => e.starts_at && new Date(e.starts_at) < now)

  const displayName = (user?.email ?? "").split("@")[0]

  return (
    <div className="px-4 pt-8 space-y-8">
      {/* Welcome header */}
      <div className="fade-in space-y-1">
        <div className="flex items-center gap-2 text-xs text-violet-400">
          <Sparkles size={12} />
          <span className="uppercase tracking-widest font-semibold">Hola</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-50">{displayName}</h1>
        <p className="text-sm text-neutral-500">{user?.email}</p>
      </div>

      {/* Upcoming events */}
      {upcoming.length > 0 ? (
        <section className="space-y-3 fade-in">
          <div className="flex items-center justify-between">
            <SectionHeader label="Próximos eventos" count={upcoming.length} color="text-violet-400" />
          </div>
          <ul className="space-y-2.5">
            {upcoming.map((ev) => (
              <li key={ev.id}>
                <EventCardRow event={ev} />
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <EmptyState
          icon={CalendarDays}
          title="Sin eventos próximos"
          description="Crea tu primer evento para comenzar"
          action={
            <Link
              href="/events/new"
              className="btn-brand flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
            >
              <Plus size={15} />
              Crear evento
            </Link>
          }
        />
      )}

      {/* Past events */}
      {past.length > 0 && (
        <section className="space-y-3">
          <SectionHeader label="Eventos pasados" count={past.length} />
          <ul className="space-y-2.5">
            {past.map((ev) => (
              <li key={ev.id}>
                <EventCardRow event={ev} muted />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function EventCardRow({
  event,
  muted,
}: {
  event: { id: string; title: string; starts_at: string | null; venue_name: string | null; city: string | null; event_status: string; role: string }
  muted?: boolean
}) {
  const statusVariant =
    event.event_status === "published" ? "brand" :
    event.event_status === "closed"    ? "muted" :
    event.event_status === "cancelled" ? "danger" : "neutral"

  return (
    <Link
      href={`/events/${event.id}`}
      className={`card card-hover relative flex items-center gap-4 overflow-hidden p-4 ${muted ? "opacity-60" : ""}`}
    >
      {/* Date badge */}
      <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/30 to-fuchsia-600/20 ring-1 ring-violet-500/20">
        {event.starts_at ? (
          <>
            <span className="text-[10px] font-bold uppercase tracking-widest text-violet-300">
              {new Date(event.starts_at).toLocaleDateString("es-MX", { month: "short" })}
            </span>
            <span className="text-xl font-bold text-white leading-none">
              {new Date(event.starts_at).getDate()}
            </span>
          </>
        ) : (
          <CalendarDays size={20} className="text-violet-400" />
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <p className="truncate font-semibold text-neutral-100">{event.title}</p>
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          {event.starts_at && (
            <span>
              {new Date(event.starts_at).toLocaleDateString("es-MX", {
                weekday: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
          {event.venue_name && <span>· {event.venue_name}</span>}
        </div>
        <StatusPill variant={statusVariant}>{event.event_status}</StatusPill>
      </div>

      <ChevronRight size={16} className="shrink-0 text-neutral-600" />
    </Link>
  )
}
