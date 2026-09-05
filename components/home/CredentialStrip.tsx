/**
 * Quiet credential row directly under the hero.
 *
 * The reference site puts a greyscale press-logo strip here. Apex has no press
 * coverage to show, so rather than fake logos this states the standards and
 * capabilities the rest of the site already claims — same role (immediate
 * reassurance at low visual weight), same muted treatment.
 */

import { Band, Container } from '@/components/marketing/ui'

const CREDENTIALS = [
  'CSA A277',
  'CSA Z240',
  'National Building Code',
  'EPC Project Delivery',
  'China → Canada Logistics',
]

export function CredentialStrip() {
  return (
    <Band size="none" className="border-b border-neutral-100 py-7">
      <Container>
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 sm:gap-x-12">
          {CREDENTIALS.map((item) => (
            <li
              key={item}
              className="text-[11px] font-semibold tracking-[0.16em] whitespace-nowrap text-neutral-400 uppercase"
            >
              {item}
            </li>
          ))}
        </ul>
      </Container>
    </Band>
  )
}
