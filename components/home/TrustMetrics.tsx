import { Building, ShieldCheck, Clock, Award, Users, Globe } from 'lucide-react'
import { Section, SectionHeader } from '@/components/ui/Section'

const metrics = [
  {
    icon: Building,
    value: '50+',
    label: 'Projects Delivered',
    description: 'Across North America, from residential homes to commercial complexes.',
    color: 'bg-blue-600',
  },
  {
    icon: ShieldCheck,
    value: '100%',
    label: 'CSA Certified',
    description: 'Every structure meets Canadian standards for safety and quality.',
    color: 'bg-emerald-600',
  },
  {
    icon: Clock,
    value: '8 Weeks',
    label: 'Avg. Delivery Time',
    description: 'From order to site — faster than traditional construction.',
    color: 'bg-amber-600',
  },
  {
    icon: Award,
    value: '15+ Years',
    label: 'Industry Experience',
    description: 'Deep expertise in modular construction and cross-border logistics.',
    color: 'bg-violet-600',
  },
  {
    icon: Users,
    value: '200+',
    label: 'SKUs Available',
    description: 'Extensive catalog of prefab homes, panels, and steel structures.',
    color: 'bg-rose-600',
  },
  {
    icon: Globe,
    value: 'China–Canada',
    label: 'Direct Sourcing',
    description: 'Factory-direct pricing with full logistics and customs support.',
    color: 'bg-cyan-600',
  },
]

export function TrustMetrics() {
  return (
    <Section background="muted" padding="lg">
      <SectionHeader
        center
        eyebrow="Why Choose Apex"
        heading="Built on Trust & Transparency"
        subheading="Every number represents a promise kept to our clients across Canada."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((m) => {
          const Icon = m.icon
          return (
            <div
              key={m.label}
              className="flex items-start gap-4 rounded-xl border border-border bg-background p-5 shadow-sm"
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white ${m.color}`}>
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xl font-bold tracking-tight text-foreground">{m.value}</p>
                <p className="text-sm font-semibold text-foreground">{m.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </Section>
  )
}