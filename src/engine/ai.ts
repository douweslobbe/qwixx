import type { Dobbelsteen, RijId, Speler, VariantConfig, Zet, ZetEvaluatie } from '../types';
import { vindLegaleZetten, getLaatsteAangekruisteIndex, getAantalKruisjes } from './gameLogic';

// === Dobbelstenen kanstabel (2d6) ===
const KANS_2D6: Record<number, number> = {
  2: 1/36, 3: 2/36, 4: 3/36, 5: 4/36, 6: 5/36, 7: 6/36,
  8: 5/36, 9: 4/36, 10: 3/36, 11: 2/36, 12: 1/36,
};

// 2d8 kanstabel voor Longo
const KANS_2D8: Record<number, number> = {
  2: 1/64, 3: 2/64, 4: 3/64, 5: 4/64, 6: 5/64, 7: 6/64, 8: 7/64,
  9: 8/64, 10: 7/64, 11: 6/64, 12: 5/64, 13: 4/64, 14: 3/64, 15: 2/64, 16: 1/64,
};

function getKansTabel(zijden: number): Record<number, number> {
  return zijden === 8 ? KANS_2D8 : KANS_2D6;
}

// === Gewichten voor de 5-factor scoring (geïnspireerd op Cal Poly thesis) ===
const W = {
  gap: 25,         // Gap penalty
  count: 20,       // Rij-concentratie bonus
  position: 10,    // Positie in de rij
  likelihood: 20,  // Kansbeoordeling volgende nummers
  penalty: 15,     // Strafpuntvermijding
};

/**
 * Bereken de gap-score: penaliseer overgeslagen nummers.
 * Bron: qwixx.nl - nooit meer dan 2 nummers overslaan.
 * Exponentiële penalty: 1 overslaan = licht, 2 = matig, 3+ = zwaar.
 */
function gapScore(overgeslagen: number): number {
  if (overgeslagen === 0) return 1.0;
  if (overgeslagen === 1) return 0.6;
  if (overgeslagen === 2) return 0.25;
  return 0.0; // 3+ overslaan: zeer sterk afgeraden
}

/**
 * Bereken de concentratie-score: beloon zetten in rijen met al veel kruisjes.
 * Bron: spellenwijs.nl - concentreren is exponentieel beter dan spreiden.
 * 4x4 = 40 punten, maar 2x8 = 72 punten.
 * Marginale waarde van kruisje N = N.
 */
function countScore(kruisjes: number, totaalCellen: number): number {
  // Marginale waarde: hoe meer kruisjes, hoe waardevoller het volgende
  const marginaal = kruisjes + 1;
  const max = totaalCellen;
  return marginaal / max;
}

/**
 * Bereken de likelihood-score: hoe waarschijnlijk zijn de volgende nummers in deze rij?
 * Bron: Cal Poly thesis - weight moves by probability of rolling needed sums.
 * Midden-nummers (5-9) komen veel vaker voor dan extremen (2,3,11,12).
 */
function likelihoodScore(
  celIndex: number,
  rijCellen: { waarde: number }[],
  rijStatus: import('../types').RijStatus,
  zijden: number
): number {
  const kansTabel = getKansTabel(zijden);
  // Bereken gemiddelde kans van de nog beschikbare nummers NA deze zet
  let totaalKans = 0;
  let aantalBeschikbaar = 0;
  for (let i = celIndex + 1; i < rijCellen.length; i++) {
    if (rijStatus.cellen[i].kruisjes === 0) {
      const waarde = rijCellen[i].waarde;
      const kans = kansTabel[waarde] ?? 0;
      totaalKans += kans;
      aantalBeschikbaar++;
    }
  }
  if (aantalBeschikbaar === 0) return 0.5; // Rij bijna vol
  return Math.min(1, totaalKans / 0.5); // Normaliseer: 50%+ beschikbaar = maximaal
}

/**
 * Bereken positie-score: vroege posities zijn beter in het begin,
 * lock-posities zijn waardevol als je genoeg kruisjes hebt.
 */
function positionScore(
  celIndex: number,
  totaalCellen: number,
  kruisjes: number,
  kruisjesVoorSlot: number
): number {
  const laatsteIndex = totaalCellen - 1;

  // Lock-bonus: als je genoeg kruisjes hebt en het laatste nummer pakt
  if (celIndex === laatsteIndex && kruisjes >= kruisjesVoorSlot - 1) {
    return 1.0;
  }

  // Vroege posities zijn beter (meer flexibiliteit)
  const relatievePositie = celIndex / laatsteIndex;
  return 1 - relatievePositie * 0.4; // Lineair: eerste cel = 1.0, laatste = 0.6
}

/**
 * Bereken richtingsparing-bonus: beloon actief zijn in 1 oplopend + 1 aflopend.
 * Bron: meerdere bronnen - maximaliseer het aantal bruikbare worpen.
 */
