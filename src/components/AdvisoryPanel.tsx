import type { ZetEvaluatie, VariantConfig } from '../types';
import type { AdviesOverzicht, AdviesItem } from '../hooks/useAdvisory';
import { getKleurStijl } from '../constants';

interface Props {
  adviezen: AdviesOverzicht;
  variant: VariantConfig;
  onKies: (zet: ZetEvaluatie) => void;
  onPas: () => void;
}

function sterren(score: number): string {
  if (score >= 80) return '★★★★★';
  if (score >= 60) return '★★★★☆';
  if (score >= 45) return '★★★☆☆';
  if (score >= 30) return '★★☆☆☆';
  return '★☆☆☆☆';
}

export function AdvisoryPanel({ adviezen, variant, onKies, onPas }: Props) {
  const { items, pasAdvies } = adviezen;

  // Voeg de Pas-optie in op de juiste positie op basis van score
  type ListItem = { type: 'zet'; item: AdviesItem } | { type: 'pas' };
  const lijst: ListItem[] = [];
  let pasIngevoegd = false;

  for (const item of items) {
    if (!pasIngevoegd && pasAdvies.score >= item.score) {
      lijst.push({ type: 'pas' });
      pasIngevoegd = true;
    }
    lijst.push({ type: 'zet', item });
  }
  if (!pasIngevoegd) {
    lijst.push({ type: 'pas' });
  }

  return (
    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
      <h3 className="text-white font-bold mb-3">Advies</h3>

      {items.length === 0 && pasAdvies.score < 50 && (
        <p className="text-gray-500 text-sm mb-2">Geen legale zetten beschikbaar.</p>
      )}

      <div className="space-y-1.5">
        {lijst.map((entry, i) => {
          if (entry.type === 'pas') {
            return (
              <button
                key="pas"
                onClick={onPas}
                className="w-full flex items-center gap-3 p-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors text-left"
              >
                <div className="w-4 h-4 rounded-sm bg-gray-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-medium">Pas</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-600 text-gray-400 uppercase tracking-wide">skip</span>
                  </div>
                  <div className="text-gray-400 text-xs">{pasAdvies.reden}</div>
                </div>
                <div className="text-yellow-400 text-xs flex-shrink-0">{sterren(pasAdvies.score)}</div>
              </button>
            );
          }

          const { item } = entry;
          return <AdviesRegel key={`${item.sectie}-${item.rijId}-${item.celIndex}-${i}`} advies={item} variant={variant} onKies={onKies} />;
        })}
      </div>
    </div>
  );
}

function AdviesRegel({ advies, variant, onKies }: { advies: AdviesItem; variant: VariantConfig; onKies: (zet: ZetEvaluatie) => void }) {
  const rijConfig = variant.rijen.find((r) => r.id === advies.rijId);
  const kleur = rijConfig?.primairKleur ?? 'grijs';
  const stijl = getKleurStijl(kleur);

  const sectieBadge = advies.sectie === 'stap1'
    ? <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-400 uppercase tracking-wide">wit+wit</span>
    : <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-400 uppercase tracking-wide">wit+kleur</span>;

  return (
    <button
      onClick={() => onKies(advies)}
      className="w-full flex items-center gap-3 p-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors text-left"
    >
      <div className={`w-4 h-4 rounded-sm ${stijl.bg} flex-shrink-0`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-medium">{advies.waarde} in {rijConfig?.label ?? advies.rijId}</span>
          {sectieBadge}
        </div>
        <div className="text-gray-400 text-xs truncate">{advies.reden}</div>
      </div>
      <div className="text-yellow-400 text-xs flex-shrink-0">{sterren(advies.score)}</div>
    </button>
  );
}
