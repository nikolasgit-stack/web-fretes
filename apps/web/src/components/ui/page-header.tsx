import Link from 'next/link';

interface PageHeaderProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function PageHeader({
  title,
  description,
  actionLabel,
  actionHref,
}: PageHeaderProps): React.JSX.Element {
  return (
    <div className="page-header">
      <div>
        <span className="section-kicker">Operacao</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      {actionLabel && actionHref ? (
        <Link className="primary-button" href={actionHref}>
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
