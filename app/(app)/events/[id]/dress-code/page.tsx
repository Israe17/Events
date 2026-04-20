import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { Shirt, Trash2 } from "lucide-react"
import { PinterestEmbed } from "@/components/pinterest-embed"
import { PinterestIcon } from "@/components/ui/pinterest-icon"
import { EmptyState } from "@/components/ui/empty-state"
import { AddPin } from "./add-pin"
import { EditDescription } from "./edit-description"
import { VoteButton } from "./vote-button"
import { deletePin } from "./actions"

type PinRow = {
  id: string
  pinterest_url: string
  pin_type: "pin" | "board" | "profile"
  note: string | null
  vote_count: number
}

export default async function DressCodePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [{ data: event }, { data: membership }, { data: pinsRaw }, { data: myVotes }] =
    await Promise.all([
      (supabase as any)
        .from("events")
        .select("dress_code_description")
        .eq("id", id)
        .single(),
      (supabase as any)
        .from("event_users")
        .select("role")
        .eq("event_id", id)
        .eq("user_id", user.id)
        .single(),
      (supabase as any)
        .from("v_event_dress_code_ranking")
        .select("id, pinterest_url, pin_type, note, vote_count")
        .eq("event_id", id)
        .order("vote_count", { ascending: false })
        .order("created_at", { ascending: false }),
      (supabase as any)
        .from("event_dress_code_votes")
        .select("pin_id")
        .eq("event_id", id)
        .eq("user_id", user.id),
    ])

  const role = membership?.role as string | undefined
  const isHost = role === "host" || role === "admin"
  const description = (event?.dress_code_description as string | null) ?? null
  const pins = (pinsRaw ?? []) as PinRow[]
  const votedSet = new Set((myVotes ?? []).map((v: any) => v.pin_id as string))

  return (
    <div className="space-y-5 pb-10">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-bold text-neutral-100">Dress code</h2>
          <p className="mt-0.5 text-xs text-neutral-500">
            {pins.length} {pins.length === 1 ? "inspiración" : "inspiraciones"}
          </p>
        </div>
        {isHost && <AddPin eventId={id} />}
      </div>

      {/* Description card */}
      {(description || isHost) && (
        <div className="rounded-2xl border border-neutral-800 bg-gradient-to-br from-violet-600/10 via-neutral-900 to-neutral-900 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600/15 text-violet-400 ring-1 ring-violet-500/20">
              <Shirt size={17} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400/80">
                Código
              </p>
              {description ? (
                <p className="mt-1 text-sm leading-relaxed text-neutral-200 whitespace-pre-wrap">
                  {description}
                </p>
              ) : (
                <p className="mt-1 text-sm italic text-neutral-600">
                  Sin descripción — toca el lápiz para agregar una
                </p>
              )}
            </div>
            {isHost && (
              <EditDescription eventId={id} initialDescription={description} />
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {pins.length === 0 && (
        <EmptyState
          icon={Shirt}
          title="Sin inspiración todavía"
          description={
            isHost
              ? "Agrega pines o tableros de Pinterest para inspirar el look"
              : "El host aún no comparte inspiración"
          }
        />
      )}

      {/* Pins grid */}
      {pins.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {pins.map((pin) => (
            <PinCard
              key={pin.id}
              eventId={id}
              pin={pin}
              voted={votedSet.has(pin.id)}
              isHost={isHost}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function PinCard({
  eventId,
  pin,
  voted,
  isHost,
}: {
  eventId: string
  pin: PinRow
  voted: boolean
  isHost: boolean
}) {
  const deleteAction = deletePin.bind(null, eventId, pin.id)

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
      {pin.note && (
        <p className="mb-3 text-sm font-medium text-neutral-200">{pin.note}</p>
      )}

      <div className="min-h-[200px]">
        <PinterestEmbed url={pin.pinterest_url} type={pin.pin_type} size="medium" />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <VoteButton
          eventId={eventId}
          pinId={pin.id}
          voted={voted}
          count={pin.vote_count}
        />
        <div className="flex items-center gap-2">
          <a
            href={pin.pinterest_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-500 hover:text-[#E60023] transition"
          >
            <PinterestIcon size={12} />
            Abrir en Pinterest
          </a>
          {isHost && (
            <form action={deleteAction}>
              <button
                type="submit"
                title="Eliminar"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-600 transition hover:bg-red-900/30 hover:text-red-400 active:scale-90"
              >
                <Trash2 size={13} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
