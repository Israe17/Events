import Link from "next/link"
import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import { PageHeader } from "@/components/ui/page-header"
import { EmptyState } from "@/components/ui/empty-state"
import { QrCode, CalendarDays, ChevronRight } from "lucide-react"

export default async function GlobalCheckinPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: raw } = await (supabase as any)
    .from("event_users")
    .select("role, event:events(id, title, starts_at)")
    .in("role", ["host", "admin", "staff"])
    .order("created_at", { ascending: false })

  const events = ((raw ?? []) as any[]).map((m: any) => m.event).filter(Boolean)

  return (
    <div className="px-4 pt-8 space-y-6">
      <PageHeader
        title="Check-in"
        subtitle="Selecciona el evento para escanear"
      />

      {events.length === 0 ? (
        <EmptyState
          icon={QrCode}
          title="Sin eventos para check-in"
          description="Solo aparecen eventos donde eres host, admin o staff"
        />
      ) : (
        <ul className="space-y-2.5">
          {events.map((ev: any) => (
            <li key={ev.id}>
              <Link
                href={`/events/${ev.id}/checkin`}
                className="card card-hover group flex items-center gap-4 p-4"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl icon-badge">
                  <QrCode size={18} className="text-violet-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-neutral-100">{ev.title}</p>
                  {ev.starts_at && (
                    <p className="flex items-center gap-1 text-xs text-neutral-500">
                      <CalendarDays size={11} />
                      {new Date(ev.starts_at).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                    </p>
                  )}
                </div>
                <ChevronRight size={15} className="text-neutral-600 transition group-hover:translate-x-0.5 group-hover:text-violet-400" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