function richtingBonus(
  speler: Speler,
  rijId: RijId,
  variant: VariantConfig
): number {
  const rijConfig = variant.rijen.find((r) => r.id === rijId);
  if (!rijConfig) return 0;

  const actieveRijen = variant.rijen.filter((r) => {
    const rij = speler.rijen[r.id];
    return rij && getAantalKruisjes(rij) > 0 && !rij.vergrendeld;
  });

  const heeftOplopend = actieveRijen.some((r) => r.richting === 'oplopend');
  const heeftAflopend = actieveRijen.some((r) => r.richting === 'aflopend');

  // Als je nog geen actieve rij in deze richting hebt, bonus
  if (rijConfig.richting === 'oplopend' && !heeftOplopend) return 0.15;
  if (rijConfig.richting === 'aflopend' && !heeftAflopend) return 0.15;
  // Als je al actief bent in beide richtingen, neutrale bonus
  if (heeftOplopend && heeftAflopend) return 0.05;

  return 0;
}

/**
 * Hoofdscoring-functie: combineert alle 5 factoren.
 */
export function evalueerZet(speler: Speler, zet: Zet, variant: VariantConfig): number {
  const rij = speler.rijen[zet.rijId];
  const rijConfig = variant.rijen.find((r) => r.id === zet.rijId);
  if (!rij || !rijConfig) return 0;

  const laatsteIndex = getLaatsteAangekruisteIndex(rij);
  const overgeslagen = zet.celIndex - laatsteIndex - 1;
  const kruisjes = getAantalKruisjes(rij);
  const totaalCellen = rijConfig.cellen.length;
  const zijden = variant.dobbelstenen[0]?.zijden ?? 6;

  // 5-factor score berekening
  const gap = gapScore(overgeslagen);
  const count = countScore(kruisjes, totaalCellen);
  const position = positionScore(zet.celIndex, totaalCellen, kruisjes, rijConfig.kruisjesVoorSlot);
  const likelihood = likelihoodScore(zet.celIndex, rijConfig.cellen, rij, zijden);
  const richting = richtingBonus(speler, zet.rijId, variant);

  // Gewogen combinatie (0-100 schaal)
  const rawScore = (
    gap * W.gap +
    count * W.count +
    position * W.position +
    likelihood * W.likelihood
  ) + richting * 100;

  // Variant-specifieke bonussen
  let variantBonus = 0;

  // Big Points: bonusrij telt mee voor aangrenzende kleurrijen → extra waardevol
  if (rijConfig.teltMeeVoor && rijConfig.teltMeeVoor.length > 0) {
    variantBonus += 8; // Bonusrij-kruisjes tellen dubbel
  }

  // Connected Step: stap-velden worden dubbel gescoord
  if (rijConfig.stapVelden?.includes(zet.celIndex)) {
    variantBonus += 10; // Stap-veld = dubbele score
  }

  // Bonus variant: bonuscellen geven extra punten
  const bonusCelConfig = variant.bonussen.find((b) => b.type === 'bonus-cel');
  if (bonusCelConfig) {
    const posities = (bonusCelConfig.params.posities as number[]) ?? [];
    if (posities.includes(zet.celIndex)) {
      variantBonus += 6;
    }
  }

  // Connected Chains: kettingvorming belonen
  const kettingConfig = variant.bonussen.find((b) => b.type === 'ketting');
  if (kettingConfig) {
    // Check of deze zet aansluit bij bestaande kruisjes (ketting verlengen)
    const vorige = zet.celIndex > 0 ? rij.cellen[zet.celIndex - 1] : null;
    if (vorige && vorige.kruisjes > 0) {
      variantBonus += 5; // Verlengt een ketting
    }
  }

  // Penalty awareness: als strafpunten hoog zijn, accepteer slechtere zetten eerder
  const strafBonus = speler.strafpunten >= 3 ? 10 : speler.strafpunten >= 2 ? 5 : 0;

  return Math.max(0, Math.min(100, rawScore + strafBonus + variantBonus));
}

/**
 * Genereer een menselijk leesbare uitleg van de zet-evaluatie.
 */
