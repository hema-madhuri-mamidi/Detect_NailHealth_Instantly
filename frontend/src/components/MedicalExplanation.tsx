type Props = {
  reason?: string;
  deficiency?: string;
  diet?: string;
  className?: string;
};

export function MedicalExplanation({ reason, deficiency, diet, className = "" }: Props) {
  const r = reason?.trim();
  const d = deficiency?.trim();
  const di = diet?.trim();
  if (!r && !d && !di) return null;

  return (
    <div className={`space-y-4 text-sm text-secondary-foreground ${className}`}>
      {r ? (
        <section>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Clinical summary
          </p>
          <p>{r}</p>
        </section>
      ) : null}
      {d ? (
        <section>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Deficiency / associations
          </p>
          <p>{d}</p>
        </section>
      ) : null}
      {di ? (
        <section>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Diet & lifestyle
          </p>
          <p>{di}</p>
        </section>
      ) : null}
    </div>
  );
}
