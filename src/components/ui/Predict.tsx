import { useState, type ReactNode } from 'react';
import { Button } from './controls';

interface ChoicePredict {
  kind: 'choice';
  options: string[];
  /** index of the correct option */
  answer: number;
}

interface EstimatePredict {
  kind: 'estimate';
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  actual: number;
  /** how close counts as "well calibrated" */
  closeEnough: number;
}

type Props = (ChoicePredict | EstimatePredict) & {
  prompt: ReactNode;
  /** shown after the prediction is committed */
  reveal: ReactNode;
};

/**
 * Commit to a prediction before seeing the answer. Predicting first
 * measurably improves learning from demonstrations (Crouch et al. 2004).
 */
export function Predict(props: Props) {
  const [choice, setChoice] = useState<number | null>(null);
  const [guess, setGuess] = useState(props.kind === 'estimate' ? (props.min + props.max) / 2 : 0);
  const [revealed, setRevealed] = useState(false);

  let verdict: ReactNode = null;
  if (revealed) {
    if (props.kind === 'choice') {
      verdict = choice === props.answer ? <span className="font-semibold text-emerald-800">Your prediction was right.</span> : <span className="font-semibold text-orange-800">Your prediction was off — that gap is exactly what to learn from.</span>;
    } else {
      const diff = guess - props.actual;
      verdict =
        Math.abs(diff) <= props.closeEnough ? (
          <span className="font-semibold text-emerald-800">
            You guessed {props.format(guess)}; actual {props.format(props.actual)}. Well calibrated.
          </span>
        ) : (
          <span className="font-semibold text-orange-800">
            You guessed {props.format(guess)}; actual {props.format(props.actual)} — you {diff > 0 ? 'over' : 'under'}estimated.
          </span>
        );
    }
  }

  return (
    <div className="rounded-xl border-2 border-dashed border-[#CC79A7] bg-pink-50/40 p-4">
      <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#9E3F78]">Predict, then reveal</div>
      <div className="mb-3 font-medium text-slate-900">{props.prompt}</div>
      {props.kind === 'choice' ? (
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Your prediction">
          {props.options.map((o, i) => (
            <button
              key={o}
              type="button"
              role="radio"
              aria-checked={choice === i}
              disabled={revealed}
              onClick={() => setChoice(i)}
              className={`rounded-lg px-3 py-1.5 text-sm ring-1 transition ${choice === i ? 'bg-slate-900 text-white ring-slate-900' : 'bg-white text-slate-800 ring-slate-300 hover:ring-slate-500'} ${revealed && i === props.answer ? 'outline-2 outline-offset-2 outline-emerald-600' : ''}`}
            >
              {o}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <input type="range" className="range flex-1" style={{ ['--fill' as string]: `${((guess - props.min) / (props.max - props.min)) * 100}%`, ['--accent' as string]: '#9E3F78' }} min={props.min} max={props.max} step={props.step} value={guess} disabled={revealed} onChange={(e) => setGuess(Number(e.target.value))} aria-label="Your estimate" aria-valuetext={props.format(guess)} />
          <output className="w-16 text-right font-mono text-sm font-semibold">{props.format(guess)}</output>
        </div>
      )}
      <div className="mt-3 flex items-center gap-2">
        {!revealed ? (
          <Button variant="primary" disabled={props.kind === 'choice' && choice === null} onClick={() => setRevealed(true)}>
            Reveal
          </Button>
        ) : (
          <Button variant="ghost" onClick={() => { setRevealed(false); setChoice(null); }}>
            Predict again
          </Button>
        )}
      </div>
      {revealed && (
        <div className="mt-3 space-y-2 text-sm leading-relaxed text-slate-800" role="status">
          <p>{verdict}</p>
          <div>{props.reveal}</div>
        </div>
      )}
    </div>
  );
}
