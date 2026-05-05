import type { Speler, VariantConfig, Zet } from '../types';
import { ScoreRow } from './ScoreRow';
import { PenaltyTrack } from './PenaltyTrack';
import { ScoreSummary } from './ScoreSummary';

interface Props {
  speler: Speler;
  variant: VariantConfig;
  legaleZetten: Zet[];
  onKiesZet: (zet: Zet) => void;
  interactief: boolean;
  isActief: boolean;
  compact?: boolean;
  laatsteZet?: Zet | null;
}

export function ScoreCard({ speler, variant, legaleZetten, onKiesZet, interactief, isActief, compact, laatsteZet }: Props) {
  return (
    <div className={`card-glass rounded-xl p-3 sm:p-4 border transition-all ${isActief ? 'border-yellow-400/40 shadow-lg shadow-yellow-400/10' : 'border-gray-700/50'} ${compact ? 'scale-90 origin-top' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white font-bold text-lg">
          {speler.naam}
          {speler.isAI && <span className="text-gray-500 text-sm ml-2">🤖</span>}
          {speler.geluksGetallen && speler.geluksGetallen.length > 0 && (
            <span className="text-emerald-400 text-xs ml-2 font-normal">
              🍀 {speler.geluksGetallen.join(', ')}
            </span>
          )}
        </h3>
        {isActief && (
          <span className="text-yellow-400 text-xs font-bold px-2.5 py-1 bg-yellow-400/10 rounded-full border border-yellow-400/20">
            Aan de beurt
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5 sm:gap-2">
        {variant.rijen.map((rijConfig) => (
          <ScoreRow
            key={rijConfig.id}
            rijConfig={rijConfig}
            rijStatus={speler.rijen[rijConfig.id]}
            variant={variant}
            legaleZetten={legaleZetten}
            onKiesZet={onKiesZet}
            interactief={interactief}
            laatsteZetIndex={laatsteZet?.rijId === rijConfig.id ? laatsteZet.celIndex : undefined}
          />
        ))}
      </div>

      <PenaltyTrack strafpunten={speler.strafpunten} maxStrafpunten={variant.maxStrafpunten} />
      <ScoreSummary speler={speler} variant={variant} />
    </div>
  );
}
