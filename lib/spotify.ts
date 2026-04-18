// In-memory token cache (single server instance)
let cachedToken: { token: string; expires: number } | null = null

async function getAccessToken(): Promise<string | null> {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
  if (!clientId || !clientSecret) return null

  if (cachedToken && Date.now() < cachedToken.expires) return cachedToken.token

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
    next: { revalidate: 0 },
  })

  if (!res.ok) return null

  const data = await res.json()
  cachedToken = { token: data.access_token, expires: Date.now() + (data.expires_in - 60) * 1000 }
  return cachedToken.token
}

export type SpotifyTrack = {
  id: string
  title: string
  artist: string
  album: string
  cover_url: string
  preview_url: string | null
  spotify_url: string
  duration_ms: number
}

export async function searchSpotify(query: string, limit = 8): Promise<SpotifyTrack[]> {
  const token = await getAccessToken()
  if (!token) return []

  const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}&market=MX`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 30 },
  })
  if (!res.ok) return []

  const data = await res.json()
  return (data.tracks?.items ?? []).map((t: any) => ({
    id: t.id,
    title: t.name,
    artist: t.artists.map((a: any) => a.name).join(", "),
    album: t.album.name,
    cover_url: t.album.images?.[1]?.url ?? t.album.images?.[0]?.url ?? "",
    preview_url: t.preview_url,
    spotify_url: t.external_urls.spotify,
    duration_ms: t.duration_ms,
  }))
}

export function hasSpotifyCredentials(): boolean {
  return !!(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET)
}
