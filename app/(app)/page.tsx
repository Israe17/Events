import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"

export default async function HomePage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="px-4 pt-6">
      <h1 className="text-2xl font-bold text-neutral-100">Bienvenido</h1>
      <p className="mt-1 text-sm text-neutral-400">{user?.email}</p>

      <div className="mt-8 rounded-2xl bg-neutral-900 border border-neutral-800 p-6 text-center text-neutral-500 text-sm">
        No hay eventos próximos
      </div>
    </div>
  )
}
