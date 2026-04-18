import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import { LoginForm } from "./login-form"

export default async function LoginPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) redirect("/")

  return (
    <div className="relative w-full max-w-sm fade-in">
      {/* Glow behind card */}
      <div className="pointer-events-none absolute -inset-24 bg-gradient-to-br from-violet-600/20 via-fuchsia-600/10 to-transparent blur-3xl" />

      <div className="relative">
        {/* Brand */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-violet-500 via-violet-600 to-fuchsia-600 shadow-2xl shadow-violet-900/50">
            <span className="text-4xl font-bold text-white drop-shadow-md">E</span>
          </div>
          <h1 className="text-3xl font-bold text-neutral-50 tracking-tight text-glow">Events</h1>
          <p className="mt-2 text-sm text-neutral-500">Inicia sesión para continuar</p>
        </div>

        <div className="card p-6">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-neutral-600">
          Te enviaremos un enlace mágico — sin contraseñas
        </p>
      </div>
    </div>
  )
}
