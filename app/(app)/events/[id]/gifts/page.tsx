import { Gift } from "lucide-react"

export default function GiftsPage() {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <Gift size={40} className="text-neutral-600" />
      <div>
        <p className="font-semibold text-neutral-300">Lista de regalos</p>
        <p className="mt-1 text-sm text-neutral-500">Próximamente</p>
      </div>
    </div>
  )
}
