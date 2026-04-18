import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import { hasSpotifyCredentials } from "@/lib/spotify"
import { approveSong, rejectSong, deleteSong } from "./actions"
import { SongSuggest } from "./song-suggest"
import { Music2, ExternalLink, ThumbsUp, Check, X, Trash2, Disc3 } from "lucide-react"

type Song = {
  id: string
  title: string
  artist: string | null
  cover_image_url: string | null
  spotify_url: string | null
  preview_url: string | null
  song_status: string
  vote_count: number | null
}

const STATUS_CONFIG: Record<string, { label: string; dot: string }> = {
  pending:           { label: "Pendiente",   dot: "bg-yellow-400" },
  approved:          { label: "Aprobada",    dot: "bg-green-400" },
  rejected:          { label: "Rechazada",   dot: "bg-red-500" },
  added_to_playlist: { label: "En playlist", dot: "bg-violet-400" },
}

export default async function SongsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const [{ data: rankData }, { data: event }, { data: allSongs }] = await Promise.all([
    (supabase as any)
      .from("v_event_song_ranking")
      .select("*")
      .eq("event_id", id)
      .order("vote_count", { ascending: false }),
    (supabase as any).from("events").select("playlist_url, title").eq("id", id).single(),
    (supabase as any)
      .from("event_song_suggestions")
      .select("id, title, artist, cover_image_url, spotify_url, preview_url, song_status, created_at")
      .eq("event_id", id)
      .order("created_at", { ascending: false }),
  ])

  const songs: Song[] = (rankData ?? []).map((r: any) => ({
    ...r,
    preview_url:
      (allSongs ?? []).find((s: any) => s.id === r.id)?.preview_url ?? null,
  }))

  const approved = songs.filter((s) => s.song_status === "approved" || s.song_status === "added_to_playlist")
  const pending  = songs.filter((s) => s.song_status === "pending")
  const rejected = songs.filter((s) => s.song_status === "rejected")

  const existingSpotifyUrls = (allSongs ?? [])
    .filter((s: any) => s.spotify_url)
    .map((s: any) => s.spotify_url as string)

  const existingTitles = (allSongs ?? []).map((s: any) =>
    `${s.title.toLowerCase()}||${(s.artist ?? "").toLowerCase()}`
  )

  const hasSpotify = hasSpotifyCredentials()
  const maxVotes = songs[0]?.vote_count ?? 1

  const spotifyPlaylistId = event?.playlist_url?.split("/").pop()?.split("?")[0]

  return (
    <div className="space-y-6 pb-10">
      {/* Spotify embed */}
      {spotifyPlaylistId && (
        <div className="overflow-hidden rounded-2xl shadow-lg">
          <iframe
            src={`https://open.spotify.com/embed/playlist/${spotifyPlaylistId}`}
            width="100%"
            height="152"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-bold text-neutral-100">Playlist colaborativa</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            {songs.length} canciones · {approved.length} aprobadas · {pending.length} pendientes
          </p>
        </div>
        <SongSuggest
          eventId={id}
          hasSpotify={hasSpotify}
          existingSpotifyUrls={existingSpotifyUrls}
          existingTitles={existingTitles}
        />
      </div>

      {/* Empty state */}
      {songs.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600/10">
            <Disc3 size={32} className="text-violet-500" />
          </div>
          <div>
            <p className="font-semibold text-neutral-200">Sin canciones aún</p>
            <p className="mt-1 text-sm text-neutral-500">Sé el primero en sugerir una</p>
          </div>
        </div>
      )}

      {/* Approved */}
      {approved.length > 0 && (
        <Section title="Aprobadas" count={approved.length} accent="text-green-400">
          {approved.map((song, i) => (
            <SongCard key={song.id} song={song} rank={i + 1} eventId={id} maxVotes={maxVotes} />
          ))}
        </Section>
      )}

      {/* Pending */}
      {pending.length > 0 && (
        <Section title="Esperando aprobación" count={pending.length} accent="text-yellow-400">
          {pending.map((song) => (
            <SongCard key={song.id} song={song} eventId={id} maxVotes={maxVotes} />
          ))}
        </Section>
      )}

      {/* Rejected */}
      {rejected.length > 0 && (
        <Section title="Rechazadas" count={rejected.length} accent="text-neutral-600">
          {rejected.map((song) => (
            <SongCard key={song.id} song={song} eventId={id} maxVotes={maxVotes} muted />
          ))}
        </Section>
      )}
    </div>
  )
}

