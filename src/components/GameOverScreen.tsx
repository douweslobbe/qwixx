import type { Speler, VariantConfig } from '../types';
import { berekenScoreDetails } from '../engine/scoring';
import { getKleurStijl } from '../constants';

interface Props {
  spelers: Speler[];
  variant: VariantConfig;
  onNieuwSpel: () => void;
}

export function GameOverScreen({ spelers, variant, onNieuwSpel }: Props) {
  const scores = spelers.map((s) => ({
    speler: s,
    details: berekenScoreDetails(s, variant),
  }));
  scores.sort((a, b) => b.details.totaal - a.details.totaal);

  const strafSpeler = spelers.find((s) => s.strafpunten >= variant.maxStrafpunten);
  const eindeReden = strafSpeler
    ? `${strafSpeler.naam} heeft ${variant.maxStrafpunten} strafpunten bereikt`
    : `${variant.vergrendeldeRijenVoorEinde} rijen zijn vergrendeld`;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="setup-card rounded-2xl p-6 max-w-lg w-full border border-gray-700/50 max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🏆</div>
          <h2 className="text-3xl font-black text-gradient mb-1">Spel afgelopen!</h2>
          <p className="text-gray-500 text-sm mb-1">{eindeReden}</p>
          <p className="text-gray-400">
            <span className="text-yellow-400 font-bold text-lg">{scores[0].speler.naam}</span> wint!
          </p>
        </div>

        <div className="space-y-3">
          {scores.map(({ speler, details }, i) => (
            <div
              key={speler.id}
              className={`p-4 rounded-xl border transition-all ${
                i === 0 ? 'border-yellow-400/40 bg-yellow-400/5 shadow-lg shadow-yellow-400/5' : 'border-gray-700/50 bg-gray-800/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-bold">
                  {i === 0 && '🏆 '}{i === 1 && '🥈 '}{i === 2 && '🥉 '}{speler.naam}
                  {speler.isAI && ' 🤖'}
                </span>
                <span className={`text-2xl font-black ${i === 0 ? 'text-gradient' : 'text-white'}`}>{details.totaal}</span>
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                {variant.rijen.map((rijConfig) => {
                  const stijl = getKleurStijl(rijConfig.primairKleur);
                  const data = details.rijScores[rijConfig.id];
                  if (!data) return null;
                  return (
                    <div key={rijConfig.id} className="flex items-center gap-1">
                      <div className={`w-3 h-3 rounded-full ${stijl.bg}`} />
                      <span className="text-gray-400">
                        {data.kruisjes}
                        {data.bonusKruisjes ? `+${data.bonusKruisjes}` : ''}
                        {data.heeftSlotBonus ? '+🔒' : ''}
                        x = {data.score}
                      </span>
                    </div>
                  );
                })}
                {details.bonusScore > 0 && (
                  <span className="text-yellow-400">+{details.bonusScore} bonus</span>
                )}
                <span className="text-red-400">-{details.strafpuntenTotaal}</span>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onNieuwSpel}
          className="w-full mt-6 py-3.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 font-black rounded-xl hover:from-yellow-300 hover:to-amber-400 transition-all text-lg btn-lift"
        >
          Nieuw spel
        </button>
      </div>
    </div>
  );
}
