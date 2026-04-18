"use client"

import { useState, useTransition } from "react"
import { AlertCircle, Loader2, PartyPopper, FileText, Calendar, MapPin, Building2 } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { createEvent } from "../actions"

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  icon: Icon,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  placeholder?: string
  icon?: LucideIcon
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-400">
        {Icon && <Icon size={11} />}
        {label}
        {required && <span className="text-violet-400">*</span>}
      </label>
      <input type={type} name={name} required={required} placeholder={placeholder} className="input" />
    </div>
  )
}

export function NewEventForm() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

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
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="Nombre del evento" name="title" required placeholder="Ej: Cumpleaños de Ana" icon={PartyPopper} />

      <div>
        <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-400">
          <FileText size={11} /> Descripción
        </label>
        <textarea
          name="description"
          rows={3}
          placeholder="Descripción breve del evento (opcional)"
          className="input resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Inicio" name="starts_at" type="datetime-local" required icon={Calendar} />
        <Field label="Fin" name="ends_at" type="datetime-local" icon={Calendar} />
      </div>

      <Field label="Lugar / Venue" name="venue_name" placeholder="Ej: Casa La Paloma" icon={Building2} />
      <Field label="Ciudad" name="city" placeholder="Ej: Ciudad de México" icon={MapPin} />

      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-900/20 border border-red-800/50 px-4 py-3 text-sm text-red-300">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="btn-brand flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {isPending ? <Loader2 size={15} className="animate-spin" /> : "Crear evento"}
      </button>
    </form>
  )
}
