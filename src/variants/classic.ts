import type { VariantConfig } from '../types';

function maakCellen(nummers: number[], kleur: string) {
  return nummers.map((n) => ({ waarde: n, kleur }));
}

export const classicVariant: VariantConfig = {
  id: 'classic',
  naam: 'Qwixx Classic',
  beschrijving: 'Het originele spel met 4 kleurrijen van 2 tot 12.',
  rijen: [
    {
      id: 'rood', label: 'Rood', primairKleur: 'rood',
      cellen: maakCellen([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 'rood'),
      richting: 'oplopend', dobbelsteenKleuren: ['rood'],
      vergrendelbaar: true, kruisjesVoorSlot: 5,
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
  scoreTabel: [0, 1, 3, 6, 10, 15, 21, 28, 36, 45, 55, 66, 78],
  strafpuntenPerStuk: 5,
  maxStrafpunten: 4,
  vergrendeldeRijenVoorEinde: 2,
  kruisjesPerCel: 1,
  bonussen: [],
};
