"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createClient } from "@/utils/supabase/server"
import { parsePinterestUrl } from "@/lib/pinterest"

export type DressCodeState = { error?: string; success?: boolean }

async function getHostSupabase(eventId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: membership } = await (supabase as any)
    .from("event_users")
    .select("role")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .single()

  const role = membership?.role as string | undefined
  const isHost = role === "host" || role === "admin"
  return { supabase, user, role, isHost }
}

export async function updateDressCode(
  eventId: string,
  _prev: DressCodeState,
  formData: FormData,
): Promise<DressCodeState> {
  const { supabase, isHost } = await getHostSupabase(eventId)
  if (!isHost) return { error: "Solo el host puede editar el dress code" }

  const description = (formData.get("description") as string)?.trim() || null

  const { error } = await (supabase as any)
    .from("events")
    .update({ dress_code_description: description })
    .eq("id", eventId)

  if (error) return { error: error.message }

  revalidatePath(`/events/${eventId}/dress-code`)
  return { success: true }
}

export async function addPin(
  eventId: string,
  _prev: DressCodeState,
  formData: FormData,
): Promise<DressCodeState> {
  const { supabase, user, isHost } = await getHostSupabase(eventId)
  if (!isHost) return { error: "Solo el host puede agregar pines" }

  const rawUrl = (formData.get("pinterest_url") as string)?.trim()
  const note = (formData.get("note") as string)?.trim() || null

  const parsed = parsePinterestUrl(rawUrl)
  if (!parsed) return { error: "URL de Pinterest inválida" }

  const { error } = await (supabase as any)
    .from("event_dress_code_pins")
    .insert({
      event_id: eventId,
      pinterest_url: parsed.url,
      pin_type: parsed.type,
      note,
      created_by_user_id: user.id,
    })

  if (error) {
    if (error.code === "23505") return { error: "Ya agregaste este pin" }
    return { error: error.message }
  }

  revalidatePath(`/events/${eventId}/dress-code`)
  return { success: true }
}

export async function deletePin(eventId: string, pinId: string) {
  const { supabase, isHost } = await getHostSupabase(eventId)
  if (!isHost) return

  await (supabase as any)
    .from("event_dress_code_pins")
    .delete()
    .eq("id", pinId)
    .eq("event_id", eventId)

  revalidatePath(`/events/${eventId}/dress-code`)
}

export async function togglePinVote(eventId: string, pinId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: existing } = await (supabase as any)
    .from("event_dress_code_votes")
    .select("id")
    .eq("pin_id", pinId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (existing) {
    await (supabase as any)
      .from("event_dress_code_votes")
      .delete()
      .eq("id", existing.id)
  } else {
    await (supabase as any)
      .from("event_dress_code_votes")
      .insert({ event_id: eventId, pin_id: pinId, user_id: user.id })
  }

  revalidatePath(`/events/${eventId}/dress-code`)
}
