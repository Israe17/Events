import { User, Mail, Phone, Users, Shield } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { createInvitation } from "../actions"
import { SectionHeader } from "@/components/ui/section-header"

export default async function NewInvitationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const action = createInvitation.bind(null, id)

  return (
    <div className="space-y-5 fade-in pb-6">
      <SectionHeader label="Nueva invitación" color="text-violet-400" />

      <form action={action} className="card p-5 space-y-5">
        <Field label="Nombre del titular" name="holder_name" required placeholder="María García" icon={User} />
        <Field label="Correo electrónico" name="holder_email" type="email" placeholder="opcional" icon={Mail} />
        <Field label="Teléfono" name="holder_phone" type="tel" placeholder="opcional" icon={Phone} />

        <div>
          <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            <Users size={11} /> Entradas <span className="text-violet-400">*</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
              <label key={n} className="cursor-pointer">
                <input type="radio" name="max_entries" value={n} defaultChecked={n === 1} className="peer sr-only" />
                <div className="flex items-center justify-center rounded-xl border border-neutral-700 bg-neutral-900/50 py-2.5 text-sm font-semibold text-neutral-400 transition peer-checked:border-violet-500 peer-checked:bg-violet-600/20 peer-checked:text-violet-200 peer-checked:shadow-[0_0_20px_-4px_rgba(139,92,246,0.5)]">
                  {n}
                </div>
              </label>
            ))}
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 transition has-[:checked]:border-violet-500/50 has-[:checked]:bg-violet-600/10">
          <input type="checkbox" name="holder_must_enter_first" className="mt-0.5 h-4 w-4 rounded accent-violet-500" />
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <Shield size={13} className="text-violet-400" />
              <p className="text-sm font-medium text-neutral-100">Titular debe entrar primero</p>
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              Bloquea las entradas adicionales hasta que el titular haga check-in
            </p>
          </div>
        </label>

        <button
          type="submit"
          className="btn-brand w-full rounded-xl py-3.5 text-sm font-semibold text-white"
        >
          Crear invitación
        </button>
      </form>
    </div>
  )
}

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
  icon: LucideIcon
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-400">
        <Icon size={11} />
        {label}
        {required && <span className="text-violet-400">*</span>}
      </label>
      <input type={type} name={name} required={required} placeholder={placeholder} className="input" />
    </div>
  )
}
