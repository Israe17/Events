"use client"

import { useState } from "react"
import { Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
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
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })

    if (error) setError(error.message)
    else setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="scale-in flex flex-col items-center gap-3 py-2 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-600/15 ring-1 ring-green-500/30">
          <CheckCircle2 size={26} className="text-green-400" />
        </div>
        <div>
          <p className="text-lg font-semibold text-neutral-100">Revisa tu correo</p>
          <p className="mt-1 text-sm text-neutral-500">
            Enviamos un enlace mágico a
          </p>
          <p className="mt-0.5 text-sm font-medium text-violet-400">{email}</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleMagicLink} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-400">
          <Mail size={11} /> Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.com"
          autoComplete="email"
          className="input"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-900/20 border border-red-800/40 px-3 py-2.5 text-sm text-red-300">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !email}
        className="btn-brand flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white transition disabled:opacity-50 disabled:shadow-none"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : "Enviar enlace mágico"}
      </button>
    </form>
  )
}
