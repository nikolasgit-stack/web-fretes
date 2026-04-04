import Link from 'next/link';
import { cn } from './cn';

const buttonVariants = {
  primary:
    'bg-[var(--wf-primary)] text-white shadow-[0_12px_30px_rgba(19,78,74,0.18)] hover:bg-[var(--wf-primary-strong)]',
  secondary:
    'border border-[var(--wf-border)] bg-white text-[var(--wf-ink)] hover:border-[var(--wf-primary)] hover:text-[var(--wf-primary)]',
  subtle:
    'bg-[var(--wf-surface-alt)] text-[var(--wf-muted)] hover:bg-[var(--wf-surface-strong)] hover:text-[var(--wf-ink)]',
  danger:
    'bg-[#fff1f0] text-[#b42318] hover:bg-[#ffe2df]',
} as const;

interface ActionButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: keyof typeof buttonVariants;
  className?: string;
  disabled?: boolean;
}

const baseClassName =
  'inline-flex min-h-11 items-center justify-center rounded-2xl px-4 text-sm font-semibold transition duration-200';

export function ActionButton({
  children,
  href,
  onClick,
  type = 'button',
  variant = 'secondary',
  className,
  disabled,
}: ActionButtonProps): React.JSX.Element {
  const classes = cn(baseClassName, buttonVariants[variant], disabled && 'opacity-60', className);

  if (href) {
    return (
      <Link className={classes} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={disabled} onClick={onClick} type={type}>
      {children}
    </button>
  );
}
