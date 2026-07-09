import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Section } from '@/components/ui/Section'

export function HomeCTA() {
  return (
    <Section background="dark" padding="lg">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl">
          Ready to Build Smarter?
        </h2>
        <p className="mt-3 text-base text-primary-foreground/80">
          Tell us about your project and get a free feasibility assessment, budget estimate, and timeline — typically within 48 hours.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-lg bg-background px-6 py-3 text-sm font-semibold text-foreground shadow-sm hover:bg-accent transition-colors"
          >
            Get a Free Quote
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-lg border border-primary-foreground/30 px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
          >
            Browse Catalog
          </Link>
        </div>
      </div>
    </Section>
  )
}