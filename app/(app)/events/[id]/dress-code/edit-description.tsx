"use client"

import { useEffect, useRef, useState } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { Pencil, X, Check, AlertCircle, Loader2 } from "lucide-react"
import { updateDressCode, type DressCodeState } from "./actions"

export function EditDescription({
  eventId,
  initialDescription,
}: {
  eventId: string
  initialDescription: string | null
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
      <button
        onClick={openModal}
        className="flex shrink-0 h-8 w-8 items-center justify-center rounded-lg bg-neutral-800/80 text-neutral-400 transition hover:bg-neutral-700 hover:text-neutral-200 active:scale-90"
        title="Editar descripción"
      >
        <Pencil size={13} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-700/60 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-neutral-800">
              <p className="font-semibold text-neutral-100">Código de vestimenta</p>
              <button onClick={closeModal} className="rounded-lg p-1.5 text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800 transition">
                <X size={17} />
              </button>
            </div>

            <ModalContent
              key={modalKey}
              eventId={eventId}
              initialDescription={initialDescription}
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
  initialDescription,
  onClose,
}: {
  eventId: string
  initialDescription: string | null
  onClose: () => void
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const boundAction = updateDressCode.bind(null, eventId)
  const [state, formAction] = useFormState<DressCodeState, FormData>(boundAction, {})

  useEffect(() => {
    setTimeout(() => textareaRef.current?.focus(), 50)
  }, [])

  useEffect(() => {
    if (state.success) {
      const t = setTimeout(onClose, 800)
      return () => clearTimeout(t)
    }
  }, [state.success, onClose])

  return (
    <form action={formAction} className="p-5 space-y-4">
      {state.success && (
        <div className="flex items-center gap-2 rounded-xl bg-green-900/40 border border-green-800/60 px-4 py-3 text-sm text-green-300">
          <Check size={15} />
          ¡Guardado!
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
          Descripción
        </label>
        <textarea
          ref={textareaRef}
          name="description"
          defaultValue={initialDescription ?? ""}
          placeholder="Ej. Formal con tonos tierra. Sin tennis, sin jeans."
          rows={5}
          className="w-full resize-none rounded-xl bg-neutral-800 border border-neutral-700 px-3.5 py-3 text-sm text-neutral-100 placeholder-neutral-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition"
        />
        <p className="mt-1.5 text-[11px] text-neutral-600">
          Deja vacío para quitar la descripción
        </p>
      </div>

      <SubmitButton />
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition active:scale-95 hover:bg-violet-500 disabled:opacity-50"
    >
      {pending ? <Loader2 size={15} className="animate-spin" /> : <><Check size={15} />Guardar</>}
    </button>
  )
}
