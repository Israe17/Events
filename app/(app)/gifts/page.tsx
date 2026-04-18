import Link from "next/link"
import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import { Gift } from "lucide-react"

export default async function GlobalGiftsPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: raw } = await (supabase as any)
    .from("event_users")
    .select("event:events(id, title, starts_at)")
    .order("created_at", { ascending: false })

  const events = ((raw ?? []) as any[]).map((m: any) => m.event).filter(Boolean)

  return (
    <div className="px-4 pt-6">
      <h1 className="mb-6 text-2xl font-bold text-neutral-100">Regalos</h1>
      {events.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-900 p-10 text-center">
          <Gift size={36} className="text-neutral-600" />
          <p className="text-sm text-neutral-500">Sin eventos</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {events.map((ev: any) => (
            <li key={ev.id}>
              <Link href={`/events/${ev.id}/gifts`} className="flex items-center gap-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-4 transition hover:border-violet-700 active:scale-[0.98]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600/20">
                  <Gift size={20} className="text-violet-400" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-neutral-100">{ev.title}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
