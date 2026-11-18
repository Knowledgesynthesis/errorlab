import { cohensD, type Alternative, type Design, type DesignKind, type TestKind } from '../../stats/design';
import { fmt, fmtSig } from '../../lib/format';
import { ALPHA_PRESETS } from '../../lib/presets';
import { Segmented, Slider } from '../ui/controls';

export type ControlKey = 'design' | 'test' | 'alternative' | 'alpha' | 'n' | 'delta' | 'sigma';

interface Props {
  value: Design;
  onChange: (d: Design) => void;
  show?: ControlKey[];
  /** outcome units, e.g. "mmHg" */
  units?: string;
  /** typical magnitude of the outcome; sets slider ranges for δ and σ */
  scale?: number;
  nMax?: number;
}

const ALL: ControlKey[] = ['design', 'test', 'alternative', 'alpha', 'n', 'delta', 'sigma'];

export function DesignControls({ value: d, onChange, show = ALL, units = '', scale = 1, nMax = 2000 }: Props) {
  const set = (patch: Partial<Design>) => onChange({ ...d, ...patch });
  const has = (k: ControlKey) => show.includes(k);
  const u = units ? ` ${units}` : '';
  const deltaStep = Number((scale / 100).toPrecision(1));
  const roundDelta = (v: number) => Math.round(v / deltaStep) * deltaStep;
  return (
    <div className="space-y-4">
      {has('design') && (
        <Segmented<DesignKind>
          label="Design"
          value={d.design}
          onChange={(design) => set({ design })}
          options={[
            { value: 'two-sample', label: 'Two groups' },
            { value: 'one-sample', label: 'One group / paired' },
          ]}
          hint={d.design === 'two-sample' ? 'Treatment vs control, n per group. SE = σ·√(2/n).' : 'One mean vs a reference value, or paired differences (σ = SD of the differences). SE = σ/√n.'}
        />
      )}
      {has('test') && (
        <Segmented<TestKind>
          label="Test"
          value={d.test}
          onChange={(test) => set({ test })}
          options={[
            { value: 't', label: 't test (σ estimated)' },
            { value: 'z', label: 'z test (σ known)' },
          ]}
        />
      )}
      {has('alternative') && (
        <Segmented<Alternative>
          label="Alternative hypothesis"
          value={d.alternative}
          onChange={(alternative) => set({ alternative })}
          options={[
            { value: 'two-sided', label: 'δ ≠ 0' },
            { value: 'greater', label: 'δ > 0' },
            { value: 'less', label: 'δ < 0' },
          ]}
          hint={d.alternative === 'two-sided' ? 'Two-sided: detects effects in either direction.' : 'One-sided: all of α in one tail; blind to effects in the other direction.'}
        />
      )}
      {has('alpha') && <Slider label="Significance level α" value={d.alpha} min={0.0005} max={0.2} scale="log" round={(v) => Number(v.toPrecision(2))} onChange={(alpha) => set({ alpha })} format={(v) => fmtSig(v, 2)} accent="#D55E00" presets={ALPHA_PRESETS} />}
      {has('n') && <Slider label={d.design === 'two-sample' ? 'Sample size n (per group)' : 'Sample size n'} value={d.n} min={2} max={nMax} scale="log" round={Math.round} onChange={(n) => set({ n })} format={(v) => v.toLocaleString('en-US')} accent="#0072B2" editable />}
      {has('delta') && (
        <Slider
          label="True effect δ"
          value={d.delta}
          min={-1.5 * scale}
          max={1.5 * scale}
          step={deltaStep}
          round={roundDelta}
          onChange={(delta) => set({ delta: roundDelta(delta) })}
          format={(v) => `${fmt(v, deltaStep < 0.01 ? 3 : 2)}${u}`}
          accent="#B45309"
          hint={
            <>
              Cohen’s d = δ/σ = <strong>{fmt(cohensD(d))}</strong>. δ = 0 means H₀ is true.
            </>
          }
        />
      )}
      {has('sigma') && <Slider label="Noise σ (SD of observations)" value={d.sigma} min={0.2 * scale} max={3 * scale} step={deltaStep} onChange={(sigma) => set({ sigma: Math.max(deltaStep, Math.round(sigma / deltaStep) * deltaStep) })} format={(v) => `${fmt(v, deltaStep < 0.01 ? 3 : 2)}${u}`} accent="#475569" />}
    </div>
  );
}
