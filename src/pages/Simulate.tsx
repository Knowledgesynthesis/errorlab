import { useSearchParams } from 'react-router';
import { Cite } from '../components/ui/Cite';
import { Card, Tabs } from '../components/ui/layout';
import { ExaggerationSim, ManyStudies, MultipleTests, OneStudy, PDance, PeekingSim } from '../components/widgets/simulations';

const TABS = [
  { id: 'one', label: 'One study', intro: 'Generate a dataset, compute the statistic and p-value, and see where it lands on the null distribution.', refs: ['asa2016'] },
  { id: 'many', label: 'Many studies', intro: 'The distribution of p-values: flat under H₀, piled near zero under H₁. The share below α is the Type I error rate or the power.', refs: ['greenland2016'] },
  { id: 'dance', label: 'Dance of p', intro: 'Twenty exact replications of one experiment. p-values vary wildly; intervals tell a steadier story.', refs: ['cumming2008'] },
  { id: 'exaggeration', label: 'Exaggeration', intro: 'Which estimates survive the significance filter? With low power, the survivors overstate the effect and sometimes get its sign wrong.', refs: ['gelman2014'] },
  { id: 'peeking', label: 'Peeking', intro: 'Test after every batch and stop at the first p ≤ α. No effect exists, yet “significant” results pile up.', refs: ['armitage1969'] },
  { id: 'multiple', label: 'Multiple tests', intro: 'Many hypotheses at once: compare no correction, Bonferroni, Holm and Benjamini–Hochberg.', refs: ['bh1995', 'holm1979'] },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function Simulate() {
  const [sp, setSp] = useSearchParams();
  const raw = sp.get('tab');
  const tab: TabId = TABS.some((t) => t.id === raw) ? (raw as TabId) : 'one';
  const meta = TABS.find((t) => t.id === tab)!;
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Simulations</h1>
      <p className="mt-1 max-w-2xl text-slate-600">
        Simulation makes long-run error rates visible <Cite k="gaise2016" />. Studies are generated exactly from their sampling distributions, so results agree with theory up to Monte Carlo noise.
      </p>
      <div className="mt-6">
        <Tabs label="Simulation" tabs={TABS.map((t) => ({ id: t.id, label: t.label }))} value={tab} onChange={(id) => setSp({ tab: id }, { replace: true })} />
      </div>
      <p className="mt-4 text-sm text-slate-700">
        {meta.intro} <Cite k={[...meta.refs]} />
      </p>
      <Card className="mt-4">
        {tab === 'one' && <OneStudy />}
        {tab === 'many' && <ManyStudies />}
        {tab === 'dance' && <PDance />}
        {tab === 'exaggeration' && <ExaggerationSim />}
        {tab === 'peeking' && <PeekingSim />}
        {tab === 'multiple' && <MultipleTests />}
      </Card>
    </div>
  );
}
