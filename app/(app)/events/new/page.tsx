import { PageHeader } from "@/components/ui/page-header"
import { NewEventForm } from "./new-event-form"

export default function NewEventPage() {
  return (
    <div className="px-4 pt-8 space-y-6">
      <PageHeader
        title="Nuevo evento"
        subtitle="Completa los detalles básicos"
        back="/events"
      />

      <div className="card p-5 fade-in">
        <NewEventForm />
      </div>
    </div>
  )
}
