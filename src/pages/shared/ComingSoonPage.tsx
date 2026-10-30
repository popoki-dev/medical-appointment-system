import { Construction } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/ui/card'

interface ComingSoonPageProps {
  title: string
  description?: string
}

/** Placeholder for modules whose routes exist but whose screens are not built yet. */
export function ComingSoonPage({ title, description }: ComingSoonPageProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <Card>
        <EmptyState
          icon={Construction}
          title="This module is on the way"
          description="The route, layout and navigation are wired up. The screen itself will be built in an upcoming iteration."
          className="py-16"
        />
      </Card>
    </div>
  )
}
