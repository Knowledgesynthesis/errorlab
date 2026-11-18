import { useId, useState, type ReactNode } from 'react';

export function Card({ title, eyebrow, actions, children, className = '', id }: { title?: ReactNode; eyebrow?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5 ${className}`}>
      {(title || actions || eyebrow) && (
        <header className="mb-3 flex flex-wrap items-start justify-between gap-2">
          <div>
            {eyebrow && <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{eyebrow}</div>}
            {title && <h2 className="text-lg font-semibold text-slate-900">{title}</h2>}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

type CalloutKind = 'key' | 'warn' | 'practice' | 'evidence' | 'try';

const CALLOUT: Record<CalloutKind, { label: string; cls: string }> = {
  key: { label: 'Key idea', cls: 'border-slate-800 bg-slate-50' },
  warn: { label: 'Watch out', cls: 'border-[#D55E00] bg-orange-50' },
  practice: { label: 'In practice', cls: 'border-[#009E73] bg-emerald-50' },
  evidence: { label: 'Evidence', cls: 'border-[#0072B2] bg-sky-50' },
  try: { label: 'Try it', cls: 'border-[#CC79A7] bg-pink-50' },
};

export function Callout({ kind = 'key', title, children }: { kind?: CalloutKind; title?: ReactNode; children: ReactNode }) {
  const c = CALLOUT[kind];
  return (
    <div role="note" className={`rounded-r-xl border-l-4 px-4 py-3 text-sm leading-relaxed text-slate-800 ${c.cls}`}>
      <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-600">{title ?? c.label}</div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

export function Stat({ label, value, sub, color, big }: { label: ReactNode; value: ReactNode; sub?: ReactNode; color?: string; big?: boolean }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
      <div className="text-xs font-medium text-slate-600">{label}</div>
      <div className={`font-mono font-semibold tabular-nums ${big ? 'text-2xl' : 'text-lg'}`} style={{ color }}>
        {value}
      </div>
      {sub && <div className="text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

export function Formula({ children, caption }: { children: ReactNode; caption?: ReactNode }) {
  return (
    <figure className="my-3">
      <div className="overflow-x-auto rounded-lg bg-slate-900 px-4 py-3 text-center font-mono text-[15px] text-slate-50">{children}</div>
      {caption && <figcaption className="mt-1 text-xs text-slate-500">{caption}</figcaption>}
    </figure>
  );
}

export function Tabs<T extends string>({ tabs, value, onChange, label }: { tabs: { id: T; label: ReactNode }[]; value: T; onChange: (id: T) => void; label: string }) {
  const id = useId();
  return (
    <div role="tablist" aria-label={label} className="flex gap-1 overflow-x-auto border-b border-slate-200">
      {tabs.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            id={`${id}-${t.id}`}
            role="tab"
            type="button"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(t.id)}
            onKeyDown={(e) => {
              const i = tabs.findIndex((x) => x.id === value);
              if (e.key === 'ArrowRight') onChange(tabs[(i + 1) % tabs.length].id);
              if (e.key === 'ArrowLeft') onChange(tabs[(i - 1 + tabs.length) % tabs.length].id);
            }}
            className={`-mb-px shrink-0 whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors ${active ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

export function Disclosure({ summary, children, defaultOpen = false }: { summary: ReactNode; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <details className="group rounded-xl bg-white ring-1 ring-slate-200" open={open} onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-slate-900 [&::-webkit-details-marker]:hidden">
        <span>{summary}</span>
        <span aria-hidden className="text-slate-400 transition-transform group-open:rotate-45">+</span>
      </summary>
      <div className="space-y-2 border-t border-slate-100 px-4 py-3 text-sm leading-relaxed text-slate-700">{children}</div>
    </details>
  );
}

/** Colour swatch + label for chart legends. */
export function Swatch({ color, label, line, dashed }: { color: string; label: ReactNode; line?: boolean; dashed?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-700">
      {line ? (
        <svg width="18" height="8" aria-hidden>
          <line x1="0" y1="4" x2="18" y2="4" stroke={color} strokeWidth="2.5" strokeDasharray={dashed ? '4 3' : undefined} />
        </svg>
      ) : (
        <span aria-hidden className="inline-block h-3 w-3 rounded-sm" style={{ background: color, opacity: 0.75 }} />
      )}
      {label}
    </span>
  );
}

export function LiveRegion({ children }: { children: ReactNode }) {
  return (
    <div aria-live="polite" className="sr-only">
      {children}
    </div>
  );
}
