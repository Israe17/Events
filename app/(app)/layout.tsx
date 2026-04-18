import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import { BottomNav } from "@/components/bottom-nav"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  return (
    <div className="relative flex min-h-dvh flex-col pt-safe">
      <main className="flex-1 pb-32">{children}</main>
      <BottomNav />
    </div>
  )
}
