import { cn } from './cn';

interface StatusBadgeProps {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
}

export function StatusBadge({
  active,
  activeLabel = 'Ativo',
  inactiveLabel = 'Inativo',
}: StatusBadgeProps): React.JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex min-h-8 items-center rounded-full px-3 text-xs font-semibold',
        active
          ? 'bg-[rgba(35,197,94,0.12)] text-[var(--wf-success)]'
          : 'bg-[var(--wf-surface-alt)] text-[var(--wf-muted)]',
      )}
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}