function Section({
  title,
  count,
  accent,
  children,
}: {
  title: string
  count: number
  accent: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <p className={`text-xs font-bold uppercase tracking-wider ${accent}`}>{title}</p>
        <span className="rounded-full bg-neutral-800 px-1.5 py-0.5 text-xs text-neutral-500 tabular-nums">{count}</span>
      </div>
      <ul className="space-y-2">{children}</ul>
    </div>
  )
}

function SongCard({
  song,
  rank,
  eventId,
  maxVotes,
  muted,
}: {
  song: Song
  rank?: number
  eventId: string
  maxVotes: number
  muted?: boolean
}) {
  const status = STATUS_CONFIG[song.song_status] ?? STATUS_CONFIG.pending
  const approveAction = approveSong.bind(null, eventId, song.id)
  const rejectAction  = rejectSong.bind(null, eventId, song.id)
  const deleteAction  = deleteSong.bind(null, eventId, song.id)
  const votes = song.vote_count ?? 0
  const votePercent = maxVotes > 0 ? Math.round((votes / maxVotes) * 100) : 0

  return (
    <li className={`group relative overflow-hidden rounded-2xl border bg-neutral-900 transition ${muted ? "border-neutral-800/50 opacity-50" : "border-neutral-800 hover:border-neutral-700"}`}>
      {/* Cover blur background */}
      {song.cover_image_url && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-5 blur-xl scale-110"
          style={{ backgroundImage: `url(${song.cover_image_url})` }}
        />
      )}

      <div className="relative flex items-center gap-3 p-3">
        {/* Rank / Cover */}
        <div className="shrink-0 relative">
          {song.cover_image_url ? (
            <img src={song.cover_image_url} alt="" className="h-14 w-14 rounded-xl object-cover shadow-md" />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-neutral-800">
              <Music2 size={20} className="text-neutral-600" />
            </div>
          )}
          {rank && (
            <span className="absolute -left-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white shadow">
              {rank}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate font-semibold text-neutral-100 text-sm leading-tight">{song.title}</p>
            {song.spotify_url && (
              <a
                href={song.spotify_url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-green-500/70 hover:text-green-400 transition"
              >
                <ExternalLink size={11} />
              </a>
            )}
          </div>
          {song.artist && (
            <p className="truncate text-xs text-neutral-500 leading-tight mt-0.5">{song.artist}</p>
          )}

          {/* Vote bar */}
          {votes > 0 && (
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-neutral-800">
                <div
                  className="h-full rounded-full bg-violet-500 transition-all"
                  style={{ width: `${votePercent}%` }}
                />
              </div>
              <span className="flex items-center gap-0.5 text-[10px] text-neutral-500 tabular-nums">
                <ThumbsUp size={9} />
                {votes}
              </span>
            </div>
          )}

          {/* Status dot */}
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
            <span className="text-[10px] text-neutral-600">{status.label}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex shrink-0 flex-col gap-1">
          {song.song_status === "pending" && (
            <>
              <form action={approveAction}>
                <button
                  type="submit"
                  title="Aprobar"
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-green-900/40 text-green-400 transition hover:bg-green-800/60"
                >
                  <Check size={14} />
                </button>
              </form>
              <form action={rejectAction}>
                <button
                  type="submit"
                  title="Rechazar"
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-900/30 text-red-400 transition hover:bg-red-900/50"
                >
                  <X size={14} />
                </button>
              </form>
            </>
          )}
          {song.song_status !== "pending" && (
            <form action={deleteAction}>
              <button
                type="submit"
                title="Eliminar"
                className="flex h-8 w-8 items-center justify-center rounded-xl text-neutral-700 transition hover:bg-neutral-800 hover:text-neutral-400"
              >
                <Trash2 size={14} />
              </button>
            </form>
          )}
        </div>
      </div>
    </li>
  )
}
