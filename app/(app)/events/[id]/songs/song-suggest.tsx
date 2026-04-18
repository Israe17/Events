"use client"

import { useRef, useState, useTransition } from "react"
import { Search, Music2, Loader2, Plus, X } from "lucide-react"
import { suggestSong } from "./actions"

type Track = {
  id: string
  title: string
  artist: string
  album: string
  cover_url: string
  spotify_url: string
}

function msToMin(ms: number) {
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`
}

export function SongSuggest({
  eventId,
  hasSpotify,
}: {
  eventId: string
  hasSpotify: boolean
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Track[]>([])
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState<Track | null>(null)
  const [isPending, startTransition] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    startTransition(async () => {
      await suggestSong(eventId, data)
      setOpen(false)
      setQuery("")
      setResults([])
      setSelected(null)
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500 active:scale-95"
      >
        <Plus size={16} />
        Sugerir canción
      </button>
    )
  }

  return (
    <div className="rounded-2xl border border-violet-700/50 bg-neutral-900 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-neutral-200">Sugerir canción</p>
        <button onClick={() => { setOpen(false); setSelected(null); setResults([]); setQuery("") }} className="text-neutral-500 hover:text-neutral-300">
          <X size={18} />
        </button>
      </div>

      {hasSpotify ? (
        <>
          {/* Spotify search */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              autoFocus
              value={query}
              onChange={(e) => handleQuery(e.target.value)}
              placeholder="Buscar en Spotify…"
              className="w-full rounded-xl bg-neutral-800 border border-neutral-700 pl-9 pr-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 outline-none focus:border-violet-500 transition"
            />
            {searching && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-violet-400" />}
          </div>

          {/* Results */}
          {results.length > 0 && !selected && (
            <ul className="space-y-1 max-h-64 overflow-y-auto">
              {results.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => { setSelected(t); setResults([]) }}
                    className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-neutral-800"
                  >
                    {t.cover_url ? (
                      <img src={t.cover_url} alt="" className="h-10 w-10 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-700">
                        <Music2 size={16} className="text-neutral-400" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-neutral-100">{t.title}</p>
                      <p className="truncate text-xs text-neutral-500">{t.artist}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Selected track → confirm */}
          {selected && (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="hidden" name="title" value={selected.title} />
              <input type="hidden" name="artist" value={selected.artist} />
              <input type="hidden" name="spotify_url" value={selected.spotify_url} />
              <input type="hidden" name="cover_url" value={selected.cover_url} />

              <div className="flex items-center gap-3 rounded-xl bg-neutral-800 p-3">
                {selected.cover_url && (
                  <img src={selected.cover_url} alt="" className="h-12 w-12 rounded-lg object-cover shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="truncate font-semibold text-neutral-100">{selected.title}</p>
                  <p className="truncate text-sm text-neutral-400">{selected.artist}</p>
                </div>
                <button type="button" onClick={() => setSelected(null)} className="ml-auto text-neutral-500 hover:text-neutral-300 shrink-0">
                  <X size={16} />
                </button>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-xl bg-green-700 py-3 text-sm font-semibold text-white transition hover:bg-green-600 active:scale-95 disabled:opacity-50"
              >
                {isPending ? <Loader2 size={16} className="mx-auto animate-spin" /> : "Sugerir esta canción"}
              </button>
            </form>
          )}
        </>
      ) : (
        /* Manual form when no Spotify creds */
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="title"
            required
            placeholder="Nombre de la canción *"
            className="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 outline-none focus:border-violet-500 transition"
          />
          <input
            name="artist"
            placeholder="Artista"
            className="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 outline-none focus:border-violet-500 transition"
          />
          <input
            name="spotify_url"
            type="url"
            placeholder="Link de Spotify (opcional)"
            className="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 outline-none focus:border-violet-500 transition"
          />
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 active:scale-95 disabled:opacity-50"
          >
            {isPending ? <Loader2 size={16} className="mx-auto animate-spin" /> : "Sugerir"}
          </button>
        </form>
      )}
    </div>
  )
}
