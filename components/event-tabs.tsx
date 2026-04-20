"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, QrCode, ScanLine, Gift, Music, Shirt } from "lucide-react"

const TABS = [
  { href: "",             icon: LayoutDashboard, label: "Resumen" },
  { href: "/invitations", icon: QrCode,          label: "Invitaciones" },
  { href: "/checkin",     icon: ScanLine,        label: "Check-in" },
  { href: "/dress-code",  icon: Shirt,           label: "Dress code" },
  { href: "/gifts",       icon: Gift,            label: "Regalos" },
  { href: "/songs",       icon: Music,           label: "Canciones" },
]

export function EventTabs({ eventId }: { eventId: string }) {
  const pathname = usePathname()
  const base = `/events/${eventId}`

  return (
    <div className="flex items-center gap-1.5">
      {TABS.map(({ href, icon: Icon, label }) => {
        const full = `${base}${href}`
        const active = href === "" ? pathname === full : pathname === full || pathname.startsWith(full + "/")

        return (
          <Link
            key={href}
            href={full}
            aria-label={label}
            title={label}
            className={`group relative flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-medium whitespace-nowrap transition-all ${
              active
                ? "flex-[2] bg-violet-600/20 text-violet-300 ring-1 ring-violet-500/30 shadow-[0_0_20px_-4px_rgba(139,92,246,0.5)] px-3"
                : "flex-1 text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800/60 px-2"
            }`}
          >
            <Icon size={14} />
            {active && <span className="truncate">{label}</span>}
          </Link>
        )
      })}
    </div>
  )
}
