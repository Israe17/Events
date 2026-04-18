import { cookies } from "next/headers"
import Link from "next/link"
import { createClient } from "@/utils/supabase/server"
import type { Tables } from "@/types/supabase"
import { CalendarDays, MapPin, Plus, Users } from "lucide-react"

type EventRow = Pick<Tables<"events">, "id" | "slug" | "title" | "starts_at" | "venue_name" | "city" | "event_status">
type Membership = { role: string; event: EventRow | null }

const STATUS_LABEL: Record<string, string> = {
  draft: "Borrador",
  published: "Publicado",
  closed: "Cerrado",
  cancelled: "Cancelado",
}

const STATUS_COLOR: Record<string, string> = {
  draft: "bg-neutral-700 text-neutral-300",
  published: "bg-violet-600/20 text-violet-400",
  closed: "bg-neutral-700 text-neutral-400",
  cancelled: "bg-red-900/30 text-red-400",
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
    <div className="px-4 pt-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-100">Mis eventos</h1>
        <Link
          href="/events/new"
          className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500 active:scale-95"
        >
          <Plus size={16} />
          Nuevo
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-10 text-center">
          <CalendarDays size={40} className="text-neutral-600" />
          <div>
            <p className="font-semibold text-neutral-300">Sin eventos</p>
            <p className="mt-1 text-sm text-neutral-500">Crea tu primer evento para comenzar</p>
          </div>
          <Link
            href="/events/new"
            className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
          >
            Crear evento
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {events.map((ev) => (
            <li key={ev.id}>
              <Link
                href={`/events/${ev.id}`}
                className="block rounded-2xl border border-neutral-800 bg-neutral-900 p-4 transition hover:border-violet-700 active:scale-[0.98]"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-neutral-100 leading-snug">{ev.title}</p>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[ev.event_status] ?? STATUS_COLOR.draft}`}
                  >
                    {STATUS_LABEL[ev.event_status] ?? ev.event_status}
                  </span>
                </div>

                <div className="mt-2 space-y-1">
                  {ev.starts_at && (
                    <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                      <CalendarDays size={13} />
                      {new Date(ev.starts_at).toLocaleDateString("es-MX", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  )}
                  {(ev.venue_name || ev.city) && (
                    <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                      <MapPin size={13} />
                      {[ev.venue_name, ev.city].filter(Boolean).join(", ")}
                    </div>
                  )}
                </div>

                <div className="mt-2 flex items-center gap-1 text-xs text-neutral-500">
                  <Users size={12} />
                  <span className="capitalize">{ev.role}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
