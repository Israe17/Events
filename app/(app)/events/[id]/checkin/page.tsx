import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import { QRScanner } from "@/components/qr-scanner"

export default async function CheckinPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  return (
    <div className="space-y-4 pb-8">
      <div>
        <h2 className="font-semibold text-neutral-100">Check-in</h2>
        <p className="text-sm text-neutral-500">Escanea los códigos QR de los invitados</p>
      </div>
      <QRScanner eventId={id} userId={user.id} />
    </div>
  )
}
