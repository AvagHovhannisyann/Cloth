export function EmptyState({
  title,
  detail,
  action,
}: {
  title: string;
  detail?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-line-strong px-8 py-12 text-center">
      <p className="text-[0.9375rem] font-medium text-ink">{title}</p>
      {detail ? (
        <p className="max-w-xs text-sm leading-relaxed text-ink-secondary">{detail}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
