"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

function toSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-") +
    "-" +
    Math.random().toString(36).slice(2, 7)
  )
}

export async function createEvent(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const title = formData.get("title") as string
  const description = (formData.get("description") as string) || null
  const startsAt = (formData.get("starts_at") as string) || null
  const endsAt = (formData.get("ends_at") as string) || null
  const venueName = (formData.get("venue_name") as string) || null
  const city = (formData.get("city") as string) || null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyClient = supabase as any

  const { data: event, error } = (await anyClient
    .from("events")
    .insert({
      title,
      slug: toSlug(title),
      description,
      starts_at: startsAt,
      ends_at: endsAt,
      venue_name: venueName,
      city,
      created_by: user.id,
    })
    .select("id")
    .single()) as { data: { id: string } | null; error: { message: string } | null }

  if (error || !event) {
    throw new Error(error?.message ?? "Error creando evento")
  }

  await anyClient.from("event_users").insert({
    event_id: event.id,
    user_id: user.id,
    role: "host",
  })

  redirect(`/events/${event.id}`)
}
