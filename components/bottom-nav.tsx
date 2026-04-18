"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CalendarDays, QrCode, Music, Gift, Home } from "lucide-react"

const NAV_ITEMS = [
  { href: "/",         icon: Home,         label: "Inicio" },
  { href: "/checkin",  icon: QrCode,       label: "Check-in" },
  { href: "/events",   icon: CalendarDays, label: "Eventos" },
  { href: "/songs",    icon: Music,        label: "Canciones" },
  { href: "/gifts",    icon: Gift,         label: "Regalos" },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 pointer-events-none pb-safe">
      <div className="pointer-events-auto mx-auto max-w-lg px-4 pb-3">
        <nav className="relative overflow-hidden rounded-2xl border border-neutral-800/80 bg-neutral-900/80 shadow-2xl shadow-black/40 backdrop-blur-xl">
          {/* Subtle gradient overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-violet-600/5 to-transparent" />

          <ul className="relative flex">
            {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
              const active =
                href === "/"
                  ? pathname === "/"
                  : pathname === href || pathname.startsWith(href + "/")

              return (
                <li key={href} className="flex-1">
                  <Link
                    href={href}
                    className="group relative flex flex-col items-center gap-0.5 py-2.5 text-xs transition"
                  >
                    {/* Active indicator */}
                    {active && (
                      <span className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-[0_0_12px_2px_rgba(139,92,246,0.5)]" />
                    )}

                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                        active
                          ? "bg-violet-600/20 text-violet-300 scale-105"
                          : "text-neutral-500 group-hover:text-neutral-200 group-hover:bg-neutral-800/60"
                      }`}
                    >
                      <Icon size={18} strokeWidth={active ? 2.4 : 1.8} />
                    </div>
                    <span
                      className={`text-[10px] font-medium transition ${
                        active ? "text-violet-300" : "text-neutral-500 group-hover:text-neutral-300"
                      }`}
                    >
                      {label}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </div>
  )
}
