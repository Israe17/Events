import { notFound, redirect } from "next/navigation"
import { cookies } from "next/headers"
import Link from "next/link"
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react"
import { createClient } from "@/utils/supabase/server"
import { EventTabs } from "@/components/event-tabs"
import { StatusPill, type StatusVariant } from "@/components/ui/status-pill"

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

export default async function EventLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: raw } = await (supabase as any)
    .from("event_users")
    .select("role, event:events(id, title, event_status, starts_at, venue_name, city)")
    .eq("event_id", id)
    .eq("user_id", user.id)
    .single()

  if (!raw) notFound()

  const event = (raw as {
    role: string
    event: {
      id: string
      title: string
      event_status: string
      starts_at: string | null
      venue_name: string | null
      city: string | null
    }
  }).event

  const variant = STATUS_VARIANT[event.event_status] ?? "neutral"
  const label = STATUS_LABEL[event.event_status] ?? event.event_status

  return (
    <div>
      {/* Gradient header */}
      <div className="relative">
        {/* Gradient background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/25 via-fuchsia-600/10 to-transparent" />
          <div className="absolute -top-24 left-1/2 h-48 w-[120%] -translate-x-1/2 rounded-full bg-violet-600/15 blur-3xl" />
        </div>

        <div className="relative px-4 pb-4 pt-6 space-y-4">
          {/* Back + title */}
          <div className="flex items-start gap-3">
            <Link
              href="/events"
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-800/80 text-neutral-300 backdrop-blur transition hover:bg-neutral-700 hover:text-neutral-100"
            >
              <ArrowLeft size={16} />
            </Link>

            <div className="min-w-0 flex-1">
              <div className="mb-1.5">
                <StatusPill variant={variant}>{label}</StatusPill>
              </div>
              <h1 className="truncate text-2xl font-bold tracking-tight text-neutral-50">
                {event.title}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-neutral-400">
                {event.starts_at && (
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays size={12} />
                    {new Date(event.starts_at).toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                )}
                {(event.venue_name || event.city) && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={12} />
                    {[event.venue_name, event.city].filter(Boolean).join(" · ")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Tabs — full-bleed scroll so last tab isn't clipped */}
          <div className="-mx-4">
            <EventTabs eventId={id} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-4">{children}</div>
    </div>
  )
}
