import type { VariantConfig } from '../types';

function maakCellen(nummers: number[], kleur: string) {
  return nummers.map((n) => ({ waarde: n, kleur }));
}

// Connected Step: Een kronkelende trap van 11 stap-velden door alle 4 rijen.
// Stap-velden worden DUBBEL gescoord: als onderdeel van hun kleurrij EN
// als aparte bonusrij met dezelfde driehoeksscoring.
// Bron: BGG/Thimble Toys - step fields scored twice (color row + separate bonus row).
//
// Layout A (standaard): de trap kronkelt door de rijen.
// Posities per rij (0-indexed): welke cellen zijn stap-velden.
export const connectedStepVariant: VariantConfig = {
  id: 'connected-step',
  naam: 'Qwixx Connected Step',
  beschrijving: 'Stap-velden worden dubbel gescoord: als kleurrij + als aparte bonusrij!',
  rijen: [
    {
      id: 'rood', label: 'Rood', primairKleur: 'rood',
      cellen: maakCellen([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 'rood'),
      richting: 'oplopend', dobbelsteenKleuren: ['rood'],
      vergrendelbaar: true, kruisjesVoorSlot: 5,
      // Stap-velden: celpositie 0 (=2), 1 (=3), 5 (=7)
      stapVelden: [0, 1, 5],
    },
    {
      id: 'geel', label: 'Geel', primairKleur: 'geel',
      cellen: maakCellen([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 'geel'),
      richting: 'oplopend', dobbelsteenKleuren: ['geel'],
      vergrendelbaar: true, kruisjesVoorSlot: 5,
      stapVelden: [2, 4, 6],
    },
    {
      id: 'groen', label: 'Groen', primairKleur: 'groen',
      cellen: maakCellen([12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2], 'groen'),
      richting: 'aflopend', dobbelsteenKleuren: ['groen'],
      vergrendelbaar: true, kruisjesVoorSlot: 5,
      stapVelden: [3, 7, 9],
    },
    {
      id: 'blauw', label: 'Blauw', primairKleur: 'blauw',
      cellen: maakCellen([12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2], 'blauw'),
      richting: 'aflopend', dobbelsteenKleuren: ['blauw'],
      vergrendelbaar: true, kruisjesVoorSlot: 5,
      stapVelden: [8, 10],
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
  bonussen: [
    {
      type: 'stap-bonus',
      beschrijving: 'Aangekruiste stap-velden worden als aparte bonusrij gescoord (driehoeksscoring)',
      params: {},
    },
  ],
};
