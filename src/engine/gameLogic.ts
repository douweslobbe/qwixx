import type { Dobbelsteen, RijId, RijConfig, RijStatus, Speler, SpelState, VariantConfig, Zet } from '../types';
import { isCelAangekruist, maakCelStatus } from '../types';

export function maakNieuweRijStatus(rijConfig: RijConfig, kruisjesPerCel: number): RijStatus {
  return {
    rijId: rijConfig.id,
    cellen: rijConfig.cellen.map(() => maakCelStatus(kruisjesPerCel)),
    vergrendeld: false,
  };
}

export function maakNieuweSpeler(id: string, naam: string, isAI: boolean, variant: VariantConfig): Speler {
  const rijen: Record<RijId, RijStatus> = {};
  for (const rijConfig of variant.rijen) {
    rijen[rijConfig.id] = maakNieuweRijStatus(rijConfig, variant.kruisjesPerCel);
  }

  // Longo: wijs 2 willekeurige geluksgetallen toe (uit middenrange voor balans)
  let geluksGetallen: number[] | undefined;
  if (variant.id === 'longo') {
    const mogelijke = [5, 6, 7, 8, 9, 10, 11, 12, 13]; // Middenrange 2d8
    const shuffled = mogelijke.sort(() => Math.random() - 0.5);
    geluksGetallen = [shuffled[0], shuffled[1]].sort((a, b) => a - b);
  }

  return { id, naam, isAI, rijen, strafpunten: 0, geluksGetallen };
}

export function berekenWitSom(dobbelstenen: Dobbelsteen[]): number {
  const wit1 = dobbelstenen.find((d) => d.kleur === 'wit1');
  const wit2 = dobbelstenen.find((d) => d.kleur === 'wit2');
  return (wit1?.waarde ?? 0) + (wit2?.waarde ?? 0);
}

export function berekenGekleurdeCombi(dobbelstenen: Dobbelsteen[]): Map<string, number[]> {
  const wit1 = dobbelstenen.find((d) => d.kleur === 'wit1');
  const wit2 = dobbelstenen.find((d) => d.kleur === 'wit2');
  const result = new Map<string, number[]>();

  for (const d of dobbelstenen) {
    if (d.kleur === 'wit1' || d.kleur === 'wit2' || !d.actief) continue;
    const sommen = new Set<number>();
    if (wit1) sommen.add(wit1.waarde + d.waarde);
    if (wit2) sommen.add(wit2.waarde + d.waarde);
    result.set(d.kleur, [...sommen]);
  }

  return result;
}

export function getLaatsteAangekruisteIndex(rij: RijStatus): number {
  for (let i = rij.cellen.length - 1; i >= 0; i--) {
    if (isCelAangekruist(rij.cellen[i])) return i;
  }
  return -1;
}

export function getAantalKruisjes(rij: RijStatus): number {
  return rij.cellen.reduce((sum, cel) => sum + cel.kruisjes, 0);
}

function isLegaalVoorRij(
  rij: RijStatus,
  rijConfig: RijConfig,
  celIndex: number,
  vergrendeldeRijen: RijId[]
): boolean {
  if (rij.vergrendeld || vergrendeldeRijen.includes(rij.rijId)) return false;
  if (isCelAangekruist(rij.cellen[celIndex])) return false;
  if (celIndex <= getLaatsteAangekruisteIndex(rij)) return false;
  const laatsteIndex = rijConfig.cellen.length - 1;
  if (celIndex === laatsteIndex && getAantalKruisjes(rij) < rijConfig.kruisjesVoorSlot) return false;
  return true;
}

