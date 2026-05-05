// === Basis identifiers ===
export type RijId = string;
export type KleurId = string;
export type DobbelsteenKleur = string;
export type SpelModus = 'advies' | 'solo';
export type DobbelsteenModus = 'echt' | 'digitaal';
export type BeurtStap = 'gooien' | 'stap1' | 'stap2' | 'klaar';
export type SpelStatus = 'setup' | 'actief' | 'afgelopen';

export type VariantId =
  | 'classic'
  | 'mixx-a'
  | 'mixx-b'
  | 'big-points'
  | 'bonus'
  | 'connected-step'
  | 'connected-chains'
  | 'double'
  | 'longo';

// === Variant configuratie ===
export interface CelConfig {
  waarde: number;
  kleur: KleurId;
}

export interface RijConfig {
  id: RijId;
  label: string;
  primairKleur: KleurId;
  cellen: CelConfig[];
  richting: 'oplopend' | 'aflopend' | 'gemengd';
  dobbelsteenKleuren: DobbelsteenKleur[];
  vergrendelbaar: boolean;
  kruisjesVoorSlot: number;
  // Big Points: bonusrij telt mee voor aangrenzende kleurrijen
  teltMeeVoor?: RijId[];
  // Connected Step: welke celposities zijn stap-velden (0-indexed)
  stapVelden?: number[];
}

export interface DobbelsteenConfig {
  kleur: DobbelsteenKleur;
  zijden: number;
  label: string;
}

export interface BonusConfig {
  type: 'bonus-rij' | 'bonus-cel' | 'stap-bonus' | 'ketting';
  beschrijving: string;
  params: Record<string, unknown>;
}

export interface VariantConfig {
  id: VariantId;
  naam: string;
  beschrijving: string;
  rijen: RijConfig[];
  dobbelstenen: DobbelsteenConfig[];
  scoreTabel: number[];
  strafpuntenPerStuk: number;
  maxStrafpunten: number;
  vergrendeldeRijenVoorEinde: number;
  kruisjesPerCel: number;
  bonussen: BonusConfig[];
}

export interface KleurStijl {
  bg: string;
  bgLight: string;
  text: string;
  border: string;
  crossed: string;
  die: string;
}

// === Spel-state types ===
export interface Dobbelsteen {
  kleur: DobbelsteenKleur;
  waarde: number;
  actief: boolean;
  zijden: number;
}

export interface CelStatus {
  kruisjes: number;
  maxKruisjes: number;
}

export interface RijStatus {
  rijId: RijId;
  cellen: CelStatus[];
  vergrendeld: boolean;
}

export interface Speler {
  id: string;
  naam: string;
  isAI: boolean;
  rijen: Record<RijId, RijStatus>;
  strafpunten: number;
  // Longo: lucky numbers per speler (2 random getallen)
  geluksGetallen?: number[];
}

export interface Zet {
  rijId: RijId;
  celIndex: number;
  waarde: number;
  stap: 'stap1' | 'stap2';
}

export interface ZetEvaluatie extends Zet {
  score: number;
  reden: string;
}

export interface SpelState {
  status: SpelStatus;
  modus: SpelModus;
  dobbelsteenModus: DobbelsteenModus;
  variant: VariantConfig;
  spelers: Speler[];
  actieveSpelerIndex: number;
  dobbelstenen: Dobbelsteen[];
  beurtStap: BeurtStap;
  vergrendeldeRijen: RijId[];
  stap1Gekozen: Zet | null;
  stap2Gekozen: Zet | null;
  // AI zet feedback: welke zetten AI-spelers in stap1 maakten
  laatsteAIZetten: Record<string, Zet>;
  // AI redeneringen: uitleg van AI zetten per stap
  aiRedeneringen: Record<string, { stap1?: ZetEvaluatie | null; stap2?: ZetEvaluatie | null }>;
  // Snapshot net voor stap2: voor "terug naar stap1"-functie
  staatVoorStap2: SpelState | null;
  // Undo: vorige state
  vorigeState: SpelState | null;
}

export type SpelActie =
  | { type: 'START_SPEL'; modus: SpelModus; aantalAI: number; variantId: VariantId; dobbelsteenModus: DobbelsteenModus }
  | { type: 'GOOI_DOBBELSTENEN' }
  | { type: 'STEL_DOBBELSTENEN_IN'; waarden: Record<string, number> }
  | { type: 'KIES_ZET'; zet: Zet }
  | { type: 'PAS_STAP1' }
  | { type: 'PAS_STAP2' }
  | { type: 'AI_STAP1_KLAAR'; zetten: Record<string, Zet | null>; evaluaties?: Record<string, ZetEvaluatie | null> }
  | { type: 'AI_STAP2_KLAAR'; spelerId: string; zet: Zet | null; evaluatie: ZetEvaluatie | null }
  | { type: 'VOLGENDE_BEURT' }
  | { type: 'TERUG_NAAR_STAP1' }
  | { type: 'RESET_SPEL' }
  | { type: 'UNDO' };

// === Helpers ===
export function isCelAangekruist(cel: CelStatus): boolean {
  return cel.kruisjes > 0;
}

export function isCelVol(cel: CelStatus): boolean {
  return cel.kruisjes >= cel.maxKruisjes;
}

export function maakCelStatus(maxKruisjes: number): CelStatus {
  return { kruisjes: 0, maxKruisjes };
}
