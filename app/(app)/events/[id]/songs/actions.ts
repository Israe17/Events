"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createClient } from "@/utils/supabase/server"

export async function suggestSong(eventId: string, formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const title = formData.get("title") as string
  const artist = (formData.get("artist") as string) || null
  const spotifyUrl = (formData.get("spotify_url") as string) || null
  const coverUrl = (formData.get("cover_url") as string) || null

  if (!title) return

  await (supabase as any).from("event_song_suggestions").insert({
    event_id: eventId,
    title,
    artist,
    spotify_url: spotifyUrl,
    cover_image_url: coverUrl,
    suggested_by_user_id: user.id,
    song_status: "pending",
  })

  revalidatePath(`/events/${eventId}/songs`)
}

export async function approveSong(eventId: string, songId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  await (supabase as any)
    .from("event_song_suggestions")
    .update({ song_status: "approved", added_to_playlist_at: new Date().toISOString() })
    .eq("id", songId)
    .eq("event_id", eventId)

  revalidatePath(`/events/${eventId}/songs`)
}

export async function rejectSong(eventId: string, songId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  await (supabase as any)
    .from("event_song_suggestions")
    .update({ song_status: "rejected" })
    .eq("id", songId)
    .eq("event_id", eventId)

  revalidatePath(`/events/${eventId}/songs`)
}

export async function deleteSong(eventId: string, songId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  await (supabase as any).from("event_song_suggestions").delete().eq("id", songId)
  revalidatePath(`/events/${eventId}/songs`)
}
