interface Props {
  metrics: Record<string, number | string | null | undefined>;
  loading?: boolean;
}

export function KpiCards({ metrics, loading = false }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="terminal-border p-4 bg-[var(--bg)]">
            <span className="text-[10px] text-[var(--dim)]">LOADING...</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-px">
      {Object.entries(metrics).map(([key, value]) => {
        const label = key
          .replace(/_/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase());

        let displayValue = '—';
        if (value === null || value === undefined) {
          displayValue = '—';
        } else if (typeof value === 'number') {
          displayValue = value.toLocaleString();
        } else {
          displayValue = String(value);
        }

        return (
          <div key={key} className="terminal-border p-4 bg-[var(--bg)]">
            <div className="text-[10px] text-[var(--dim)] uppercase tracking-wider mb-1">
              {label}
            </div>
            <div className="text-[18px] font-bold">
              {displayValue}
            </div>
          </div>
        );
      })}
    </div>
  );
}
