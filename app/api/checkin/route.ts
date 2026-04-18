import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false, message: "No autenticado" }, { status: 401 })

  const { qr_token, scanned_by } = await request.json()

  if (!qr_token) {
    return NextResponse.json({ success: false, message: "Token inválido" }, { status: 400 })
  }

  const { data, error } = await (supabase as any).rpc("consume_invitation_entry", {
    p_qr_token: qr_token,
    p_scanned_by: scanned_by ?? user.id,
    p_is_holder: true,
  })

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }

  const result = Array.isArray(data) ? data[0] : data

  return NextResponse.json(result ?? { success: false, message: "Sin respuesta" })
}
