import { cn } from './cn';

interface SectionCardProps {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function SectionCard({
  title,
  description,
  eyebrow,
  action,
  children,
  className,
}: SectionCardProps): React.JSX.Element {
  return (
    <section className={cn('rounded-[32px] border border-[var(--wf-border)] bg-white p-6', className)}>
      <header className="mb-6 flex flex-col gap-4 border-b border-[var(--wf-border)] pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          {eyebrow ? (
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--wf-primary)]">
              {eyebrow}
            </span>
          ) : null}
          <div>
            <h3 className="text-xl font-semibold tracking-[-0.03em] text-[var(--wf-ink)]">{title}</h3>
            {description ? <p className="mt-1 max-w-3xl text-sm text-[var(--wf-muted)]">{description}</p> : null}
          </div>
        </div>
        {action ? <div className="flex flex-wrap gap-3">{action}</div> : null}
      </header>

      {children}
    </section>
  );
}
