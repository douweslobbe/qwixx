import type { ZetEvaluatie, VariantConfig } from '../types';
import { getKleurStijl } from '../constants';

interface Props {
  aiRedeneringen: Record<string, { stap1?: ZetEvaluatie | null; stap2?: ZetEvaluatie | null }>;
  spelers: { id: string; naam: string; isAI: boolean }[];
  variant: VariantConfig;
}

export function AIReasoningPanel({ aiRedeneringen, spelers, variant }: Props) {
  const aiSpelers = spelers.filter(s => s.isAI);
  const heeftRedeneringen = aiSpelers.some(s => {
    const r = aiRedeneringen[s.id];
    return r && (r.stap1 !== undefined || r.stap2 !== undefined);
  });

  if (!heeftRedeneringen) return null;

  return (
    <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700">
      <h3 className="text-white font-bold text-sm mb-2">AI Redeneringen</h3>
      <div className="space-y-2">
        {aiSpelers.map(speler => {
          const r = aiRedeneringen[speler.id];
          if (!r) return null;
          return (
            <div key={speler.id} className="space-y-1">
              <div className="text-gray-300 text-xs font-medium">{speler.naam}</div>
              {r.stap1 !== undefined && (
                <RedeningRegel label="Stap 1" evaluatie={r.stap1} variant={variant} />
              )}
              {r.stap2 !== undefined && (
                <RedeningRegel label="Stap 2" evaluatie={r.stap2} variant={variant} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RedeningRegel({ label, evaluatie, variant }: { label: string; evaluatie: ZetEvaluatie | null | undefined; variant: VariantConfig }) {
  if (!evaluatie) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500 pl-2">
        <span className="text-gray-600">{label}:</span> Gepast
      </div>
    );
  }

  const rijConfig = variant.rijen.find(r => r.id === evaluatie.rijId);
  const kleur = rijConfig?.primairKleur ?? 'grijs';
  const stijl = getKleurStijl(kleur);

  return (
    <div className="flex items-start gap-2 text-xs pl-2">
      <span className="text-gray-600 shrink-0">{label}:</span>
      <div className={`w-3 h-3 rounded-sm ${stijl.bg} shrink-0 mt-0.5`} />
      <span className="text-gray-300">{evaluatie.reden}</span>
    </div>
  );
}
