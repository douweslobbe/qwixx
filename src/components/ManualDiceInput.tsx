import { useState } from 'react';
import type { DobbelsteenConfig } from '../types';
import { getKleurStijl } from '../constants';

interface Props {
  dobbelsteenConfigs: DobbelsteenConfig[];
  onBevestig: (waarden: Record<string, number>) => void;
}

export function ManualDiceInput({ dobbelsteenConfigs, onBevestig }: Props) {
  const [waarden, setWaarden] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (const config of dobbelsteenConfigs) {
      init[config.kleur] = 1;
    }
    return init;
  });

  function wijzig(kleur: string, delta: number) {
    setWaarden((prev) => {
      const config = dobbelsteenConfigs.find((c) => c.kleur === kleur);
      const max = config?.zijden ?? 6;
      const nieuw = prev[kleur] + delta;
      if (nieuw < 1 || nieuw > max) return prev;
      return { ...prev, [kleur]: nieuw };
    });
  }

  function setDirect(kleur: string, waarde: string) {
    const config = dobbelsteenConfigs.find((c) => c.kleur === kleur);
    const max = config?.zijden ?? 6;
    const num = parseInt(waarde, 10);
    if (isNaN(num)) return;
    if (num < 1 || num > max) return;
    setWaarden((prev) => ({ ...prev, [kleur]: num }));
  }

  function getDieStyle(kleur: string): string {
    if (kleur === 'wit1' || kleur === 'wit2') {
      return 'bg-white text-gray-800 border-gray-300';
    }
    const stijl = getKleurStijl(kleur);
    return `${stijl.bg} ${stijl.text} ${stijl.border}`;
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-gray-400 text-sm">Voer de dobbelsteenwaarden in:</p>
      <div className="flex gap-2 flex-wrap justify-center">
        {dobbelsteenConfigs.map((config) => (
          <div key={config.kleur} className="flex flex-col items-center gap-1">
            <span className="text-gray-500 text-xs">{config.label}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => wijzig(config.kleur, -1)}
                className="w-6 h-6 rounded bg-gray-700 text-gray-300 text-sm hover:bg-gray-600 flex items-center justify-center"
              >
                -
              </button>
              <input
                type="text"
                inputMode="numeric"
                value={waarden[config.kleur]}
                onChange={(e) => setDirect(config.kleur, e.target.value)}
                onFocus={(e) => e.target.select()}
                className={`w-10 h-10 rounded-lg border-2 ${getDieStyle(config.kleur)} text-center font-bold text-lg outline-none focus:ring-2 focus:ring-yellow-400`}
              />
              <button
                onClick={() => wijzig(config.kleur, 1)}
                className="w-6 h-6 rounded bg-gray-700 text-gray-300 text-sm hover:bg-gray-600 flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => onBevestig(waarden)}
        className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 font-bold rounded-xl hover:from-yellow-300 hover:to-amber-400 transition-all btn-lift"
      >
        Bevestig worp
      </button>
    </div>
  );
}
