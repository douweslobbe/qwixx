import type { RijConfig, RijStatus, VariantConfig, Zet } from '../types';
import { isCelAangekruist, isCelVol } from '../types';
import { getLaatsteAangekruisteIndex } from '../engine/gameLogic';
import { NumberCell } from './NumberCell';
import { LockCell } from './LockCell';

interface Props {
  rijConfig: RijConfig;
  rijStatus: RijStatus;
  variant: VariantConfig;
  legaleZetten: Zet[];
  onKiesZet: (zet: Zet) => void;
  interactief: boolean;
  laatsteZetIndex?: number;
}

export function ScoreRow({ rijConfig, rijStatus, variant, legaleZetten, onKiesZet, interactief, laatsteZetIndex }: Props) {
  const stapVeldenSet = new Set(rijConfig.stapVelden ?? []);
  const bonusCelConfig = variant.bonussen.find((b) => b.type === 'bonus-cel');
  const bonusCelPosities = new Set((bonusCelConfig?.params.posities as number[]) ?? []);
  const laatsteIndex = getLaatsteAangekruisteIndex(rijStatus);

  const legaleIndices = new Map<number, Zet>();
  if (interactief) {
    for (const zet of legaleZetten) {
      if (zet.rijId === rijConfig.id) {
        legaleIndices.set(zet.celIndex, zet);
      }
    }
  }

  const heeftLegaleZetten = interactief && legaleIndices.size > 0 && !rijStatus.vergrendeld;
  const laatsteCelIndex = rijConfig.cellen.length - 1;
  const slotKlikbaar = legaleIndices.has(laatsteCelIndex) && !isCelAangekruist(rijStatus.cellen[laatsteCelIndex]);

  // Toon label als variant meer dan 4 rijen heeft of bij gemengde richting (Mixx)
  const toonLabel = variant.rijen.length > 4 || rijConfig.richting === 'gemengd';

  return (
    <div className={`flex gap-1 sm:gap-1.5 items-center rounded-lg transition-all ${rijStatus.vergrendeld ? 'opacity-50 grayscale-[30%]' : ''} ${heeftLegaleZetten ? 'bg-white/5 px-1 py-0.5 -mx-1 outline outline-1 outline-white/15' : ''}`}>
      {toonLabel && (
        <span className="text-[10px] text-gray-500 w-5 shrink-0 text-right truncate" title={rijConfig.label}>
          {rijConfig.label.replace('Rij ', '').replace('Bonus ', 'B:')}
        </span>
      )}
      {rijConfig.cellen.map((cel, index) => {
        const celStatus = rijStatus.cellen[index];
        const klikbaar = legaleIndices.has(index);
        const voorbij = index < laatsteIndex && !isCelAangekruist(celStatus);
        return (
          <NumberCell
            key={`${rijConfig.id}-${index}`}
            nummer={cel.waarde}
            kleur={cel.kleur}
            aangekruist={isCelAangekruist(celStatus)}
            dubbelKruis={isCelVol(celStatus) && celStatus.maxKruisjes > 1}
            isStapVeld={stapVeldenSet.has(index)}
            isBonusCel={bonusCelPosities.has(index)}
            isLaatsteZet={laatsteZetIndex === index}
            klikbaar={klikbaar}
            voorbij={voorbij}
            onClick={klikbaar ? () => onKiesZet(legaleIndices.get(index)!) : undefined}
          />
        );
      })}
      {rijConfig.vergrendelbaar && (
        <LockCell
          kleur={rijConfig.primairKleur}
          vergrendeld={rijStatus.vergrendeld}
          klikbaar={slotKlikbaar}
          onClick={slotKlikbaar ? () => onKiesZet(legaleIndices.get(laatsteCelIndex)!) : undefined}
        />
      )}
    </div>
  );
}
