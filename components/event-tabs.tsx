"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, QrCode, ScanLine, Gift, Music } from "lucide-react"

const TABS = [
  { href: "",             icon: LayoutDashboard, label: "Resumen" },
  { href: "/invitations", icon: QrCode,          label: "Invitaciones" },
  { href: "/checkin",     icon: ScanLine,        label: "Check-in" },
  { href: "/gifts",       icon: Gift,            label: "Regalos" },
  { href: "/songs",       icon: Music,           label: "Canciones" },
]

export function EventTabs({ eventId }: { eventId: string }) {
  const pathname = usePathname()
  const base = `/events/${eventId}`

  return (
    <div className="flex overflow-x-auto scrollbar-hide px-4 gap-1">
      {TABS.map(({ href, icon: Icon, label }) => {
        const full = `${base}${href}`
        const active = href === "" ? pathname === full : pathname === full || pathname.startsWith(full + "/")

        return (
          <Link
            key={href}
            href={full}
            className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium whitespace-nowrap transition ${
              active
                ? "bg-violet-600/20 text-violet-300 ring-1 ring-violet-500/30 shadow-[0_0_20px_-4px_rgba(139,92,246,0.5)]"
                : "text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800/60"
            }`}
          >
            <Icon size={13} />
            {label}
          </Link>
        )
      })}
      <div className="shrink-0 w-4" aria-hidden />
    </div>
  )
}
