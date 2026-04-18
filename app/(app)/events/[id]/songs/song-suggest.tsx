"use client"

import { useRef, useState, useEffect } from "react"
import { useFormState, useFormStatus } from "react-dom"
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
}: {
  eventId: string
  hasSpotify: boolean
  existingSpotifyUrls: string[]
  existingTitles: string[]
}) {
  const [open, setOpen] = useState(false)
  const [modalKey, setModalKey] = useState(0)

  function openModal() {
    setModalKey((k) => k + 1)
    setOpen(true)
  }

  function closeModal() {
    setOpen(false)
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={openModal}
        className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:bg-violet-500 active:scale-95"
      >
        <Plus size={16} />
        Sugerir
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-700/60 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
              <p className="font-semibold text-neutral-100">Sugerir canción</p>
              <button onClick={closeModal} className="rounded-lg p-1.5 text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800 transition">
                <X size={17} />
              </button>
            </div>

            {/* key forces remount → resets useFormState on every open */}
            <ModalContent
              key={modalKey}
              eventId={eventId}
              hasSpotify={hasSpotify}
              existingSpotifyUrls={existingSpotifyUrls}
              onClose={closeModal}
            />
          </div>
        </div>
      )}
    </>
  )
}

function ModalContent({
  eventId,
  hasSpotify,
  existingSpotifyUrls,
  onClose,
}: {
  eventId: string
  hasSpotify: boolean
  existingSpotifyUrls: string[]
  onClose: () => void
}) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Track[]>([])
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState<Track | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const boundAction = suggestSong.bind(null, eventId)
  const [state, formAction] = useFormState<SuggestState, FormData>(boundAction, {})

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  useEffect(() => {
    if (state.success) {
      const t = setTimeout(onClose, 1200)
      return () => clearTimeout(t)
    }
  }, [state.success, onClose])

  function stopAudio() {
    audioRef.current?.pause()
    setPlayingId(null)
  }

  function togglePreview(track: Track) {
    if (!track.preview_url) return
    if (playingId === track.id) { stopAudio(); return }
    stopAudio()
    const audio = new Audio(track.preview_url)
    audio.volume = 0.6
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
      } finally { setSearching(false) }
    }, 400)
  }

  function selectTrack(t: Track) {
    stopAudio()
    setSelected(t)
    setResults([])
  }

  return (
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Feedback */}
              {state.success && (
                <div className="flex items-center gap-2 rounded-xl bg-green-900/40 border border-green-800/60 px-4 py-3 text-sm text-green-300">
                  <Check size={15} />
                  ¡Canción sugerida!
                </div>
              )}
              {state.error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-900/30 border border-red-800/50 px-4 py-3 text-sm text-red-400">
                  <AlertCircle size={15} />
                  {state.error}
                </div>
              )}

              {hasSpotify ? (
                <>
                  {/* Search */}
                  <div className="relative">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                    <input
                      ref={inputRef}
                      value={query}
                      onChange={(e) => handleQuery(e.target.value)}
                      placeholder="Buscar canción o artista…"
                      className="w-full rounded-xl bg-neutral-800 border border-neutral-700 pl-10 pr-10 py-3 text-sm text-neutral-100 placeholder-neutral-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition"
                    />
                    {searching
                      ? <Loader2 size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-violet-400" />
                      : query && <button onClick={() => { setQuery(""); setResults([]) }} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400"><X size={14} /></button>
                    }
                  </div>

                  {/* Results */}
                  {results.length > 0 && !selected && (
                    <ul className="space-y-1 rounded-xl border border-neutral-800 bg-neutral-950/80 p-1.5 max-h-60 overflow-y-auto">
                      {results.map((t) => {
                        const already = existingSpotifyUrls.includes(t.spotify_url)
                        return (
                          <li key={t.id} className={`flex items-center gap-3 rounded-xl p-2 transition ${already ? "opacity-40" : "hover:bg-neutral-800/80"}`}>
                            {/* Cover with play overlay */}
                            <div className="relative shrink-0 group/cover cursor-pointer" onClick={() => !already && togglePreview(t)}>
                              {t.cover_url
                                ? <img src={t.cover_url} alt="" className="h-11 w-11 rounded-lg object-cover" />
                                : <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-neutral-800"><Music2 size={16} className="text-neutral-600" /></div>
                              }
                              {t.preview_url && !already && (
                                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/60 opacity-0 group-hover/cover:opacity-100 transition">
                                  {playingId === t.id ? <Pause size={14} className="text-white" /> : <Play size={14} className="text-white" />}
                                </div>
                              )}
                            </div>

                            <button
                              type="button"
                              disabled={already}
                              onClick={() => !already && selectTrack(t)}
                              className="min-w-0 flex-1 text-left"
                            >
                              <p className="truncate text-sm font-medium text-neutral-100 leading-tight">{t.title}</p>
                              <p className="truncate text-xs text-neutral-500 leading-tight mt-0.5">{t.artist}</p>
                            </button>

                            {already
                              ? <span className="shrink-0 text-xs text-neutral-600 pr-1">Ya sugerida</span>
                              : (
                                <button
                                  type="button"
                                  onClick={() => selectTrack(t)}
                                  className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600/20 text-violet-400 hover:bg-violet-600/40 transition"
                                >
                                  <Plus size={15} />
                                </button>
                              )
                            }
                          </li>
                        )
                      })}
                    </ul>
                  )}

                  {/* Selected track */}
                  {selected && (
                    <form action={formAction} className="space-y-3">
                      <input type="hidden" name="title" value={selected.title} />
                      <input type="hidden" name="artist" value={selected.artist} />
                      <input type="hidden" name="spotify_url" value={selected.spotify_url} />
                      <input type="hidden" name="cover_url" value={selected.cover_url} />
                      <input type="hidden" name="preview_url" value={selected.preview_url ?? ""} />

                      <div className="relative overflow-hidden rounded-2xl border border-neutral-700 bg-neutral-800">
                        {selected.cover_url && (
                          <div className="absolute inset-0 bg-cover bg-center opacity-20 blur-lg scale-110" style={{ backgroundImage: `url(${selected.cover_url})` }} />
                        )}
                        <div className="relative flex items-center gap-4 p-4">
                          <div className="relative shrink-0 group/cover cursor-pointer" onClick={() => togglePreview(selected)}>
                            {selected.cover_url && (
                              <img src={selected.cover_url} alt="" className="h-16 w-16 rounded-xl object-cover shadow-lg" />
                            )}
                            {selected.preview_url && (
                              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 opacity-0 group-hover/cover:opacity-100 transition">
                                {playingId === selected.id ? <Pause size={18} className="text-white" /> : <Play size={18} className="text-white" />}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-bold text-neutral-100">{selected.title}</p>
                            <p className="truncate text-sm text-neutral-400">{selected.artist}</p>
                            <p className="truncate text-xs text-neutral-600 mt-0.5">{selected.album}</p>
                          </div>
                          <button type="button" onClick={() => { setSelected(null); setQuery("") }} className="shrink-0 text-neutral-500 hover:text-neutral-300 self-start">
                            <X size={16} />
                          </button>
                        </div>
                      </div>

                      <SubmitButton label="Confirmar sugerencia" color="green" />
                    </form>
                  )}

                  {!query && !selected && (
                    <p className="text-center text-xs text-neutral-600 py-2">Escribe para buscar en Spotify</p>
                  )}
                </>
              ) : (
                <form action={formAction} className="space-y-3">
                  <input name="title" required placeholder="Nombre de la canción *"
                    className="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-4 py-3 text-sm text-neutral-100 placeholder-neutral-500 outline-none focus:border-violet-500 transition" />
                  <input name="artist" placeholder="Artista"
                    className="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-4 py-3 text-sm text-neutral-100 placeholder-neutral-500 outline-none focus:border-violet-500 transition" />
                  <input name="spotify_url" type="url" placeholder="Link de Spotify (opcional)"
                    className="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-4 py-3 text-sm text-neutral-100 placeholder-neutral-500 outline-none focus:border-violet-500 transition" />
                  <SubmitButton label="Sugerir canción" color="violet" />
                </form>
              )}
            </div>
  )
}

function SubmitButton({ label, color }: { label: string; color: "green" | "violet" }) {
  const { pending } = useFormStatus()
  const cls = color === "green"
    ? "bg-green-700 hover:bg-green-600 shadow-green-900/40"
    : "bg-violet-600 hover:bg-violet-500 shadow-violet-900/40"
  return (
    <button
      type="submit"
      disabled={pending}
      className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white shadow-lg transition active:scale-95 disabled:opacity-50 ${cls}`}
    >
      {pending ? <Loader2 size={15} className="animate-spin" /> : <><Check size={15} />{label}</>}
    </button>
  )
}
