import Link from "next/link"
import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import { PageHeader } from "@/components/ui/page-header"
import { EmptyState } from "@/components/ui/empty-state"
import { Music, ChevronRight } from "lucide-react"

export default async function GlobalSongsPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: raw } = await (supabase as any)
    .from("event_users")
    .select("event:events(id, title, starts_at)")
    .order("created_at", { ascending: false })

  const events = ((raw ?? []) as any[]).map((m: any) => m.event).filter(Boolean)

  return (
    <div className="px-4 pt-8 space-y-6">
      <PageHeader title="Canciones" subtitle="Playlist colaborativa por evento" />

      {events.length === 0 ? (
        <EmptyState icon={Music} title="Sin eventos" description="Únete a un evento para sugerir canciones" />
      ) : (
        <ul className="space-y-2.5">
          {events.map((ev: any) => (
            <li key={ev.id}>
              <Link href={`/events/${ev.id}/songs`} className="card card-hover group flex items-center gap-4 p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl icon-badge">
                  <Music size={18} className="text-violet-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-neutral-100">{ev.title}</p>
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
