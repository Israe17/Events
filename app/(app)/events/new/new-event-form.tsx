"use client"

import { useRef, useState, useTransition } from "react"
import { createEvent } from "../actions"

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  placeholder?: string
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-neutral-300">
        {label}
        {required && <span className="ml-0.5 text-violet-400">*</span>}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-4 py-3 text-sm text-neutral-100 placeholder-neutral-500 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
      />
    </div>
  )
}

function TextAreaField({
  label,
  name,
  placeholder,
}: {
  label: string
  name: string
  placeholder?: string
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-neutral-300">{label}</label>
      <textarea
        name={name}
        rows={3}
        placeholder={placeholder}
        className="w-full resize-none rounded-xl bg-neutral-800 border border-neutral-700 px-4 py-3 text-sm text-neutral-100 placeholder-neutral-500 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
      />
    </div>
  )
}

export function NewEventForm() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const data = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await createEvent(data)
      } catch (err: any) {
        setError(err?.message ?? "Error desconocido")
      }
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 pb-10">
      <Field label="Nombre del evento" name="title" required placeholder="Ej: Cumpleaños de Ana" />

      <TextAreaField
        label="Descripción"
        name="description"
        placeholder="Descripción breve del evento (opcional)"
      />

      <div className="grid grid-cols-2 gap-3">
        <Field label="Inicio" name="starts_at" type="datetime-local" required />
        <Field label="Fin" name="ends_at" type="datetime-local" />
      </div>

      <Field label="Lugar / Venue" name="venue_name" placeholder="Ej: Casa de eventos La Paloma" />
      <Field label="Ciudad" name="city" placeholder="Ej: Ciudad de México" />

      {error && (
        <p className="rounded-xl bg-red-900/30 border border-red-800 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-violet-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-violet-500 active:scale-95 disabled:opacity-50"
      >
        {isPending ? "Creando…" : "Crear evento"}
      </button>
    </form>
  )
}
