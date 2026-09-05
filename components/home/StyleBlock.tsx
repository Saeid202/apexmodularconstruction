/**
 * "Your Building, Your Spec" — the reference site's "Your Home Your Style" slot.
 *
 * A quiet finish-and-option showcase: one heading, then a row of image tiles with
 * short captions. Kept low on the page and low in weight, as the reference does,
 * because by this point the visitor has already seen the models and the CTAs.
 */

import { Band, Container, Display, EyebrowPill, Lede } from '@/components/marketing/ui'

const OPTIONS = [
  {
    label: 'Exterior cladding',
    body: 'Steel, composite panel and timber-look finishes.',
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=1000&fit=crop&q=80',
  },
  {
    label: 'Interior finishes',
    body: 'Flooring, cabinetry and countertop packages.',
    image:
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=1000&fit=crop&q=80',
  },
  {
    label: 'Layout',
    body: 'Studio through multi-bedroom configurations.',
    image:
      'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800&h=1000&fit=crop&q=80',
  },
  {
    label: 'Systems',
    body: 'HVAC, electrical and plumbing pre-installed.',
    image:
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&h=1000&fit=crop&q=80',
  },
]

export function StyleBlock() {
  return (
    <Band labelledBy="style-heading">
      <Container>
        <div className="max-w-2xl">
          <EyebrowPill>Specification</EyebrowPill>
          <Display id="style-heading" className="mt-6">
            Your building, your spec.
          </Display>
          <Lede className="mt-4">
            Every model is a starting point. Choose the cladding, finishes, layout and
            systems package, and the approved specification is what goes to the factory.
          </Lede>
        </div>

        <ul className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {OPTIONS.map((option) => (
            <li key={option.label}>
              <div className="overflow-hidden rounded-2xl bg-neutral-100">
                {/* eslint-disable-next-line @next/next/no-img-element -- remote host
                    is not guaranteed to match next.config images.remotePatterns. */}
                <img
                  src={option.image}
                  alt={option.label}
                  loading="lazy"
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>
              <p className="mt-3.5 text-[14px] font-medium text-neutral-900">{option.label}</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-neutral-500">
                {option.body}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </Band>
  )
}
