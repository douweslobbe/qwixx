import type { VariantConfig } from '../types';

function maakCellen(nummers: number[], kleur: string) {
  return nummers.map((n) => ({ waarde: n, kleur }));
}

// Big Points: 4 standaard kleurrijen + 2 bonusrijen (rood-geel en groen-blauw).
// Bonusrijen kruisjes tellen mee voor BEIDE aangrenzende kleurrijen.
// Bron: NSV officiële regels - bonus row crosses count toward both adjacent color rows.
export const bigPointsVariant: VariantConfig = {
  id: 'big-points',
  naam: 'Qwixx Big Points',
  beschrijving: '6 rijen: bonusrij-kruisjes tellen mee voor beide aangrenzende kleurrijen!',
  rijen: [
    {
      id: 'rood', label: 'Rood', primairKleur: 'rood',
      cellen: maakCellen([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 'rood'),
      richting: 'oplopend', dobbelsteenKleuren: ['rood'],
      vergrendelbaar: true, kruisjesVoorSlot: 5,
    },
    {
      id: 'bonus-rg', label: 'Bonus R/G', primairKleur: 'rood-geel',
      cellen: maakCellen([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 'rood-geel'),
      richting: 'oplopend', dobbelsteenKleuren: ['rood', 'geel'],
      vergrendelbaar: false, kruisjesVoorSlot: 99,
      // Kruisjes in deze rij tellen mee voor rood én geel
      teltMeeVoor: ['rood', 'geel'],
    },
    {
      id: 'geel', label: 'Geel', primairKleur: 'geel',
      cellen: maakCellen([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 'geel'),
      richting: 'oplopend', dobbelsteenKleuren: ['geel'],
      vergrendelbaar: true, kruisjesVoorSlot: 5,
    },
    {
      id: 'groen', label: 'Groen', primairKleur: 'groen',
      cellen: maakCellen([12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2], 'groen'),
      richting: 'aflopend', dobbelsteenKleuren: ['groen'],
      vergrendelbaar: true, kruisjesVoorSlot: 5,
    },
    {
      id: 'bonus-gb', label: 'Bonus G/B', primairKleur: 'groen-blauw',
      cellen: maakCellen([12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2], 'groen-blauw'),
      richting: 'aflopend', dobbelsteenKleuren: ['groen', 'blauw'],
      vergrendelbaar: false, kruisjesVoorSlot: 99,
      // Kruisjes in deze rij tellen mee voor groen én blauw
      teltMeeVoor: ['groen', 'blauw'],
    },
    {
      id: 'blauw', label: 'Blauw', primairKleur: 'blauw',
      cellen: maakCellen([12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2], 'blauw'),
      richting: 'aflopend', dobbelsteenKleuren: ['blauw'],
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
  // Uitgebreid: max 120 punten per kleurrij (11 eigen + 11 bonus = 22 kruisjes)
  scoreTabel: [0, 1, 3, 6, 10, 15, 21, 28, 36, 45, 55, 66, 78, 91, 105, 120, 136, 153, 171, 190, 210, 231, 253],
  strafpuntenPerStuk: 5,
  maxStrafpunten: 4,
  vergrendeldeRijenVoorEinde: 2,
  kruisjesPerCel: 1,
  bonussen: [],
};
