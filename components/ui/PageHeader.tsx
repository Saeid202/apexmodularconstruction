interface PageHeaderProps {
  eyebrow?: string
  title: React.ReactNode
  subtitle?: string
  children?: React.ReactNode
  background?: 'white' | 'muted' | 'brand'
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  children,
  background = 'white',
}: PageHeaderProps) {
  const bgClass = {
    white: 'bg-background border-b border-border',
    muted: 'bg-muted/50 border-b border-border',
    brand: 'bg-gradient-primary text-white',
  }[background]

  return (
    <div className={bgClass}>
      <div className="container mx-auto px-6 py-16 md:py-20 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            {eyebrow && (
              <p className="text-xs uppercase tracking-[0.25em] font-bold mb-3 text-secondary-500">
                {eyebrow}
              </p>
            )}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-xl leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          {children && <div className="shrink-0 w-full md:w-auto">{children}</div>}
        </div>
      </div>
    </div>
  )
}