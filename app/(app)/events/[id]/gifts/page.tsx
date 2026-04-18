import { Gift } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"

export default function GiftsPage() {
  return (
    <EmptyState
      icon={Gift}
      title="Lista de regalos"
      description="Próximamente — los invitados podrán reservar regalos"
    />
  )
}
