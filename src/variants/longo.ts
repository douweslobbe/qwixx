import type { VariantConfig } from '../types';

function maakCellen(nummers: number[], kleur: string) {
  return nummers.map((n) => ({ waarde: n, kleur }));
}

// Longo: 8-zijdige dobbelstenen, rijen van 2-16 (15 cellen), 6 kruisjes om te sluiten
export const longoVariant: VariantConfig = {
  id: 'longo',
  naam: 'Qwixx Longo',
  beschrijving: '8-zijdige dobbelstenen, langere rijen (2-16), 6 kruisjes nodig om te sluiten.',
  rijen: [
    {
      id: 'rood', label: 'Rood', primairKleur: 'rood',
      cellen: maakCellen([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], 'rood'),
      richting: 'oplopend', dobbelsteenKleuren: ['rood'],
      vergrendelbaar: true, kruisjesVoorSlot: 6,
    },
    {
      id: 'geel', label: 'Geel', primairKleur: 'geel',
      cellen: maakCellen([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], 'geel'),
      richting: 'oplopend', dobbelsteenKleuren: ['geel'],
      vergrendelbaar: true, kruisjesVoorSlot: 6,
    },
    {
      id: 'groen', label: 'Groen', primairKleur: 'groen',
      cellen: maakCellen([16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2], 'groen'),
      richting: 'aflopend', dobbelsteenKleuren: ['groen'],
      vergrendelbaar: true, kruisjesVoorSlot: 6,
    },
    {
      id: 'blauw', label: 'Blauw', primairKleur: 'blauw',
      cellen: maakCellen([16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2], 'blauw'),
      richting: 'aflopend', dobbelsteenKleuren: ['blauw'],
      vergrendelbaar: true, kruisjesVoorSlot: 6,
    },
  ],
  dobbelstenen: [
    { kleur: 'wit1', zijden: 8, label: 'Wit 1' },
    { kleur: 'wit2', zijden: 8, label: 'Wit 2' },
    { kleur: 'rood', zijden: 8, label: 'Rood' },
    { kleur: 'geel', zijden: 8, label: 'Geel' },
    { kleur: 'groen', zijden: 8, label: 'Groen' },
    { kleur: 'blauw', zijden: 8, label: 'Blauw' },
  ],
  scoreTabel: [0, 1, 3, 6, 10, 15, 21, 28, 36, 45, 55, 66, 78, 91, 105, 120, 136],
  strafpuntenPerStuk: 5,
  maxStrafpunten: 4,
  vergrendeldeRijenVoorEinde: 2,
  kruisjesPerCel: 1,
  bonussen: [],
};
