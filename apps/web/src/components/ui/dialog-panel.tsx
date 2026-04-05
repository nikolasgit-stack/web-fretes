import { ActionButton } from './action-button';

interface DialogPanelProps {
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function DialogPanel({
  title,
  description,
  onClose,
  children,
}: DialogPanelProps): React.JSX.Element {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.45)] p-4">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[32px] border border-[var(--wf-border)] bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.24)]">
        <div className="mb-6 flex flex-col gap-4 border-b border-[var(--wf-border)] pb-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="text-2xl font-semibold tracking-[-0.04em] text-[var(--wf-ink)]">
              {title}
            </h3>
            {description ? (
              <p className="mt-2 text-sm text-[var(--wf-muted)]">{description}</p>
            ) : null}
          </div>

          <ActionButton onClick={onClose} variant="secondary">
            Fechar
          </ActionButton>
        </div>

        {children}
      </div>
    </div>
  );
}
