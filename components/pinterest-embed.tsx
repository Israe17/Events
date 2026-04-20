"use client"

import { useEffect, useRef } from "react"
import type { PinType } from "@/lib/pinterest"

declare global {
  interface Window {
    PinUtils?: { build: (root?: Element) => void }
    __pinitLoaded?: boolean
  }
}

const SCRIPT_SRC = "https://assets.pinterest.com/js/pinit.js"

function loadPinit(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve()
  if (window.__pinitLoaded && window.PinUtils) return Promise.resolve()

  return new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`)
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true })
      if (window.PinUtils) resolve()
      return
    }
    const script = document.createElement("script")
    script.src = SCRIPT_SRC
    script.async = true
    script.setAttribute("data-pin-build", "doBuild")
    script.onload = () => {
      window.__pinitLoaded = true
      resolve()
    }
    document.body.appendChild(script)
  })
}

export function PinterestEmbed({
  url,
  type,
  size = "medium",
}: {
  url: string
  type: PinType
  size?: "small" | "medium" | "large"
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    loadPinit().then(() => {
      if (cancelled) return
      if (ref.current && window.PinUtils) window.PinUtils.build(ref.current)
    })
    return () => {
      cancelled = true
    }
  }, [url, type, size])

  const doAttr =
    type === "pin" ? "embedPin" : type === "board" ? "embedBoard" : "embedUser"

  return (
    <div ref={ref} className="flex justify-center">
      <a
        data-pin-do={doAttr}
        data-pin-width={size}
        data-pin-terse="true"
        href={url}
      />
    </div>
  )
}
