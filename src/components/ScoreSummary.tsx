import type { Speler, VariantConfig } from '../types';
import { berekenScoreDetails } from '../engine/scoring';
import { getKleurStijl } from '../constants';

interface Props {
  speler: Speler;
  variant: VariantConfig;
}

export function ScoreSummary({ speler, variant }: Props) {
  const details = berekenScoreDetails(speler, variant);

  return (
    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
      {variant.rijen.map((rijConfig) => {
        const stijl = getKleurStijl(rijConfig.primairKleur);
        const data = details.rijScores[rijConfig.id];
        if (!data) return null;
        return (
          <div key={rijConfig.id} className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded-sm ${stijl.bg}`} />
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
        <div className="flex items-center gap-1">
          <span className="text-yellow-400">+{details.bonusScore} bonus</span>
        </div>
      )}
      <div className="flex items-center gap-1">
        <span className="text-red-400">-{details.strafpuntenTotaal}</span>
      </div>
      <div className="border-l border-gray-600 pl-3 ml-1">
        <span className="text-white font-bold">Totaal: {details.totaal}</span>
      </div>
    </div>
  );
}
