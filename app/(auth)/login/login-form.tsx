"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6 text-center">
        <p className="text-lg font-semibold text-neutral-100">Revisa tu correo</p>
        <p className="mt-2 text-sm text-neutral-400">
          Enviamos un enlace mágico a <span className="text-violet-400">{email}</span>
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleMagicLink} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-neutral-300">
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.com"
          className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-4 py-3 text-sm text-neutral-100 placeholder-neutral-500 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 active:scale-95 disabled:opacity-50"
      >
        {loading ? "Enviando…" : "Enviar enlace mágico"}
      </button>
    </form>
  )
}
