"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CalendarDays, QrCode, Music, Gift, LayoutDashboard } from "lucide-react"

const NAV_ITEMS = [
  { href: "/", icon: LayoutDashboard, label: "Inicio" },
  { href: "/checkin", icon: QrCode, label: "Check-in" },
  { href: "/songs", icon: Music, label: "Canciones" },
  { href: "/gifts", icon: Gift, label: "Regalos" },
  { href: "/events", icon: CalendarDays, label: "Eventos" },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-neutral-900/95 backdrop-blur border-t border-neutral-800 pb-safe z-50">
      <ul className="flex">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href))
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={[
                  "flex flex-col items-center gap-1 py-3 text-xs transition-colors",
                  active ? "text-violet-400" : "text-neutral-500 hover:text-neutral-300",
                ].join(" ")}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                <span>{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
