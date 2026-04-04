import { cn } from './cn';

interface MetricCardProps {
  label: string;
  value: string | number;
  helper?: string;
  tone?: 'default' | 'highlight';
}

export function MetricCard({
  label,
  value,
  helper,
  tone = 'default',
}: MetricCardProps): React.JSX.Element {
  return (
    <article
      className={cn(
        'rounded-[28px] border p-5',
        tone === 'highlight'
          ? 'border-[var(--wf-primary)] bg-[linear-gradient(135deg,#eefaf5_0%,#ffffff_100%)]'
          : 'border-[var(--wf-border)] bg-white',
      )}
    >
      <p className="text-sm font-medium text-[var(--wf-muted)]">{label}</p>
      <strong className="mt-3 block text-3xl font-semibold tracking-[-0.04em] text-[var(--wf-ink)]">
        {value}
      </strong>
      {helper ? <p className="mt-2 text-sm text-[var(--wf-muted)]">{helper}</p> : null}
    </article>
  );
}
