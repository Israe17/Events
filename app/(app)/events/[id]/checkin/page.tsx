import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import { QRScanner } from "@/components/qr-scanner"
import { SectionHeader } from "@/components/ui/section-header"

export default async function CheckinPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  return (
    <div className="space-y-5 fade-in pb-6">
      <SectionHeader label="Check-in" color="text-violet-400" />
      <QRScanner eventId={id} userId={user.id} />
    </div>
  )
}
