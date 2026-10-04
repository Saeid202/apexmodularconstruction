'use client'

import { useRef, useState, type KeyboardEvent } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const TABS = [
  {
    id: 'customers',
    label: 'Customers',
    title: 'A clear starting point for your project.',
    description:
      'Share your site, intended use, timing and budget. Compare building approaches and understand feasibility before choosing a model.',
    details: ['Project goals', 'Site requirements', 'Budget and timing'],
  },
  {
    id: 'architects-designers',
    label: 'Architects & Designers',
    title: 'Design specifications that translate to the factory.',
    description:
      'Develop building concepts, configure layouts and finishes, and publish designs that customers can explore.',
    details: ['Concept and plans', 'Materials and finishes', 'Manufacturing specifications'],
  },
  {
    id: 'builders-installers',
    label: 'Builders & Installers',
    title: 'Bring the design from delivery to installation.',
    description:
      'Coordinate site preparation, foundations, utility hookups and final installation with local trades.',
    details: ['Site preparation', 'Foundation and utilities', 'On-site assembly'],
  },
]

const CUSTOMER_STEPS = [
  {
    id: 'choose-customize',
    label: '01 — Choose & Customize',
    title: 'Start with a ready-to-buy building',
    description:
      "Choose from Apex's catalogue of modular buildings and customize the details that matter to you, including finishes, colours, kitchens, bathrooms, layouts, and other available options.",
    action: 'Explore Buildings',
    href: '/products',
  },
  {
    id: 'bring-project',
    label: '02 — Bring Your Project',
    title: 'Have your own design or land?',
    description:
      'Send us your drawings, floor plans, land dimensions, project requirements, or even just your idea. Our team will review the project and work with our manufacturing and construction partners to develop a suitable solution and provide you with a project offer.',
    action: 'Submit Your Project',
    href: 'mailto:hello@apexmodularconstruction.com?subject=Project%20Submission',
  },
  {
    id: 'develop-with-apex',
    label: '03 — Develop with Apex',
    title: 'For commercial and larger-scale projects',
    description: '',
    action: 'Talk to Our Project Team',
    href: '/contact',
  },
]

const STEP_ACTION_CLASS =
  'mt-3 inline-flex min-h-10 items-center gap-2 rounded-md bg-[#EA580C] px-3.5 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-[#C2410C] focus-visible:ring-2 focus-visible:ring-[#F59E0B] focus-visible:ring-offset-2 focus-visible:outline-none'

function CustomerStepAction({ step }: { step: (typeof CUSTOMER_STEPS)[number] }) {
  const content = (
    <>
      {step.action}
      <ArrowRight aria-hidden className="h-3.5 w-3.5" />
    </>
  )

  if (step.id === 'bring-project') {
    return (
      <a href={step.href} className={STEP_ACTION_CLASS}>
        {content}
      </a>
    )
  }

  return (
    <Link href={step.href} className={STEP_ACTION_CLASS}>
      {content}
    </Link>
  )
}

