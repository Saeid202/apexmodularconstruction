interface PageHeaderProps {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: string;
  children?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-100">
      <div className="container mx-auto px-6 pt-24 pb-8 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            {eyebrow && (
              <p className="text-xs uppercase tracking-[0.3em] font-bold mb-2" style={{ color: '#D4AF37' }}>
                {eyebrow}
              </p>
            )}
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#1a1a2e] leading-tight">
              {title}
            </h1>
            {subtitle && (
              <div className="mt-3 flex items-center gap-3">
                <div className="h-0.5 w-6 shrink-0 rounded-full" style={{ background: '#D4AF37' }} />
                <p className="text-sm text-gray-500">{subtitle}</p>
              </div>
            )}
          </div>
          {children && <div className="shrink-0 w-full md:w-auto">{children}</div>}
        </div>
      </div>
    </div>
  );
}
