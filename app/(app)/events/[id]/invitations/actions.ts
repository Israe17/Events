"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { randomUUID } from "crypto"

export async function createInvitation(eventId: string, formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const anyClient = supabase as any

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const holderName = formData.get("holder_name") as string
  const holderEmail = (formData.get("holder_email") as string) || null
  const holderPhone = (formData.get("holder_phone") as string) || null
  const maxEntries = parseInt(formData.get("max_entries") as string) || 1
  const mustEnterFirst = formData.get("holder_must_enter_first") === "on"

  const qrToken = randomUUID()

  const { data: inv, error } = (await anyClient
    .from("event_invitations")
    .insert({
      event_id: eventId,
      holder_name: holderName,
      holder_email: holderEmail,
      holder_phone: holderPhone,
      max_entries: maxEntries,
      holder_must_enter_first: mustEnterFirst,
      qr_token: qrToken,
      approved_by: user.id,
      approved_at: new Date().toISOString(),
    })
    .select("id")
    .single()) as { data: { id: string } | null; error: { message: string } | null }

  if (error || !inv) throw new Error(error?.message ?? "Error creando invitación")

  redirect(`/events/${eventId}/invitations/${inv.id}`)
}

export async function deleteInvitation(eventId: string, invId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  await (supabase as any).from("event_invitations").delete().eq("id", invId)
  redirect(`/events/${eventId}/invitations`)
}