function CustomerJourney() {
  return (
    <>
      <p className="text-[15px] leading-relaxed font-semibold text-neutral-900 sm:text-base">
        Whatever you&apos;re building, Apex can meet you where you are.
      </p>
      <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-neutral-600">
        You don&apos;t need to know exactly which product you need. Start with your idea,
        and we&apos;ll help shape the next steps.
      </p>

      <ol className="mt-5 divide-y divide-neutral-200 border-t border-neutral-200">
        {CUSTOMER_STEPS.map((step) => (
          <li
            key={step.id}
            className="py-5"
          >
            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-[0.12em] text-[#1F2937] uppercase">
                {step.label}
              </p>
              <h3 className="mt-1 text-[15px] leading-snug font-semibold text-neutral-900">
                {step.title}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-neutral-600">
                {step.id === 'develop-with-apex' ? (
                  <>
                    Developing a plaza, industrial facility, commercial building,
                    multi-unit project, or other large-scale development?
                    <br />
                    <span className="mt-2 block">
                      Apex can coordinate{' '}
                      <strong className="font-semibold text-neutral-800">
                        EPC delivery, modular construction, manufacturing, and project financing options.
                      </strong>{' '}
                      Where applicable, we can also help connect qualified projects with financing
                      opportunities, subject to project and financing requirements.
                    </span>
                  </>
                ) : (
                  step.description
                )}
              </p>
              <CustomerStepAction step={step} />
            </div>
          </li>
        ))}
      </ol>
    </>
  )
}

function ContactAction() {
  return (
    <Link href="/contact" className={STEP_ACTION_CLASS}>
      Contact us
      <ArrowRight aria-hidden className="h-3.5 w-3.5" />
    </Link>
  )
}

function ArchitectsJourney() {
  return (
    <>
      <p className="text-[15px] leading-relaxed font-semibold text-neutral-900 sm:text-base">
        You bring the design. Apex brings the manufacturing and market.
      </p>
      <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-neutral-600">
        Turn your architectural concepts into scalable modular products through Apex&apos;s
        manufacturing and distribution network.
      </p>

      <ol className="mt-5 divide-y divide-neutral-200 border-t border-neutral-200">
        <li className="py-5">
          <p className="text-[10px] font-semibold tracking-[0.12em] text-[#1F2937] uppercase">
            01 — Manufacture Your Designs
          </p>
          <h3 className="mt-1 text-[15px] leading-snug font-semibold text-neutral-900">
            Turn your designs into real buildings.
          </h3>
          <p className="mt-2 text-[13px] leading-relaxed text-neutral-600">
            Bring us your drawings, specifications, or existing designs. Apex can connect
            your project with suitable manufacturing partners and coordinate production
            from design review through manufacturing and delivery.
          </p>
          <p className="mt-4 text-[11px] font-semibold text-neutral-900">Apex can help with:</p>
          <ul className="mt-2 grid gap-x-5 gap-y-2 text-[12px] text-neutral-600 sm:grid-cols-2">
            {[
              'Manufacturing partner selection',
              'Production coordination',
              'Technical documentation',
              'Quality coordination',
              'Logistics and delivery',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#D4AF37]" />
                {item}
              </li>
            ))}
          </ul>
          <ContactAction />
        </li>

        <li className="py-5 last:pb-0">
          <p className="text-[10px] font-semibold tracking-[0.12em] text-[#1F2937] uppercase">
            02 — Wholesale &amp; Private Label
          </p>
          <h3 className="mt-1 text-[15px] leading-snug font-semibold text-neutral-900">
            Build your own modular product business.
          </h3>
          <p className="mt-2 text-[13px] leading-relaxed text-neutral-600">
            Partner with Apex to source your designs or selected modular buildings at
            wholesale pricing for your own projects, clients, developments, or resale.
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-neutral-600">
            You can also offer the buildings{' '}
            <strong className="font-semibold text-neutral-800">under your own brand</strong>.
            Depending on the project and manufacturing arrangement, we can coordinate the
            incorporation of your{' '}
            <strong className="font-semibold text-neutral-800">
              logo, branding, finishes, signage, packaging, and project documentation.
            </strong>
          </p>
          <p className="mt-4 text-[13px] font-semibold text-neutral-900">
            Your design. Your brand. Apex manufacturing.
          </p>
          <ContactAction />
        </li>
      </ol>
    </>
  )
}

