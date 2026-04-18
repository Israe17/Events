import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import { hasSpotifyCredentials } from "@/lib/spotify"
import { approveSong, rejectSong, deleteSong } from "./actions"
import { SongSuggest } from "./song-suggest"
import { Music2, ExternalLink, ThumbsUp, Check, X, Trash2 } from "lucide-react"

const STATUS_CONFIG = {
  pending: { label: "Pendiente", color: "text-yellow-400 bg-yellow-900/20 border-yellow-800/50" },
  approved: { label: "Aprobada", color: "text-green-400 bg-green-900/20 border-green-800/50" },
  rejected: { label: "Rechazada", color: "text-red-400 bg-red-900/20 border-red-800/50" },
  added_to_playlist: { label: "En playlist", color: "text-violet-400 bg-violet-900/20 border-violet-800/50" },
}

export default async function SongsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Get songs ranked by votes
  const { data: songs } = (await (supabase as any)
    .from("v_event_song_ranking")
    .select("*")
    .eq("event_id", id)
    .order("vote_count", { ascending: false })
    .order("id")) as {
    data: {
      id: string
      title: string
      artist: string | null
      cover_image_url: string | null
      spotify_url: string | null
      song_status: string
      vote_count: number | null
    }[] | null
  }

  // Get event playlist url
  const { data: event } = (await (supabase as any)
    .from("events")
    .select("playlist_url, title")
    .eq("id", id)
    .single()) as { data: { playlist_url: string | null; title: string } | null }

  const songList = songs ?? []
  const approved = songList.filter((s) => s.song_status === "approved" || s.song_status === "added_to_playlist")
  const pending = songList.filter((s) => s.song_status === "pending")
  const rejected = songList.filter((s) => s.song_status === "rejected")

  const hasSpotify = hasSpotifyCredentials()

  return (
    <div className="space-y-5 pb-10">
      {/* Spotify playlist embed */}
      {event?.playlist_url && (
        <div className="overflow-hidden rounded-2xl">
          <iframe
            src={`https://open.spotify.com/embed/playlist/${event.playlist_url.split("/").pop()?.split("?")[0]}`}
            width="100%"
            height="152"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-2xl"
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-400">
            {songList.length} canciones · {approved.length} aprobadas
          </p>
          {!hasSpotify && (
            <p className="text-xs text-neutral-600 mt-0.5">
              Conecta Spotify en .env.local para búsqueda automática
            </p>
          )}
        </div>
        <SongSuggest eventId={id} hasSpotify={hasSpotify} />
      </div>

      {songList.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-900 p-10 text-center">
          <Music2 size={36} className="text-neutral-600" />
          <div>
            <p className="font-semibold text-neutral-300">Sin canciones aún</p>
            <p className="mt-1 text-sm text-neutral-500">Sé el primero en sugerir una canción</p>
          </div>
        </div>
      )}

      {/* Approved */}
      {approved.length > 0 && (
        <Section title="✓ Aprobadas">
          {approved.map((song, i) => (
            <SongCard key={song.id} song={song} rank={i + 1} eventId={id} showActions />
          ))}
        </Section>
      )}

      {/* Pending */}
      {pending.length > 0 && (
        <Section title="⏳ Pendientes">
          {pending.map((song) => (
            <SongCard key={song.id} song={song} eventId={id} showActions />
          ))}
        </Section>
      )}

      {/* Rejected */}
      {rejected.length > 0 && (
        <Section title="Rechazadas">
          {rejected.map((song) => (
            <SongCard key={song.id} song={song} eventId={id} showActions muted />
          ))}
        </Section>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">{title}</p>
      <ul className="space-y-2">{children}</ul>
    </div>
  )
}

function SongCard({
  song,
  rank,
  eventId,
  showActions,
  muted,
}: {
  song: { id: string; title: string; artist: string | null; cover_image_url: string | null; spotify_url: string | null; song_status: string; vote_count: number | null }
  rank?: number
  eventId: string
  showActions?: boolean
  muted?: boolean
}) {
  const status = STATUS_CONFIG[song.song_status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending
  const approveAction = approveSong.bind(null, eventId, song.id)
  const rejectAction = rejectSong.bind(null, eventId, song.id)
  const deleteAction = deleteSong.bind(null, eventId, song.id)

  return (
    <li className={`flex items-center gap-3 rounded-2xl border bg-neutral-900 p-3 ${muted ? "border-neutral-800 opacity-60" : "border-neutral-800"}`}>
      {/* Rank or cover */}
      {song.cover_image_url ? (
        <img src={song.cover_image_url} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" />
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-800">
          {rank ? (
            <span className="text-lg font-bold text-violet-400">{rank}</span>
          ) : (
            <Music2 size={20} className="text-neutral-500" />
          )}
        </div>
      )}

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold text-neutral-100 text-sm">{song.title}</p>
          {song.spotify_url && (
            <a href={song.spotify_url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-green-500 hover:text-green-400">
              <ExternalLink size={12} />
            </a>
          )}
        </div>
        {song.artist && <p className="truncate text-xs text-neutral-500">{song.artist}</p>}
        <div className="mt-1 flex items-center gap-2">
          <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${status.color}`}>
            {status.label}
          </span>
          {(song.vote_count ?? 0) > 0 && (
            <span className="flex items-center gap-1 text-xs text-neutral-500">
              <ThumbsUp size={10} />
              {song.vote_count}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      {showActions && song.song_status === "pending" && (
        <div className="flex shrink-0 gap-1">
          <form action={approveAction}>
            <button type="submit" className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-900/30 text-green-400 hover:bg-green-900/50 transition">
              <Check size={15} />
            </button>
          </form>
          <form action={rejectAction}>
            <button type="submit" className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-900/30 text-red-400 hover:bg-red-900/50 transition">
              <X size={15} />
            </button>
          </form>
        </div>
      )}
      {showActions && song.song_status !== "pending" && (
        <form action={deleteAction}>
          <button type="submit" className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-600 hover:text-neutral-400 transition">
            <Trash2 size={15} />
          </button>
        </form>
      )}
    </li>
  )
}
