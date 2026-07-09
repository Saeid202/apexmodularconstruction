interface SectionProps {
  children: React.ReactNode
  className?: string
  id?: string
  containerClassName?: string
  background?: 'white' | 'muted' | 'dark' | 'brand'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  ariaLabel?: string
  ariaLabelledby?: string
}

const paddingClasses = {
  none: '',
  sm: 'py-12 md:py-16',
  md: 'py-16 md:py-20',
  lg: 'py-20 md:py-28',
}

const backgroundClasses = {
  white: 'bg-background',
  muted: 'bg-muted/50',
  dark: 'bg-primary-900 text-white',
  brand: 'bg-gradient-primary text-white',
}

export function Section({
  children,
  className = '',
  id,
  containerClassName = '',
  background = 'white',
  padding = 'lg',
  ariaLabel,
  ariaLabelledby,
}: SectionProps) {
  return (
    <section
      id={id}
      className={`${backgroundClasses[background]} ${paddingClasses[padding]} ${className}`}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
    >
      <div className={`container mx-auto px-6 max-w-7xl ${containerClassName}`}>
        {children}
      </div>
    </section>
  )
}

export function SectionEyebrow({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-xs uppercase tracking-[0.25em] font-bold mb-3 text-secondary-500 ${className}`}>
      {children}
    </p>
  )
}

export function SectionHeading({ id, children, className = '' }: { id?: string; children: React.ReactNode; className?: string }) {
  return (
    <h2
      id={id}
      className={`text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-balance ${className}`}
    >
      {children}
    </h2>
  )
}

export function SectionSubheading({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed ${className}`}>
      {children}
    </p>
  )
}

export function SectionHeader({
  eyebrow,
  heading,
  subheading,
  children,
  className = '',
  headingClassName = '',
  center = false,
}: {
  eyebrow?: string
  heading: React.ReactNode
  subheading?: React.ReactNode
  children?: React.ReactNode
  className?: string
  headingClassName?: string
  center?: boolean
}) {
  return (
    <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16 ${center ? 'text-center' : ''} ${className}`}>
      <div className={center ? 'mx-auto' : ''}>
        {eyebrow && <SectionEyebrow>{eyebrow}</SectionEyebrow>}
        <SectionHeading className={headingClassName}>{heading}</SectionHeading>
        {subheading && (
          <SectionSubheading className={`mt-4 ${center ? 'mx-auto' : ''}`}>
            {subheading}
          </SectionSubheading>
        )}
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </div>
  )
}