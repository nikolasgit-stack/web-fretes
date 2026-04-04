import Link from 'next/link';
import { cn } from './cn';

interface PageHeaderProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  eyebrow?: string;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actionLabel,
  actionHref,
  eyebrow = 'Módulo operacional',
  className,
}: PageHeaderProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'flex flex-col gap-5 rounded-[32px] border border-[var(--wf-border)] bg-[linear-gradient(135deg,#ffffff_0%,#f5faf8_100%)] p-6 lg:flex-row lg:items-end lg:justify-between',
        className,
      )}
    >
      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--wf-primary)]">
          {eyebrow}
        </span>
        <div>
          <h2 className="text-3xl font-semibold tracking-[-0.05em] text-[var(--wf-ink)]">{title}</h2>
          <p className="mt-2 max-w-3xl text-sm text-[var(--wf-muted)]">{description}</p>
        </div>
      </div>

      {actionLabel && actionHref ? (
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-[var(--wf-primary)] px-4 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(19,78,74,0.18)] transition hover:bg-[var(--wf-primary-strong)]"
          href={actionHref}
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
