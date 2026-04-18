"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createClient } from "@/utils/supabase/server"

export type SuggestState = { error?: string; success?: boolean }

export async function suggestSong(
  eventId: string,
  _prev: SuggestState,
  formData: FormData
): Promise<SuggestState> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const title = (formData.get("title") as string)?.trim()
  const artist = (formData.get("artist") as string)?.trim() || null
  const spotifyUrl = (formData.get("spotify_url") as string) || null
  const coverUrl = (formData.get("cover_url") as string) || null
  const previewUrl = (formData.get("preview_url") as string) || null

  if (!title) return { error: "El nombre de la canción es requerido" }

  const { error } = await (supabase as any).from("event_song_suggestions").insert({
    event_id: eventId,
    title,
    artist,
    spotify_url: spotifyUrl,
    cover_image_url: coverUrl,
    preview_url: previewUrl,
    suggested_by_user_id: user.id,
    song_status: "pending",
  })

  if (error) {
    if (error.code === "23505") return { error: "Esta canción ya fue sugerida" }
    return { error: error.message }
  }

  revalidatePath(`/events/${eventId}/songs`)
  return { success: true }
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
