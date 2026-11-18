import { useId, useState, type ReactNode } from 'react';

interface SliderProps {
  label: ReactNode;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  /** log scale is used for quantities spanning orders of magnitude (n, α) */
  scale?: 'linear' | 'log';
  /** applied after log mapping, e.g. Math.round for integers */
  round?: (v: number) => number;
  format?: (v: number) => string;
  hint?: ReactNode;
  /** show a numeric box for exact entry */
  editable?: boolean;
  accent?: string;
  presets?: { label: string; value: number }[];
}

const LOG_STEPS = 1000;

export function Slider({ label, value, onChange, min, max, step = 0.01, scale = 'linear', round, format = (v) => String(v), hint, editable, accent = '#2563eb', presets }: SliderProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const isLog = scale === 'log';
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const toPos = (v: number) => (isLog ? (Math.log(clamp(v) / min) / Math.log(max / min)) * LOG_STEPS : clamp(v));
  const fromPos = (p: number) => {
    const v = isLog ? min * Math.pow(max / min, p / LOG_STEPS) : p;
    return clamp(round ? round(v) : v);
  };
  const pos = toPos(value);
  /** Keyboard step in value space: ~0.5% of a log range (5% with Page keys) or one step. Always moves to a new value. */
  const stepFrom = (v0: number, dir: number, big: boolean): number => {
    if (isLog) {
      const factor = Math.pow(max / min, (big ? 50 : 5) / LOG_STEPS);
      let v = v0;
      let next = v0;
      for (let k = 0; k < 500 && next === v0; k++) {
        v *= Math.pow(factor, dir);
        next = clamp(round ? round(v) : v);
        if (next === (dir > 0 ? max : min)) break;
      }
      return next;
    }
    const raw = v0 + dir * step * (big ? 10 : 1);
    return clamp(Number((round ? round(raw) : raw).toPrecision(12)));
  };
  const pct = isLog ? (pos / LOG_STEPS) * 100 : ((value - min) / (max - min)) * 100;
  const [draft, setDraft] = useState<string | null>(null);

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-slate-800">
          {label}
        </label>
        {editable ? (
          <input
            type="number"
            inputMode="decimal"
            aria-label={typeof label === 'string' ? `${label} (exact value)` : 'exact value'}
            className="w-24 rounded-md border border-slate-300 px-2 py-0.5 text-right font-mono text-sm tabular-nums focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={draft ?? String(value)}
            min={min}
            max={max}
            step={step}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => {
              const v = Number(draft);
              if (draft !== null && Number.isFinite(v)) onChange(clamp(round ? round(v) : v));
              setDraft(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
            }}
          />
        ) : (
          <output htmlFor={id} className="font-mono text-sm font-semibold tabular-nums text-slate-900">
            {format(value)}
          </output>
        )}
      </div>
      <input
        id={id}
        type="range"
        className="range w-full"
        style={{ ['--fill' as string]: `${pct}%`, ['--accent' as string]: accent }}
        min={isLog ? 0 : min}
        max={isLog ? LOG_STEPS : max}
        step={isLog ? 1 : step}
        value={pos}
        aria-valuetext={format(value)}
        aria-describedby={hint ? hintId : undefined}
        onChange={(e) => onChange(fromPos(Number(e.target.value)))}
        onKeyDown={(e) => {
          const dirs: Record<string, number> = { ArrowRight: 1, ArrowUp: 1, PageUp: 1, ArrowLeft: -1, ArrowDown: -1, PageDown: -1 };
          if (e.key === 'Home' || e.key === 'End') {
            e.preventDefault();
            onChange(e.key === 'Home' ? min : max);
            return;
          }
          const dir = dirs[e.key];
          if (!dir) return;
          e.preventDefault();
          onChange(stepFrom(value, dir, e.key.startsWith('Page')));
        }}
      />
      {presets && (
        <div className="flex flex-wrap gap-1" role="group" aria-label="Presets">
          {presets.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => onChange(p.value)}
              className={`rounded-full border px-2 py-0.5 font-mono text-xs transition-colors ${Math.abs(p.value - value) < 1e-12 ? 'border-slate-800 bg-slate-800 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-slate-500'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
      {hint && (
        <p id={hintId} className="text-xs leading-snug text-slate-500">
          {hint}
        </p>
      )}
    </div>
  );
}

interface SegmentedProps<T extends string> {
  label: ReactNode;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: ReactNode; title?: string }[];
  hint?: ReactNode;
  size?: 'sm' | 'md';
}

export function Segmented<T extends string>({ label, value, onChange, options, hint, size = 'md' }: SegmentedProps<T>) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <div id={id} className="text-sm font-medium text-slate-800">
        {label}
      </div>
      <div role="radiogroup" aria-labelledby={id} className="flex w-full rounded-lg bg-slate-100 p-0.5">
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              title={o.title}
              onClick={() => onChange(o.value)}
              onKeyDown={(e) => {
                const i = options.findIndex((x) => x.value === value);
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                  e.preventDefault();
                  onChange(options[(i + 1) % options.length].value);
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                  e.preventDefault();
                  onChange(options[(i - 1 + options.length) % options.length].value);
                }
              }}
              tabIndex={active ? 0 : -1}
              className={`flex-1 rounded-md px-2 ${size === 'sm' ? 'py-1 text-xs' : 'py-1.5 text-sm'} font-medium transition-colors ${active ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'}`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      {hint && <p className="text-xs leading-snug text-slate-500">{hint}</p>}
    </div>
  );
}

export function Toggle({ label, checked, onChange }: { label: ReactNode; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="inline-flex cursor-pointer select-none items-center gap-2 text-sm text-slate-700">
      <input type="checkbox" className="h-4 w-4 rounded border-slate-300 accent-slate-800" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export function Button({ variant = 'secondary', className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  const styles: Record<ButtonVariant, string> = {
    primary: 'bg-slate-900 text-white hover:bg-slate-700 disabled:bg-slate-300',
    secondary: 'bg-white text-slate-800 ring-1 ring-slate-300 hover:bg-slate-50 hover:ring-slate-400 disabled:text-slate-400',
    ghost: 'text-slate-700 hover:bg-slate-100',
  };
  return <button type="button" className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed ${styles[variant]} ${className}`} {...props} />;
}
