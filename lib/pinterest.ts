export type PinType = "pin" | "board" | "profile"

export type ParsedPinterestUrl = {
  type: PinType
  url: string
}

const HOST_RX = /^(?:[a-z]{2,3}\.)?pinterest\.[a-z.]+$/i

export function parsePinterestUrl(raw: string): ParsedPinterestUrl | null {
  if (!raw) return null

  let parsed: URL
  try {
    parsed = new URL(raw.trim())
  } catch {
    return null
  }

  const host = parsed.hostname.replace(/^www\./, "")
  if (!HOST_RX.test(host) && host !== "pin.it") return null

  // Normalize: strip query/hash, force HTTPS.
  parsed.protocol = "https:"
  parsed.search = ""
  parsed.hash = ""

  const segments = parsed.pathname.split("/").filter(Boolean)

  // Short link: pin.it/xxxxx → treat as a pin.
  if (host === "pin.it" && segments.length >= 1) {
    return { type: "pin", url: parsed.toString() }
  }

  // /pin/<id>
  if (segments[0] === "pin" && segments.length >= 2) {
    parsed.pathname = `/pin/${segments[1]}/`
    return { type: "pin", url: parsed.toString() }
  }

  // /<user>/<board>
  if (segments.length === 2) {
    parsed.pathname = `/${segments[0]}/${segments[1]}/`
    return { type: "board", url: parsed.toString() }
  }

  // /<user>
  if (segments.length === 1) {
    parsed.pathname = `/${segments[0]}/`
    return { type: "profile", url: parsed.toString() }
  }

  return null
}
