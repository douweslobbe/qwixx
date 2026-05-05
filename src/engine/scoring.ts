import type { RijId, Speler, VariantConfig } from '../types';
import { isCelAangekruist } from '../types';

export interface ScoreDetails {
  rijScores: Record<RijId, { kruisjes: number; score: number; bonusKruisjes?: number; heeftSlotBonus?: boolean }>;
  bonusScore: number;
  strafpuntenTotaal: number;
  totaal: number;
}

export function berekenRijScore(kruisjes: number, isVergrendeld: boolean, scoreTabel: number[]): number {
  const effectief = isVergrendeld ? kruisjes + 1 : kruisjes;
  return scoreTabel[Math.min(effectief, scoreTabel.length - 1)] ?? 0;
}

/**
 * Big Points: tel kruisjes uit bonusrijen mee voor aangrenzende kleurrijen.
 * Bonusrij-kruisjes tellen mee voor BEIDE aangrenzende kleurrijen.
 */
function berekenBigPointsBonusKruisjes(speler: Speler, variant: VariantConfig): Record<RijId, number> {
  const bonusKruisjes: Record<RijId, number> = {};

  for (const rijConfig of variant.rijen) {
    if (!rijConfig.teltMeeVoor || rijConfig.teltMeeVoor.length === 0) continue;

    const bonusRij = speler.rijen[rijConfig.id];
    if (!bonusRij) continue;

    const kruisjesInBonusRij = bonusRij.cellen.reduce((sum, cel) => sum + cel.kruisjes, 0);
    if (kruisjesInBonusRij === 0) continue;

    for (const doelRijId of rijConfig.teltMeeVoor) {
      bonusKruisjes[doelRijId] = (bonusKruisjes[doelRijId] ?? 0) + kruisjesInBonusRij;
    }
  }

  return bonusKruisjes;
}

/**
 * Connected Step: tel aangekruiste stap-velden als aparte bonusrij.
 * Stap-velden worden dubbel gescoord: als onderdeel van hun kleurrij (normaal)
 * EN als aparte bonusrij met driehoeksscoring.
 */
function berekenStapBonus(speler: Speler, variant: VariantConfig): number {
  const heeftStapBonus = variant.bonussen.some((b) => b.type === 'stap-bonus');
  if (!heeftStapBonus) return 0;

  let aantalStapKruisjes = 0;

  for (const rijConfig of variant.rijen) {
    if (!rijConfig.stapVelden || rijConfig.stapVelden.length === 0) continue;

    const rij = speler.rijen[rijConfig.id];
    if (!rij) continue;

    for (const celIndex of rijConfig.stapVelden) {
      if (celIndex < rij.cellen.length && isCelAangekruist(rij.cellen[celIndex])) {
        aantalStapKruisjes++;
      }
    }
  }

  // Score stap-velden als aparte bonusrij met dezelfde driehoeksscoring
  return variant.scoreTabel[Math.min(aantalStapKruisjes, variant.scoreTabel.length - 1)] ?? 0;
}

/**
 * Connected Chains: bonus per aaneengesloten ketting van kruisjes in een rij.
 */
function berekenKettingBonus(speler: Speler, variant: VariantConfig): number {
  const kettingConfig = variant.bonussen.find((b) => b.type === 'ketting');
  if (!kettingConfig) return 0;

  const puntenPerKetting = (kettingConfig.params.puntenPerKetting as number[]) ?? [];
  let totaalBonus = 0;

  for (const rijConfig of variant.rijen) {
    const rij = speler.rijen[rijConfig.id];
    if (!rij) continue;

    // Vind langste aaneengesloten ketting
    let langsteKetting = 0;
    let huidigeKetting = 0;

    for (const cel of rij.cellen) {
      if (isCelAangekruist(cel)) {
        huidigeKetting++;
        langsteKetting = Math.max(langsteKetting, huidigeKetting);
      } else {
        huidigeKetting = 0;
      }
    }

    if (langsteKetting < puntenPerKetting.length) {
      totaalBonus += puntenPerKetting[langsteKetting] ?? 0;
    } else if (puntenPerKetting.length > 0) {
      totaalBonus += puntenPerKetting[puntenPerKetting.length - 1] ?? 0;
    }
  }

  return totaalBonus;
}

