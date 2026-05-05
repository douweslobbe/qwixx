import type { VariantConfig, CelConfig } from '../types';

// Mixx A: Elke rij heeft een eigen gescramblede volgorde en gemengde kleuren per cel.
// De kleuren per cel bepalen welke dobbelsteen-combinatie geldig is.

const rijA: CelConfig[] = [
  { waarde: 9, kleur: 'geel' }, { waarde: 3, kleur: 'rood' }, { waarde: 6, kleur: 'groen' },
  { waarde: 11, kleur: 'blauw' }, { waarde: 4, kleur: 'rood' }, { waarde: 8, kleur: 'geel' },
  { waarde: 2, kleur: 'groen' }, { waarde: 10, kleur: 'blauw' }, { waarde: 5, kleur: 'rood' },
  { waarde: 7, kleur: 'geel' }, { waarde: 12, kleur: 'groen' },
];

const rijB: CelConfig[] = [
  { waarde: 4, kleur: 'blauw' }, { waarde: 10, kleur: 'groen' }, { waarde: 7, kleur: 'rood' },
  { waarde: 2, kleur: 'geel' }, { waarde: 11, kleur: 'blauw' }, { waarde: 5, kleur: 'groen' },
  { waarde: 9, kleur: 'rood' }, { waarde: 3, kleur: 'geel' }, { waarde: 12, kleur: 'blauw' },
  { waarde: 6, kleur: 'rood' }, { waarde: 8, kleur: 'groen' },
];

const rijC: CelConfig[] = [
  { waarde: 7, kleur: 'groen' }, { waarde: 12, kleur: 'rood' }, { waarde: 5, kleur: 'blauw' },
  { waarde: 8, kleur: 'geel' }, { waarde: 3, kleur: 'groen' }, { waarde: 11, kleur: 'rood' },
  { waarde: 6, kleur: 'blauw' }, { waarde: 9, kleur: 'geel' }, { waarde: 2, kleur: 'rood' },
  { waarde: 10, kleur: 'groen' }, { waarde: 4, kleur: 'blauw' },
];

const rijD: CelConfig[] = [
  { waarde: 11, kleur: 'rood' }, { waarde: 6, kleur: 'geel' }, { waarde: 8, kleur: 'blauw' },
  { waarde: 3, kleur: 'groen' }, { waarde: 10, kleur: 'geel' }, { waarde: 2, kleur: 'blauw' },
  { waarde: 7, kleur: 'rood' }, { waarde: 12, kleur: 'geel' }, { waarde: 4, kleur: 'groen' },
  { waarde: 9, kleur: 'blauw' }, { waarde: 5, kleur: 'rood' },
];

export const mixxAVariant: VariantConfig = {
  id: 'mixx-a',
  naam: 'Qwixx Mixx A',
  beschrijving: 'Gescramblede kleuren per vakje. Elke cel heeft een eigen kleur!',
  rijen: [
    {
      id: 'rij-a', label: 'Rij A', primairKleur: 'rood',
      cellen: rijA,
      richting: 'gemengd', dobbelsteenKleuren: ['rood', 'geel', 'groen', 'blauw'],
      vergrendelbaar: true, kruisjesVoorSlot: 5,
    },
    {
      id: 'rij-b', label: 'Rij B', primairKleur: 'geel',
      cellen: rijB,
      richting: 'gemengd', dobbelsteenKleuren: ['rood', 'geel', 'groen', 'blauw'],
      vergrendelbaar: true, kruisjesVoorSlot: 5,
    },
    {
      id: 'rij-c', label: 'Rij C', primairKleur: 'groen',
      cellen: rijC,
      richting: 'gemengd', dobbelsteenKleuren: ['rood', 'geel', 'groen', 'blauw'],
      vergrendelbaar: true, kruisjesVoorSlot: 5,
    },
    {
      id: 'rij-d', label: 'Rij D', primairKleur: 'blauw',
      cellen: rijD,
      richting: 'gemengd', dobbelsteenKleuren: ['rood', 'geel', 'groen', 'blauw'],
      vergrendelbaar: true, kruisjesVoorSlot: 5,
    },
  ],
  dobbelstenen: [
    { kleur: 'wit1', zijden: 6, label: 'Wit 1' },
    { kleur: 'wit2', zijden: 6, label: 'Wit 2' },
    { kleur: 'rood', zijden: 6, label: 'Rood' },
    { kleur: 'geel', zijden: 6, label: 'Geel' },
    { kleur: 'groen', zijden: 6, label: 'Groen' },
    { kleur: 'blauw', zijden: 6, label: 'Blauw' },
  ],
  scoreTabel: [0, 1, 3, 6, 10, 15, 21, 28, 36, 45, 55, 66, 78],
  strafpuntenPerStuk: 5,
  maxStrafpunten: 4,
  vergrendeldeRijenVoorEinde: 2,
  kruisjesPerCel: 1,
  bonussen: [],
};
