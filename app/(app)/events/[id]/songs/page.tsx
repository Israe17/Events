import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import { hasSpotifyCredentials } from "@/lib/spotify"
import { approveSong, rejectSong, deleteSong } from "./actions"
import { SongSuggest } from "./song-suggest"
import { Music2, ExternalLink, ThumbsUp, Check, X, Trash2, Disc3, Mic2 } from "lucide-react"

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
      .eq("event_id", id),
  ])

  const byId = Object.fromEntries((allSongs ?? []).map((s: any) => [s.id, s]))

  const songs: Song[] = (rankData ?? []).map((r: any) => ({
    ...r,
    preview_url: byId[r.id]?.preview_url ?? null,
  }))

  const approved = songs.filter((s) => s.song_status === "approved" || s.song_status === "added_to_playlist")
  const pending  = songs.filter((s) => s.song_status === "pending")
  const rejected = songs.filter((s) => s.song_status === "rejected")

  const existingSpotifyUrls = (allSongs ?? []).filter((s: any) => s.spotify_url).map((s: any) => s.spotify_url as string)
  const existingTitles = (allSongs ?? []).map((s: any) => `${s.title.toLowerCase()}||${(s.artist ?? "").toLowerCase()}`)

  const hasSpotify = hasSpotifyCredentials()
  const maxVotes = Math.max(1, ...songs.map((s) => s.vote_count ?? 0))

  const spotifyPlaylistId = event?.playlist_url?.split("/").pop()?.split("?")[0]

  return (
    <div className="space-y-5 pb-10">
      {/* Spotify playlist embed */}
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

      {/* Header bar */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-bold text-neutral-100">Playlist colaborativa</h2>
          <p className="mt-0.5 text-xs text-neutral-500">
            {songs.length} {songs.length === 1 ? "canción" : "canciones"}
            {pending.length > 0 && ` · ${pending.length} esperando`}
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
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-neutral-700 p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600/10 ring-1 ring-violet-500/20">
            <Disc3 size={30} className="text-violet-500" />
          </div>
          <div>
            <p className="font-semibold text-neutral-200">Sin canciones todavía</p>
            <p className="mt-1 text-sm text-neutral-600">Sé el primero en sugerir una</p>
          </div>
        </div>
      )}

      {/* Approved */}
      {approved.length > 0 && (
        <div className="space-y-1.5">
          <SectionHeader label="Aprobadas" count={approved.length} color="text-green-400" />
          {approved.map((song, i) => (
            <SongRow key={song.id} song={song} rank={i + 1} eventId={id} maxVotes={maxVotes} />
          ))}
        </div>
      )}

      {/* Pending */}
      {pending.length > 0 && (
        <div className="space-y-1.5">
          <SectionHeader label="Esperando aprobación" count={pending.length} color="text-yellow-500" />
          {pending.map((song) => (
            <SongRow key={song.id} song={song} eventId={id} maxVotes={maxVotes} />
          ))}
        </div>
      )}

      {/* Rejected */}
      {rejected.length > 0 && (
        <div className="space-y-1.5">
          <SectionHeader label="Rechazadas" count={rejected.length} color="text-neutral-600" />
          {rejected.map((song) => (
            <SongRow key={song.id} song={song} eventId={id} maxVotes={maxVotes} muted />
          ))}
        </div>
      )}
    </div>
  )
}

function SectionHeader({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="flex items-center gap-2 pb-0.5">
      <p className={`text-[11px] font-bold uppercase tracking-widest ${color}`}>{label}</p>
      <span className="rounded-full bg-neutral-800 px-1.5 py-px text-[10px] tabular-nums text-neutral-500">{count}</span>
      <div className="flex-1 border-t border-neutral-800" />
    </div>
  )
}

function SongRow({
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
  const approveAction = approveSong.bind(null, eventId, song.id)
  const rejectAction  = rejectSong.bind(null, eventId, song.id)
  const deleteAction  = deleteSong.bind(null, eventId, song.id)
  const votes = song.vote_count ?? 0
  const pct   = maxVotes > 0 ? (votes / maxVotes) * 100 : 0

  return (
    <div
      className={`group relative flex items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-900 p-3 transition hover:border-neutral-700 ${muted ? "opacity-40" : ""}`}
    >
      {/* Blurred cover bg */}
      {song.cover_image_url && (
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl bg-cover bg-center opacity-[0.06]"
          style={{ backgroundImage: `url(${song.cover_image_url})` }}
        />
      )}

      {/* Rank number */}
      {rank && (
        <span className="absolute -left-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-600 px-1 text-[9px] font-bold text-white shadow">
          {rank}
        </span>
      )}

      {/* Cover */}
      <div className="relative shrink-0">
        {song.cover_image_url ? (
          <img src={song.cover_image_url} alt="" className="h-[52px] w-[52px] rounded-xl object-cover shadow-md" />
        ) : (
          <div className="flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-neutral-800">
            <Mic2 size={20} className="text-neutral-600" />
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-semibold leading-tight text-neutral-100">{song.title}</p>
          {song.spotify_url && (
            <a href={song.spotify_url} target="_blank" rel="noopener noreferrer"
              className="shrink-0 text-[#1DB954]/70 hover:text-[#1DB954] transition">
              <ExternalLink size={11} />
            </a>
          )}
        </div>
        {song.artist && (
          <p className="truncate text-xs leading-tight text-neutral-500">{song.artist}</p>
        )}

        {/* Vote progress */}
        {votes > 0 && (
          <div className="flex items-center gap-2 pt-0.5">
            <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-neutral-800">
              <div className="h-full rounded-full bg-violet-500/70 transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="flex shrink-0 items-center gap-0.5 text-[10px] tabular-nums text-neutral-600">
              <ThumbsUp size={9} />{votes}
            </span>
          </div>
        )}
      </div>

      {/* Status + actions */}
      <div className="flex shrink-0 items-center gap-1.5">
        {song.song_status === "pending" && (
          <>
            <form action={approveAction}>
              <button type="submit" title="Aprobar"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-900/40 text-green-400 transition hover:bg-green-800/60 active:scale-90">
                <Check size={15} />
              </button>
            </form>
            <form action={rejectAction}>
              <button type="submit" title="Rechazar"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-900/30 text-red-400 transition hover:bg-red-900/50 active:scale-90">
                <X size={15} />
              </button>
            </form>
          </>
        )}

        {song.song_status === "approved" && (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-900/40">
            <Check size={13} className="text-green-400" />
          </div>
        )}

        {song.song_status !== "pending" && (
          <form action={deleteAction}>
            <button type="submit" title="Eliminar"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-neutral-700 opacity-0 transition hover:bg-neutral-800 hover:text-neutral-400 group-hover:opacity-100 active:scale-90">
              <Trash2 size={14} />
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
