import { Link } from 'react-router';
import { REF_BY_KEY } from '../../content/references';

/** In-text citation linking to the full reference on the Reference page. */
export function Cite({ k }: { k: string | string[] }) {
  const keys = Array.isArray(k) ? k : [k];
  return (
    <span className="text-[0.85em] text-slate-600">
      (
      {keys.map((key, i) => {
        const ref = REF_BY_KEY[key];
        if (!ref) throw new Error(`Unknown reference key: ${key}`);
        return (
          <span key={key}>
            {i > 0 && '; '}
            <Link to={`/reference#ref-${key}`} className="whitespace-nowrap underline decoration-slate-300 underline-offset-2 hover:text-slate-800 hover:decoration-slate-500" title={ref.citation}>
              {ref.short}
            </Link>
          </span>
        );
      })}
      )
    </span>
  );
}