export function vindLegaleZetten(
  speler: Speler,
  stap: 'stap1' | 'stap2',
  dobbelstenen: Dobbelsteen[],
  vergrendeldeRijen: RijId[],
  variant: VariantConfig
): Zet[] {
  const zetten: Zet[] = [];

  if (stap === 'stap1') {
    const witSom = berekenWitSom(dobbelstenen);
    for (const rijConfig of variant.rijen) {
      if (!rijConfig.vergrendelbaar && rijConfig.dobbelsteenKleuren.length === 0) continue;
      const rij = speler.rijen[rijConfig.id];
      if (!rij) continue;
      for (let i = 0; i < rijConfig.cellen.length; i++) {
        if (rijConfig.cellen[i].waarde === witSom) {
          if (isLegaalVoorRij(rij, rijConfig, i, vergrendeldeRijen)) {
            zetten.push({ rijId: rijConfig.id, celIndex: i, waarde: witSom, stap: 'stap1' });
          }
        }
      }
    }

    // Longo geluksgetallen: als witte som een geluksgetal is,
    // mag je het volgende ongemarkeerde vakje in je minst gevorderde rij aankruisen
    if (speler.geluksGetallen?.includes(witSom)) {
      // Vind de minst gevorderde rij (minste kruisjes)
      let minKruisjes = Infinity;
      let minRijConfig: RijConfig | null = null;
      for (const rc of variant.rijen) {
        if (vergrendeldeRijen.includes(rc.id)) continue;
        const r = speler.rijen[rc.id];
        if (!r || r.vergrendeld) continue;
        const k = getAantalKruisjes(r);
        if (k < minKruisjes) {
          minKruisjes = k;
          minRijConfig = rc;
        }
      }
      if (minRijConfig) {
        const minRij = speler.rijen[minRijConfig.id];
        const laatsteIdx = getLaatsteAangekruisteIndex(minRij);
        const volgendeIdx = laatsteIdx + 1;
        if (volgendeIdx < minRijConfig.cellen.length) {
          const cel = minRijConfig.cellen[volgendeIdx];
          // Voeg toe als deze zet nog niet in de lijst staat
          const bestaatAl = zetten.some(z => z.rijId === minRijConfig!.id && z.celIndex === volgendeIdx);
          if (!bestaatAl && isLegaalVoorRij(minRij, minRijConfig, volgendeIdx, vergrendeldeRijen)) {
            zetten.push({ rijId: minRijConfig.id, celIndex: volgendeIdx, waarde: cel.waarde, stap: 'stap1' });
          }
        }
      }
    }
  } else {
    const combis = berekenGekleurdeCombi(dobbelstenen);
    for (const rijConfig of variant.rijen) {
      const rij = speler.rijen[rijConfig.id];
      if (!rij) continue;

      // Bij gemengde richting (Mixx): check per cel welke kleur geldig is
      const isGemengd = rijConfig.richting === 'gemengd';

      if (isGemengd) {
        // Per cel: alleen de gekleurde dobbelsteen die bij die cel past
        for (let i = 0; i < rijConfig.cellen.length; i++) {
          const cel = rijConfig.cellen[i];
          const celSommen = combis.get(cel.kleur);
          if (celSommen && celSommen.includes(cel.waarde)) {
            if (isLegaalVoorRij(rij, rijConfig, i, vergrendeldeRijen)) {
              zetten.push({ rijId: rijConfig.id, celIndex: i, waarde: cel.waarde, stap: 'stap2' });
            }
          }
        }
      } else {
        // Standaard: verzamel alle mogelijke sommen voor deze rij
        const mogelijkeSommen = new Set<number>();
        for (const kleur of rijConfig.dobbelsteenKleuren) {
          const sommen = combis.get(kleur);
          if (sommen) sommen.forEach((s) => mogelijkeSommen.add(s));
        }
        for (let i = 0; i < rijConfig.cellen.length; i++) {
          const cel = rijConfig.cellen[i];
          if (mogelijkeSommen.has(cel.waarde)) {
            if (isLegaalVoorRij(rij, rijConfig, i, vergrendeldeRijen)) {
              zetten.push({ rijId: rijConfig.id, celIndex: i, waarde: cel.waarde, stap: 'stap2' });
            }
          }
        }
      }
    }
  }

  return zetten;
}

export function pasZetToe(speler: Speler, zet: Zet): Speler {
  const rij = speler.rijen[zet.rijId];
  const nieuweCellen = rij.cellen.map((cel, i) => {
    if (i === zet.celIndex) {
      return { ...cel, kruisjes: Math.min(cel.kruisjes + 1, cel.maxKruisjes) };
    }
    return cel;
  });

  return {
    ...speler,
    rijen: {
      ...speler.rijen,
      [zet.rijId]: { ...rij, cellen: nieuweCellen },
    },
  };
}

export function kanRijVergrendelen(rij: RijStatus, rijConfig: RijConfig): boolean {
  if (!rijConfig.vergrendelbaar) return false;
  const kruisjes = getAantalKruisjes(rij);
  const laatsteIndex = rijConfig.cellen.length - 1;
  return kruisjes >= rijConfig.kruisjesVoorSlot && isCelAangekruist(rij.cellen[laatsteIndex]);
}

export function vergrendelRij(state: SpelState, rijId: RijId): SpelState {
  const nieuweVergrendeld = [...state.vergrendeldeRijen, rijId];
  const rijConfig = state.variant.rijen.find((r) => r.id === rijId);
  // Deactiveer de bijbehorende gekleurde dobbelstenen
  const deactiveerKleuren = rijConfig?.dobbelsteenKleuren ?? [];
  const nieuweDobbelstenen = state.dobbelstenen.map((d) =>
    deactiveerKleuren.includes(d.kleur) ? { ...d, actief: false } : d
  );

  const nieuweSpelers = state.spelers.map((speler) => ({
    ...speler,
    rijen: {
      ...speler.rijen,
      [rijId]: { ...speler.rijen[rijId], vergrendeld: true },
    },
  }));

  return {
    ...state,
    vergrendeldeRijen: nieuweVergrendeld,
    dobbelstenen: nieuweDobbelstenen,
    spelers: nieuweSpelers,
  };
}

export function geefStrafpunt(speler: Speler): Speler {
  return { ...speler, strafpunten: speler.strafpunten + 1 };
}

export function isSpelAfgelopen(state: SpelState): boolean {
  if (state.vergrendeldeRijen.length >= state.variant.vergrendeldeRijenVoorEinde) return true;
  return state.spelers.some((s) => s.strafpunten >= state.variant.maxStrafpunten);
}
