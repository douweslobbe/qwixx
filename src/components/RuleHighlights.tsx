import { useState } from 'react';
import type { VariantConfig } from '../types';

interface Props {
  variant: VariantConfig;
}

export function RuleHighlights({ variant }: Props) {
  const [open, setOpen] = useState(false);

  const regels: string[] = [];

  // Basisregels
  regels.push(`Rij afsluiten: kruis ${variant.rijen[0]?.kruisjesVoorSlot ?? 5}+ vakjes + laatste getal af. Geeft bonus (+1 kruisje in score).`);
  regels.push(`Links-naar-rechts: je mag nummers overslaan, maar nooit terug.`);
  regels.push(`Strafpunten: ${variant.maxStrafpunten}x = einde spel. Elke straf = ${variant.strafpuntenPerStuk} punten.`);
  regels.push(`Einde: ${variant.vergrendeldeRijenVoorEinde} afgesloten rijen of ${variant.maxStrafpunten} strafpunten.`);

  // Scoring tabel
  const scoreTabel = variant.scoreTabel;
  const scoreVoorbeelden = [1, 2, 3, 5, 8, 11].filter(i => i < scoreTabel.length);
  regels.push(`Scoring: ${scoreVoorbeelden.map(i => `${i}x=${scoreTabel[i]}`).join(', ')} punten.`);

  // Variant-specifieke regels
  for (const bonus of variant.bonussen) {
    if (bonus.beschrijving) {
      regels.push(bonus.beschrijving);
    }
  }

  if (variant.id === 'longo') {
    regels.push('Geluksgetallen: bij een witte som die matcht, mag je een extra vakje kruisen in je minst gevorderde rij.');
  }

  if (variant.rijen.some(r => r.richting === 'gemengd')) {
    regels.push('Gemengde rijen: per cel geldt de kleur van die cel voor de wit+kleur combinatie.');
  }

  if (variant.kruisjesPerCel > 1) {
    regels.push(`Dubbel: elk vakje mag ${variant.kruisjesPerCel}x worden aangekruist.`);
  }

  return (
    <div className="bg-gray-800/30 rounded-lg border border-gray-700/50">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs text-gray-400 hover:text-gray-300 transition-colors"
      >
        <span className="font-medium">Spelregels {variant.naam}</span>
        <span>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <ul className="px-3 pb-2 space-y-1">
          {regels.map((regel, i) => (
            <li key={i} className="text-xs text-gray-500 leading-relaxed">
              • {regel}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
