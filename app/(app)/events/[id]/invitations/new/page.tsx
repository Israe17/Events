import { createInvitation } from "../actions"

export default async function NewInvitationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const action = createInvitation.bind(null, id)

  return (
    <div className="space-y-4 pb-8">
      <h2 className="font-semibold text-neutral-100">Nueva invitación</h2>

      <form action={action} className="space-y-4">
        <Field label="Nombre del titular" name="holder_name" required placeholder="Ej: María García" />
        <Field label="Correo electrónico" name="holder_email" type="email" placeholder="opcional" />
        <Field label="Teléfono" name="holder_phone" type="tel" placeholder="opcional" />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-300">
            Entradas <span className="text-violet-400">*</span>
          </label>
          <select
            name="max_entries"
            defaultValue="1"
            className="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-4 py-3 text-sm text-neutral-100 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
          >
            {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "entrada" : "entradas"}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-3 rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-3 cursor-pointer">
          <input
            type="checkbox"
            name="holder_must_enter_first"
            className="h-4 w-4 rounded accent-violet-600"
          />
          <div>
            <p className="text-sm font-medium text-neutral-200">Titular debe entrar primero</p>
            <p className="text-xs text-neutral-500">Bloquea las entradas adicionales hasta que el titular haga check-in</p>
          </div>
        </label>

        <button
          type="submit"
          className="w-full rounded-xl bg-violet-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-violet-500 active:scale-95"
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
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  placeholder?: string
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-neutral-300">
        {label}
        {required && <span className="ml-0.5 text-violet-400">*</span>}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-4 py-3 text-sm text-neutral-100 placeholder-neutral-500 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
      />
    </div>
  )
}
