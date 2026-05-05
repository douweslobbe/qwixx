import { useMemo } from 'react';
import type { SpelState, ZetEvaluatie } from '../types';
import { vindLegaleZetten } from '../engine/gameLogic';
import { evalueerZetMetReden } from '../engine/ai';

export interface PasAdvies {
  score: number;
  reden: string;
}

export interface AdviesItem extends ZetEvaluatie {
  sectie: 'stap1' | 'stap2';
}

export interface AdviesOverzicht {
  items: AdviesItem[];   // alle opties gecombineerd, gesorteerd op score
  pasAdvies: PasAdvies;
}

/**
 * Bereken een score voor passen op basis van de beste beschikbare zetten.
 */
function berekenPasAdvies(
  items: AdviesItem[],
  isActief: boolean,
  strafpunten: number,
  maxStrafpunten: number,
  stap1Gekozen: boolean,
  stap2Gekozen: boolean,
): PasAdvies {
  const besteScore = items.length > 0 ? Math.max(...items.map(z => z.score)) : 0;

  // Al iets gekozen: overslaan kost niets
  if (stap1Gekozen || stap2Gekozen) {
    return { score: 70, reden: 'Je hebt al een zet gedaan — overslaan kost niets' };
  }

  // Niet-actieve speler: passen kost geen strafpunt
  if (!isActief) {
    if (items.length === 0) return { score: 80, reden: 'Geen opties — passen is de enige keuze' };
    if (besteScore < 25) return { score: 75, reden: 'Alle opties zijn zwak — beter bewaren voor later' };
    if (besteScore < 40) return { score: 55, reden: 'Matige opties — passen is redelijk, maar je mist kansen' };
    return { score: 20, reden: 'Er zijn goede opties — passen zou zonde zijn' };
  }

  // Actieve speler: passen = strafpunt als ook stap2 gepast
  const bijnaGameOver = strafpunten >= maxStrafpunten - 1;

  if (bijnaGameOver) {
    if (items.length === 0) return { score: 10, reden: 'Geen opties maar passen = EINDE SPEL! Probeer iets te kiezen' };
    return { score: 5, reden: 'Passen = EINDE SPEL! Kies iets, wat dan ook' };
  }

  if (items.length === 0) return { score: 30, reden: `Geen opties — strafpunt onvermijdelijk (${strafpunten + 1}/${maxStrafpunten})` };
  if (besteScore < 15) return { score: 40, reden: `Alle opties zijn slecht — strafpunt (${strafpunten + 1}/${maxStrafpunten}) kan beter zijn` };
  if (besteScore < 30) return { score: 25, reden: `Matige opties — strafpunt vermijden (${strafpunten + 1}/${maxStrafpunten}) is meestal beter` };
  return { score: 10, reden: `Er zijn goede opties — strafpunt (${strafpunten + 1}/${maxStrafpunten}) is onnodig` };
}

export function useAdvisory(state: SpelState, isActieveSpelerOverride?: boolean): AdviesOverzicht {
  const isActief = isActieveSpelerOverride ?? (state.actieveSpelerIndex === 0);

  return useMemo(() => {
    const leeg: AdviesOverzicht = { items: [], pasAdvies: { score: 50, reden: '' } };
    if (state.status !== 'actief') return leeg;
    if (state.beurtStap === 'gooien' || state.beurtStap === 'klaar') return leeg;

    const speler = state.spelers[0];
    if (!speler) return leeg;

    const stap1Gekozen = state.stap1Gekozen !== null;
    const stap2Gekozen = state.stap2Gekozen !== null;

    // Stap1 zetten — alleen tonen als we in stap1 zitten en nog niet gekozen
    const stap1Items: AdviesItem[] = [];
    if (state.beurtStap === 'stap1' && !stap1Gekozen) {
      const zetten = vindLegaleZetten(speler, 'stap1', state.dobbelstenen, state.vergrendeldeRijen, state.variant);
      for (const z of zetten) {
        stap1Items.push({ ...evalueerZetMetReden(speler, z, state.variant), sectie: 'stap1' });
      }
    }

    // Stap2 zetten — tonen als actieve speler en nog niet gekozen (ook al in stap1 voor overzicht)
    const stap2Items: AdviesItem[] = [];
    if (isActief && !stap2Gekozen) {
      const zetten = vindLegaleZetten(speler, 'stap2', state.dobbelstenen, state.vergrendeldeRijen, state.variant);
      for (const z of zetten) {
        stap2Items.push({ ...evalueerZetMetReden(speler, z, state.variant), sectie: 'stap2' });
      }
    }

    // Combineer en sorteer op score (hoogste eerst)
    const items: AdviesItem[] = [...stap1Items, ...stap2Items].sort((a, b) => b.score - a.score);

    // Pas-advies berekenen op basis van gecombineerde beschikbare items
    const pasAdvies = berekenPasAdvies(
      items, isActief,
      speler.strafpunten, state.variant.maxStrafpunten,
      stap1Gekozen, stap2Gekozen,
    );

    return { items, pasAdvies };
  }, [state.status, state.beurtStap, state.spelers, state.dobbelstenen, state.vergrendeldeRijen, state.variant, state.stap1Gekozen, state.stap2Gekozen, isActief]);
}
