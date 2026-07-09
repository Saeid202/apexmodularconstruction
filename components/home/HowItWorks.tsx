import { ClipboardList, Cog, Factory, Truck, HardHat, ShieldCheck } from 'lucide-react'
import { Section, SectionHeader } from '@/components/ui/Section'

const steps = [
  {
    icon: ClipboardList,
    title: 'Consultation & Design',
    description: 'Share your project requirements. Our engineers assess feasibility, budget, and timelines.',
  },
  {
    icon: Factory,
    title: 'Sourcing & Manufacturing',
    description: 'We manufacture your structure at vetted Chinese factories with strict QC at every stage.',
  },
  {
    icon: ShieldCheck,
    title: 'CSA Compliance',
    description: 'Every component is certified to meet Canadian building codes and provincial standards.',
  },
  {
    icon: Truck,
    title: 'Shipping & Delivery',
    description: 'We handle ocean freight, customs clearance, and last-mile delivery to your site.',
  },
  {
    icon: HardHat,
    title: 'Installation Support',
    description: 'Our team assists with on-site assembly, inspection, and project closeout.',
  },
]

export function HowItWorks() {
  return (
    <Section background="white" padding="lg">
      <SectionHeader
        center
        eyebrow="Process"
        heading="How It Works"
        subheading="From your initial consultation to final delivery — a seamless end-to-end process."
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {steps.map((step, i) => {
          const Icon = step.icon
          return (
            <div
              key={step.title}
              className="relative flex flex-col items-center text-center p-6 rounded-xl bg-muted/50 border border-border"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white text-sm font-bold mb-4">
                {i + 1}
              </span>
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="text-sm font-bold text-foreground mb-2">{step.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          )
        })}
      </div>
    </Section>
  )
}