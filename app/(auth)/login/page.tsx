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
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600 text-3xl font-bold text-white">
          E
        </div>
        <h1 className="text-2xl font-bold text-neutral-100">Events</h1>
        <p className="mt-1 text-sm text-neutral-400">Inicia sesión para continuar</p>
      </div>

      <LoginForm />
    </div>
  )
}
