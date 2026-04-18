import { notFound, redirect } from "next/navigation"
import { cookies } from "next/headers"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { createClient } from "@/utils/supabase/server"

const EVENT_TABS = [
  { href: "", label: "Resumen" },
  { href: "/invitations", label: "Invitaciones" },
  { href: "/checkin", label: "Check-in" },
  { href: "/gifts", label: "Regalos" },
  { href: "/songs", label: "Canciones" },
]

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

  const event = (raw as { role: string; event: { id: string; title: string; event_status: string; starts_at: string | null; venue_name: string | null; city: string | null } }).event

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-neutral-950/95 backdrop-blur border-b border-neutral-800 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/events"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-800 text-neutral-300 transition hover:bg-neutral-700"
          >
            <ArrowLeft size={16} />
          </Link>
          <div className="min-w-0">
            <p className="truncate font-semibold text-neutral-100 leading-tight">{event.title}</p>
            {event.starts_at && (
              <p className="text-xs text-neutral-500">
                {new Date(event.starts_at).toLocaleDateString("es-MX", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="-mx-4 mt-3 flex overflow-x-auto px-4 scrollbar-hide">
          {EVENT_TABS.map((tab) => (
            <Link
              key={tab.href}
              href={`/events/${id}${tab.href}`}
              className="shrink-0 border-b-2 border-transparent px-4 pb-2 text-sm text-neutral-400 whitespace-nowrap transition hover:text-neutral-200"
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4">{children}</div>
    </div>
  )
}
