import { MetricCard } from './metric-card';
import { SectionCard } from './section-card';

interface FormShellProps {
  title: string;
  description: string;
  metrics: Array<{
    label: string;
    value: string | number;
    helper?: string;
    tone?: 'default' | 'highlight';
  }>;
  children: React.ReactNode;
}

export function FormShell({
  title,
  description,
  metrics,
  children,
}: FormShellProps): React.JSX.Element {
  return (
    <SectionCard
      description={description}
      eyebrow="Cadastro"
      title={title}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.label}
            helper={metric.helper}
            label={metric.label}
            tone={metric.tone}
            value={metric.value}
          />
        ))}
      </div>

      <div className="mt-6">{children}</div>
    </SectionCard>
  );
}
