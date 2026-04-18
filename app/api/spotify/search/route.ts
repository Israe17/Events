import { NextResponse } from "next/server"
import { searchSpotify, hasSpotifyCredentials } from "@/lib/spotify"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")?.trim()

  if (!q || q.length < 2) return NextResponse.json([])
  if (!hasSpotifyCredentials()) return NextResponse.json([])

  const tracks = await searchSpotify(q)
  return NextResponse.json(tracks)
}
