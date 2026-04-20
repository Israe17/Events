"use client"

import { useEffect, useRef, useState } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { Plus, X, Check, AlertCircle, Loader2, Link2 } from "lucide-react"
import { PinterestIcon } from "@/components/ui/pinterest-icon"
import { PinterestEmbed } from "@/components/pinterest-embed"
import { parsePinterestUrl } from "@/lib/pinterest"
import { addPin, type DressCodeState } from "./actions"

export function AddPin({ eventId }: { eventId: string }) {
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
      <button
        onClick={openModal}
        className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:bg-violet-500 active:scale-95"
      >
        <Plus size={16} />
        Agregar
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-700/60 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-neutral-800">
              <div className="flex items-center gap-2.5 min-w-0">
                <PinterestIcon size={16} />
                <p className="font-semibold text-neutral-100">Agregar inspiración</p>
              </div>
              <button onClick={closeModal} className="rounded-lg p-1.5 text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800 transition">
                <X size={17} />
              </button>
            </div>

            <ModalContent key={modalKey} eventId={eventId} onClose={closeModal} />
          </div>
        </div>
      )}
    </>
  )
}

function ModalContent({
  eventId,
  onClose,
}: {
  eventId: string
  onClose: () => void
}) {
  const [url, setUrl] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const boundAction = addPin.bind(null, eventId)
  const [state, formAction] = useFormState<DressCodeState, FormData>(boundAction, {})

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  useEffect(() => {
    if (state.success) {
      const t = setTimeout(onClose, 1000)
      return () => clearTimeout(t)
    }
  }, [state.success, onClose])

  const parsed = parsePinterestUrl(url)

  return (
    <form action={formAction} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
      {state.success && (
        <div className="flex items-center gap-2 rounded-xl bg-green-900/40 border border-green-800/60 px-4 py-3 text-sm text-green-300">
          <Check size={15} />
          ¡Pin agregado!
        </div>
      )}
      {state.error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-900/30 border border-red-800/50 px-4 py-3 text-sm text-red-400">
          <AlertCircle size={15} />
          {state.error}
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-xs font-medium text-neutral-400">
          URL de Pinterest
        </label>
        <div className="relative">
          <Link2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
          <input
            ref={inputRef}
            name="pinterest_url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://pinterest.com/..."
            required
            className="w-full rounded-xl bg-neutral-800 border border-neutral-700 pl-10 pr-3 py-3 text-sm text-neutral-100 placeholder-neutral-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition"
          />
        </div>
        <p className="mt-1.5 text-[11px] text-neutral-600">
          Pega el link de un pin, tablero o perfil de Pinterest
        </p>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-neutral-400">
          Nota (opcional)
        </label>
        <input
          name="note"
          placeholder="Ej. look principal, opción casual…"
          className="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-3.5 py-3 text-sm text-neutral-100 placeholder-neutral-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition"
        />
      </div>

      {parsed && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-3">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            Vista previa · {parsed.type}
          </p>
          <PinterestEmbed url={parsed.url} type={parsed.type} size="small" />
        </div>
      )}

      <SubmitButton disabled={!parsed} />
    </form>
  )
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition active:scale-95 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? <Loader2 size={15} className="animate-spin" /> : <><Check size={15} />Guardar</>}
    </button>
  )
}