/**
 * Bonus variant: extra punten voor specifieke celposities (bonuscellen).
 */
function berekenBonusCelPunten(speler: Speler, variant: VariantConfig): number {
  const bonusCelConfig = variant.bonussen.find((b) => b.type === 'bonus-cel');
  if (!bonusCelConfig) return 0;

  const posities = (bonusCelConfig.params.posities as number[]) ?? [];
  const puntenPerBonus = (bonusCelConfig.params.puntenPerBonus as number) ?? 0;
  let totaal = 0;

  for (const rijConfig of variant.rijen) {
    const rij = speler.rijen[rijConfig.id];
    if (!rij) continue;

    for (const positie of posities) {
      if (positie < rij.cellen.length && isCelAangekruist(rij.cellen[positie])) {
        totaal += puntenPerBonus;
      }
    }
  }

  return totaal;
}

export function berekenScoreDetails(speler: Speler, variant: VariantConfig): ScoreDetails {
  const rijScores: Record<RijId, { kruisjes: number; score: number; bonusKruisjes?: number; heeftSlotBonus?: boolean }> = {};

  // Big Points: bereken bonus kruisjes van bonusrijen
  const bonusKruisjes = berekenBigPointsBonusKruisjes(speler, variant);

  let totaal = 0;
  for (const rijConfig of variant.rijen) {
    const rij = speler.rijen[rijConfig.id];
    if (!rij) continue;
    const eigenKruisjes = rij.cellen.reduce((sum, cel) => sum + cel.kruisjes, 0);

    // Voor bonusrijen met teltMeeVoor: scoor NIET apart (kruisjes tellen via de kleurrijen)
    if (rijConfig.teltMeeVoor && rijConfig.teltMeeVoor.length > 0) {
      rijScores[rijConfig.id] = { kruisjes: eigenKruisjes, score: 0 };
      continue;
    }

    // Effectieve kruisjes = eigen + bonus van bonusrijen
    const extraKruisjes = bonusKruisjes[rijConfig.id] ?? 0;
    const effectieveKruisjes = eigenKruisjes + extraKruisjes;

    // Slotbonus (+1) alleen voor de speler die de rij heeft afgesloten:
    // de rij is vergrendeld én het laatste vakje is aangekruist (= deze speler deed het slot)
    const slotIndex = rijConfig.cellen.length - 1;
    const heeftSlotGekruist =
      rij.vergrendeld &&
      rijConfig.vergrendelbaar &&
      isCelAangekruist(rij.cellen[slotIndex]);
    const score = berekenRijScore(effectieveKruisjes, heeftSlotGekruist, variant.scoreTabel);

    rijScores[rijConfig.id] = {
      kruisjes: eigenKruisjes,
      score,
      bonusKruisjes: extraKruisjes > 0 ? extraKruisjes : undefined,
      heeftSlotBonus: heeftSlotGekruist || undefined,
    };
    totaal += score;
  }

  // Variant-specifieke bonussen
  const stapBonus = berekenStapBonus(speler, variant);
  const kettingBonus = berekenKettingBonus(speler, variant);
  const bonusCelPunten = berekenBonusCelPunten(speler, variant);
  const bonusScore = stapBonus + kettingBonus + bonusCelPunten;
  totaal += bonusScore;

  const strafpuntenTotaal = speler.strafpunten * variant.strafpuntenPerStuk;
  totaal -= strafpuntenTotaal;

  return { rijScores, bonusScore, strafpuntenTotaal, totaal };
}

export function berekenTotaalScore(speler: Speler, variant: VariantConfig): number {
  return berekenScoreDetails(speler, variant).totaal;
}