export function evalueerZetMetReden(speler: Speler, zet: Zet, variant: VariantConfig): ZetEvaluatie {
  const score = evalueerZet(speler, zet, variant);
  const rij = speler.rijen[zet.rijId];
  const rijConfig = variant.rijen.find((r) => r.id === zet.rijId);
  if (!rij || !rijConfig) return { ...zet, score, reden: '' };

  const laatsteIndex = getLaatsteAangekruisteIndex(rij);
  const overgeslagen = zet.celIndex - laatsteIndex - 1;
  const kruisjes = getAantalKruisjes(rij);
  const laatsteCelIndex = rijConfig.cellen.length - 1;
  const zijden = variant.dobbelstenen[0]?.zijden ?? 6;
  const kansTabel = getKansTabel(zijden);

  const delen: string[] = [];

  // Aansluiting
  if (overgeslagen === 0) {
    delen.push('sluit direct aan');
  } else if (overgeslagen <= 2) {
    delen.push(`slaat ${overgeslagen} nummer${overgeslagen > 1 ? 's' : ''} over`);
  } else {
    delen.push(`slaat ${overgeslagen} nummers over - riskant!`);
  }

  // Kruisjes en marginale waarde
  const marginaleWaarde = kruisjes + 1;
  delen.push(`${kruisjes + 1}e kruisje in deze rij (+${marginaleWaarde} punt)`);

  // Lock info
  if (kruisjes >= rijConfig.kruisjesVoorSlot - 1 && zet.celIndex === laatsteCelIndex) {
    delen.push('sluit de rij af en vergrendelt!');
  }

  // Kans op volgend nummer
  if (zet.celIndex < laatsteCelIndex) {
    const volgendeCel = rijConfig.cellen[zet.celIndex + 1];
    if (volgendeCel) {
      const kans = kansTabel[volgendeCel.waarde] ?? 0;
      const kansPerc = Math.round(kans * 100);
      if (kansPerc > 0) {
        delen.push(`volgende (${volgendeCel.waarde}) heeft ${kansPerc}% kans`);
      }
    }
  }

  // Variant-specifieke uitleg
  if (rijConfig.teltMeeVoor && rijConfig.teltMeeVoor.length > 0) {
    delen.push(`telt mee voor ${rijConfig.teltMeeVoor.join(' en ')}`);
  }
  if (rijConfig.stapVelden?.includes(zet.celIndex)) {
    delen.push('stap-veld (dubbele score!)');
  }
  const bonusCelConf = variant.bonussen.find((b) => b.type === 'bonus-cel');
  if (bonusCelConf) {
    const posities = (bonusCelConf.params.posities as number[]) ?? [];
    const punten = (bonusCelConf.params.puntenPerBonus as number) ?? 0;
    if (posities.includes(zet.celIndex)) {
      delen.push(`bonuscel (+${punten} extra)`);
    }
  }
  const kettingConf = variant.bonussen.find((b) => b.type === 'ketting');
  if (kettingConf) {
    const vorige = zet.celIndex > 0 ? rij.cellen[zet.celIndex - 1] : null;
    if (vorige && vorige.kruisjes > 0) {
      delen.push('verlengt ketting');
    }
  }

  // Sterren-rating
  let sterren: string;
  if (score >= 80) sterren = '★★★';
  else if (score >= 55) sterren = '★★';
  else if (score >= 35) sterren = '★';
  else sterren = '△';

  return {
    ...zet,
    score,
    reden: `${sterren} Kruis ${zet.waarde} af in ${rijConfig.label.toLowerCase()} (${delen.join('; ')})`,
  };
}

/**
 * AI kiest een zet: gewogen random uit de top 3.
 */
export function kiesAIZet(evaluaties: ZetEvaluatie[]): ZetEvaluatie | null {
  if (evaluaties.length === 0) return null;

  const gesorteerd = [...evaluaties].sort((a, b) => b.score - a.score);

  // Bij score 0 of zeer laag: pas liever (tenzij strafpunten dreigen)
  if (gesorteerd[0].score < 15) return null;

  const top = gesorteerd.slice(0, 3);
  const gewichten = [0.7, 0.2, 0.1];
  const r = Math.random();
  let cumulatief = 0;
  for (let i = 0; i < top.length; i++) {
    cumulatief += gewichten[i];
    if (r < cumulatief) return top[i];
  }

  return top[0];
}

/**
 * AI beslist welke zet te maken.
 */
export function beslisAIZet(
  speler: Speler,
  stap: 'stap1' | 'stap2',
  dobbelstenen: Dobbelsteen[],
  vergrendeldeRijen: RijId[],
  variant: VariantConfig
): Zet | null {
  const legaleZetten = vindLegaleZetten(speler, stap, dobbelstenen, vergrendeldeRijen, variant);
  if (legaleZetten.length === 0) return null;

  const evaluaties = legaleZetten.map((z) => evalueerZetMetReden(speler, z, variant));

  // Stap1 (niet-actieve speler): wees selectiever (geen strafpuntrisico)
  // Bron: alleen kruisen als het echt voordelig is
  if (stap === 'stap1') {
    // Bij 3+ strafpunten: accepteer ELKE stap1-zet (preventief, vermijd stap2-dwang)
    if (speler.strafpunten >= 3) {
      return kiesAIZet(evaluaties);
    }
    const drempel = 30; // Hogere drempel voor stap1
    const goede = evaluaties.filter((e) => e.score >= drempel);
    return kiesAIZet(goede.length > 0 ? goede : []);
  }

  // Bij 3+ strafpunten: accepteer ELKE zet, anders is het game over
  if (speler.strafpunten >= 3) {
    return kiesAIZet(evaluaties);
  }

  return kiesAIZet(evaluaties);
}
