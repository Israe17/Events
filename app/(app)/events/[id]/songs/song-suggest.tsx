"use client"

import { useActionState, useRef, useState } from "react"
import { Search, Music2, Loader2, Plus, X, Play, Pause, Check, AlertCircle } from "lucide-react"
import { suggestSong, type SuggestState } from "./actions"

type Track = {
  id: string
  title: string
  artist: string
  album: string
  cover_url: string
  spotify_url: string
  preview_url: string | null
  duration_ms: number
}

export function SongSuggest({
  eventId,
  hasSpotify,
  existingSpotifyUrls,
  existingTitles,
}: {
  eventId: string
  hasSpotify: boolean
  existingSpotifyUrls: string[]
  existingTitles: string[]
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Track[]>([])
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState<Track | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const boundAction = suggestSong.bind(null, eventId)
  const [state, formAction, isPending] = useActionState<SuggestState, FormData>(boundAction, {})

  function close() {
    setOpen(false)
    setQuery("")
    setResults([])
    setSelected(null)
    stopAudio()
  }

  function stopAudio() {
    audioRef.current?.pause()
    setPlayingId(null)
  }

  function togglePreview(track: Track) {
    if (!track.preview_url) return
    if (playingId === track.id) {
      stopAudio()
      return
    }
    stopAudio()
    const audio = new Audio(track.preview_url)
    audio.volume = 0.5
    audio.play()
    audio.onended = () => setPlayingId(null)
    audioRef.current = audio
    setPlayingId(track.id)
  }

  function handleQuery(val: string) {
    setQuery(val)
    setSelected(null)
    if (!hasSpotify) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (val.length < 2) { setResults([]); return }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(val)}`)
        setResults(await res.json())
      } finally {
        setSearching(false)
      }
    }, 400)
  }

  function selectTrack(t: Track) {
    stopAudio()
    setSelected(t)
    setResults([])
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:bg-violet-500 active:scale-95"
      >
        <Plus size={16} />
        Sugerir
      </button>
    )
  }

  return (
    <div className="rounded-2xl border border-violet-700/40 bg-neutral-900 p-4 space-y-3 shadow-xl">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-neutral-100">Sugerir canción</p>
        <button onClick={close} className="rounded-lg p-1 text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 transition">
          <X size={18} />
        </button>
      </div>

      {/* Success */}
      {state.success && (
        <div className="flex items-center gap-2 rounded-xl bg-green-900/30 border border-green-800/50 px-3 py-2.5 text-sm text-green-400">
          <Check size={15} />
          Canción sugerida exitosamente
        </div>
      )}

      {/* Error */}
      {state.error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-900/30 border border-red-800/50 px-3 py-2.5 text-sm text-red-400">
          <AlertCircle size={15} />
          {state.error}
        </div>
      )}

      {hasSpotify ? (
        <>
          {/* Search input */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
            <input
              autoFocus
              value={query}
              onChange={(e) => handleQuery(e.target.value)}
              placeholder="Buscar en Spotify…"
              className="w-full rounded-xl bg-neutral-800 border border-neutral-700 pl-9 pr-10 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition"
            />
            {searching && (
              <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-violet-400" />
            )}
          </div>

          {/* Results list */}
          {results.length > 0 && !selected && (
            <ul className="space-y-1 max-h-72 overflow-y-auto rounded-xl border border-neutral-800 bg-neutral-950 p-1">
              {results.map((t) => {
                const alreadySuggested = existingSpotifyUrls.includes(t.spotify_url)
                return (
                  <li key={t.id}>
                    <div className={`flex items-center gap-3 rounded-lg p-2 ${alreadySuggested ? "opacity-50" : "hover:bg-neutral-800 cursor-pointer"} transition`}>
                      {/* Cover */}
                      <div className="relative shrink-0">
                        {t.cover_url ? (
                          <img src={t.cover_url} alt="" className="h-11 w-11 rounded-lg object-cover" />
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-neutral-800">
                            <Music2 size={16} className="text-neutral-500" />
                          </div>
                        )}
                        {t.preview_url && !alreadySuggested && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); togglePreview(t) }}
                            className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 opacity-0 hover:opacity-100 transition"
                          >
                            {playingId === t.id ? <Pause size={14} className="text-white" /> : <Play size={14} className="text-white" />}
                          </button>
                        )}
                      </div>

                      {/* Info */}
                      <button
                        type="button"
                        disabled={alreadySuggested}
                        onClick={() => !alreadySuggested && selectTrack(t)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <p className="truncate text-sm font-medium text-neutral-100">{t.title}</p>
                        <p className="truncate text-xs text-neutral-500">{t.artist}</p>
                      </button>

                      {alreadySuggested ? (
                        <span className="shrink-0 rounded-full bg-neutral-800 px-2 py-0.5 text-xs text-neutral-500">Ya sugerida</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => selectTrack(t)}
                          className="shrink-0 flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600/20 text-violet-400 hover:bg-violet-600/40 transition"
                        >
                          <Plus size={14} />
                        </button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}

          {/* Selected → confirm form */}
          {selected && (
            <form action={formAction} className="space-y-3">
              <input type="hidden" name="title" value={selected.title} />
              <input type="hidden" name="artist" value={selected.artist} />
              <input type="hidden" name="spotify_url" value={selected.spotify_url} />
              <input type="hidden" name="cover_url" value={selected.cover_url} />
              <input type="hidden" name="preview_url" value={selected.preview_url ?? ""} />

              <div className="flex items-center gap-3 rounded-xl bg-neutral-800/80 border border-neutral-700 p-3">
                <div className="relative shrink-0">
                  {selected.cover_url && (
                    <img src={selected.cover_url} alt="" className="h-14 w-14 rounded-xl object-cover" />
                  )}
                  {selected.preview_url && (
                    <button
                      type="button"
                      onClick={() => togglePreview(selected)}
                      className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 opacity-0 hover:opacity-100 transition"
                    >
                      {playingId === selected.id ? <Pause size={16} className="text-white" /> : <Play size={16} className="text-white" />}
                    </button>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-neutral-100">{selected.title}</p>
                  <p className="truncate text-sm text-neutral-400">{selected.artist}</p>
                  <p className="text-xs text-neutral-600">{selected.album}</p>
                </div>
                <button type="button" onClick={() => setSelected(null)} className="shrink-0 text-neutral-500 hover:text-neutral-300">
                  <X size={16} />
                </button>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 py-3 text-sm font-semibold text-white transition hover:bg-green-600 active:scale-95 disabled:opacity-50"
              >
                {isPending ? <Loader2 size={15} className="animate-spin" /> : <><Check size={15} /> Confirmar sugerencia</>}
              </button>
            </form>
          )}
        </>
      ) : (
        /* Manual form */
        <form action={formAction} className="space-y-3">
          <input name="title" required placeholder="Nombre de la canción *"
            className="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 outline-none focus:border-violet-500 transition" />
          <input name="artist" placeholder="Artista"
            className="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 outline-none focus:border-violet-500 transition" />
          <input name="spotify_url" type="url" placeholder="Link de Spotify (opcional)"
            className="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 outline-none focus:border-violet-500 transition" />
          <button type="submit" disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 active:scale-95 disabled:opacity-50">
            {isPending ? <Loader2 size={15} className="animate-spin" /> : "Sugerir"}
          </button>
        </form>
      )}
    </div>
  )
}
