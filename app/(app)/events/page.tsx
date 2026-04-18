import Link from "next/link"
import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import type { Tables } from "@/types/supabase"
import { PageHeader } from "@/components/ui/page-header"
import { EmptyState } from "@/components/ui/empty-state"
import { StatusPill, type StatusVariant } from "@/components/ui/status-pill"
import { CalendarDays, MapPin, Plus, ChevronRight, Shield } from "lucide-react"

type EventRow = Pick<Tables<"events">, "id" | "slug" | "title" | "starts_at" | "venue_name" | "city" | "event_status">
type Membership = { role: string; event: EventRow | null }

const STATUS_LABEL: Record<string, string> = {
  draft: "Borrador",
  published: "Publicado",
  closed: "Cerrado",
  cancelled: "Cancelado",
}

const STATUS_VARIANT: Record<string, StatusVariant> = {
  draft: "neutral",
  published: "brand",
  closed: "muted",
  cancelled: "danger",
}

export default async function EventsPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: raw } = await supabase
    .from("event_users")
    .select(`role, event:events(id, slug, title, starts_at, venue_name, city, event_status)`)
    .order("created_at", { ascending: false })

  const memberships = (raw ?? []) as unknown as Membership[]
  const events = memberships
    .filter((m): m is Membership & { event: NonNullable<Membership["event"]> } => m.event !== null)
    .map((m) => ({ ...m.event, role: m.role }))

  return (
    <div className="px-4 pt-8 space-y-6">
      <PageHeader
        title="Mis eventos"
        subtitle={events.length > 0 ? `${events.length} eventos` : "Todos tus eventos"}
        action={
          <Link
            href="/events/new"
            className="btn-brand flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
          >
            <Plus size={15} />
            Nuevo
          </Link>
        }
      />

      {events.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Sin eventos todavía"
          description="Crea tu primer evento para comenzar a organizar"
          action={
            <Link
              href="/events/new"
              className="btn-brand flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white"
            >
              <Plus size={15} />
              Crear evento
            </Link>
          }
        />
      ) : (
        <ul className="space-y-3">
          {events.map((ev) => (
            <li key={ev.id}>
              <EventCard event={ev} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function EventCard({
  event,
}: {
  event: {
    id: string
    title: string
    starts_at: string | null
    venue_name: string | null
    city: string | null
    event_status: string
    role: string
  }
}) {
  const variant = STATUS_VARIANT[event.event_status] ?? "neutral"
  const label = STATUS_LABEL[event.event_status] ?? event.event_status

  return (
    <Link
      href={`/events/${event.id}`}
      className="card card-hover group relative block overflow-hidden p-5 fade-in"
    >
      {/* Gradient accent */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gradient-to-br from-violet-600/15 to-fuchsia-600/10 blur-3xl transition-opacity group-hover:opacity-75" />

      <div className="relative flex items-start gap-4">
        {/* Date block */}
        <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-violet-700 to-fuchsia-600 shadow-lg shadow-violet-900/40">
          {event.starts_at ? (
            <>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                {new Date(event.starts_at).toLocaleDateString("es-MX", { month: "short" })}
              </span>
              <span className="text-2xl font-bold text-white leading-none">
                {new Date(event.starts_at).getDate()}
              </span>
            </>
          ) : (
            <CalendarDays size={22} className="text-white/90" />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-start gap-2">
            <p className="flex-1 font-semibold text-neutral-50 leading-snug">{event.title}</p>
            <StatusPill variant={variant}>{label}</StatusPill>
          </div>

          <div className="space-y-1 text-xs text-neutral-500">
            {event.starts_at && (
              <div className="flex items-center gap-1.5">
                <CalendarDays size={12} />
                {new Date(event.starts_at).toLocaleDateString("es-MX", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            )}
            {(event.venue_name || event.city) && (
              <div className="flex items-center gap-1.5">
                <MapPin size={12} />
                {[event.venue_name, event.city].filter(Boolean).join(" · ")}
              </div>
            )}
            <div className="flex items-center gap-1.5 text-violet-400/80">
              <Shield size={11} />
              <span className="capitalize">{event.role}</span>
            </div>
          </div>
        </div>

        <ChevronRight size={16} className="shrink-0 text-neutral-700 transition group-hover:translate-x-0.5 group-hover:text-violet-400" />
      </div>
    </Link>
  )
}
