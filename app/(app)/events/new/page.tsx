import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { NewEventForm } from "./new-event-form"

export default function NewEventPage() {
  return (
    <div className="px-4 pt-6">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/events"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-800 text-neutral-300 transition hover:bg-neutral-700"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-bold text-neutral-100">Nuevo evento</h1>
      </div>

      <NewEventForm />
    </div>
  )
}
