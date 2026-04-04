import { cn } from './cn';

interface DataTableColumn<T> {
  key: string;
  header: string;
  className?: string;
  render: (record: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  emptyTitle: string;
  emptyDescription: string;
  loading?: boolean;
  loadingLabel?: string;
}

export function DataTable<T>({
  columns,
  data,
  emptyTitle,
  emptyDescription,
  loading,
  loadingLabel = 'Carregando dados...',
}: DataTableProps<T>): React.JSX.Element {
  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-[28px] border border-dashed border-[var(--wf-border)] bg-[var(--wf-surface-alt)] px-6 text-center">
        <strong className="text-lg font-semibold text-[var(--wf-ink)]">{loadingLabel}</strong>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-[28px] border border-dashed border-[var(--wf-border)] bg-[var(--wf-surface-alt)] px-6 text-center">
        <strong className="text-lg font-semibold text-[var(--wf-ink)]">{emptyTitle}</strong>
        <p className="mt-2 max-w-lg text-sm text-[var(--wf-muted)]">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-[var(--wf-border)]">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-[var(--wf-surface-alt)]">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-[var(--wf-muted)]',
                    column.className,
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((record, index) => (
              <tr
                key={index}
                className="border-t border-[var(--wf-border)] bg-white transition hover:bg-[rgba(238,250,245,0.55)]"
              >
                {columns.map((column) => (
                  <td key={column.key} className={cn('px-5 py-4 align-middle text-sm text-[var(--wf-ink)]', column.className)}>
                    {column.render(record)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