function BuilderJourney() {
  const capabilities = [
    {
      title: 'Receive opportunities for:',
      items: [
        'Site preparation',
        'Foundations',
        'Assembly and installation',
        'Utility connections',
        'Finishing and local construction',
      ],
    },
    {
      title: 'We can help you:',
      items: [
        'Source modular buildings and building components',
        'Source materials directly from manufacturers',
        'Coordinate production',
        'Conduct factory inspections',
        'Coordinate quality control',
        'Arrange logistics and delivery',
      ],
    },
  ]

  return (
    <>
      <p className="text-[15px] leading-relaxed font-semibold text-neutral-900 sm:text-base">
        Bring your local expertise. Let Apex bring the opportunities and supply network.
      </p>
      <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-neutral-600">
        Join the Apex ecosystem to connect with customers, access modular building supply,
        and participate in projects in your market.
      </p>

      <ol className="mt-5 divide-y divide-neutral-200 border-t border-neutral-200">
        <li className="py-5">
          <p className="text-[10px] font-semibold tracking-[0.12em] text-[#1F2937] uppercase">
            01 — Get Found by Customers
          </p>
          <h3 className="mt-1 text-[15px] leading-snug font-semibold text-neutral-900">
            Put your business in front of customers looking to build.
          </h3>
          <p className="mt-2 text-[13px] leading-relaxed text-neutral-600">
            Join the Apex marketplace and create your professional profile so customers can
            discover qualified builders and installers in their city or province.
          </p>
          <CapabilityList group={capabilities[0]} />
          <ContactAction />
        </li>

        <li className="py-5">
          <p className="text-[10px] font-semibold tracking-[0.12em] text-[#1F2937] uppercase">
            02 — Build with Apex
          </p>
          <h3 className="mt-1 text-[15px] leading-snug font-semibold text-neutral-900">
            Your project. Our manufacturing and sourcing network.
          </h3>
          <p className="mt-2 text-[13px] leading-relaxed text-neutral-600">
            If you are developing a multi-unit project or larger development, Apex can become
            your production and sourcing partner.
          </p>
          <CapabilityList group={capabilities[1]} />
          <ContactAction />
        </li>

        <li className="py-5 last:pb-0">
          <p className="text-[10px] font-semibold tracking-[0.12em] text-[#1F2937] uppercase">
            03 — Deliver More Projects
          </p>
          <h3 className="mt-1 text-[15px] leading-snug font-semibold text-neutral-900">
            Expand what your team can offer.
          </h3>
          <p className="mt-2 text-[13px] leading-relaxed text-neutral-600">
            Work with Apex to combine your local construction capabilities with our modular
            manufacturing network. Instead of building every component locally, you can
            access manufactured solutions and focus your team on site work, assembly,
            finishing, and project delivery.
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-neutral-600">
            For suitable projects, Apex can help coordinate the connection between{' '}
            <strong className="font-semibold text-neutral-800">
              design, manufacturing, logistics, and local installation.
            </strong>
          </p>
          <ContactAction />
        </li>
      </ol>

      <div className="mt-5 rounded-md border border-neutral-200 border-l-4 border-l-[#D4AF37] bg-white px-4 py-4">
        <p className="text-[14px] font-semibold text-neutral-900">Local expertise. Global supply.</p>
        <p className="mt-1 text-[12px] leading-relaxed text-neutral-600">
          Apex connects local builders and installers with a global modular construction network.
        </p>
      </div>
    </>
  )
}

function CapabilityList({ group }: { group: { title: string; items: string[] } }) {
  return (
    <div className="mt-4">
      <p className="text-[11px] font-semibold text-neutral-900">{group.title}</p>
      <ul className="mt-2 grid gap-x-5 gap-y-2 text-[12px] text-neutral-600 sm:grid-cols-2">
        {group.items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#D4AF37]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function PartnerTabs() {
  const [activeIndex, setActiveIndex] = useState(0)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex = index

    if (event.key === 'ArrowRight') nextIndex = (index + 1) % TABS.length
    else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + TABS.length) % TABS.length
    else if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = TABS.length - 1
    else return

    event.preventDefault()
    setActiveIndex(nextIndex)
    tabRefs.current[nextIndex]?.focus()
  }

  return (
    <div className="mt-8">
      <div
        aria-label="Choose your role in the building process"
        className="grid gap-2 sm:grid-cols-3"
        role="tablist"
      >
        {TABS.map((tab, index) => {
          const isActive = index === activeIndex

          return (
            <button
              key={tab.id}
              ref={(element) => {
                tabRefs.current[index] = element
              }}
              id={`partner-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`partner-panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveIndex(index)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
              className={`flex min-h-16 items-center rounded-lg border px-3 py-3 text-left text-[13px] leading-snug font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-[#F59E0B] focus-visible:ring-offset-2 focus-visible:outline-none ${
                isActive
                  ? 'border-[#EA580C] bg-[#EA580C] text-white'
                  : 'border-neutral-300 bg-white text-neutral-700 hover:border-neutral-500 hover:bg-neutral-50'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {TABS.map((tab, index) => (
        <div
          key={tab.id}
          id={`partner-panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`partner-tab-${tab.id}`}
          tabIndex={0}
          hidden={index !== activeIndex}
          className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-5 focus-visible:ring-2 focus-visible:ring-[#F59E0B] focus-visible:outline-none sm:p-6"
        >
          {tab.id === 'customers' ? (
            <CustomerJourney />
          ) : tab.id === 'architects-designers' ? (
            <ArchitectsJourney />
          ) : tab.id === 'builders-installers' ? (
            <BuilderJourney />
          ) : (
            <>
              <h3 className="text-[16px] leading-snug font-semibold text-neutral-900">
                {tab.title}
              </h3>
              <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-neutral-600">
                {tab.description}
              </p>
              <ul className="mt-5 grid gap-2 border-t border-neutral-200 pt-4 text-[11px] font-semibold text-neutral-600 sm:grid-cols-3">
                {tab.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      ))}
    </div>
  )
}