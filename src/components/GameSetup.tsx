import { useState } from 'react';
import type { SpelModus, VariantId, DobbelsteenModus } from '../types';
import { VARIANT_LIJST } from '../variants';
import { getKleurStijl } from '../constants';

interface Props {
  onStart: (modus: SpelModus, aantalAI: number, variantId: VariantId, dobbelsteenModus: DobbelsteenModus) => void;
}

export function GameSetup({ onStart }: Props) {
  const [modus, setModus] = useState<SpelModus>('solo');
  const [aantalAI, setAantalAI] = useState(1);
  const [variantId, setVariantId] = useState<VariantId>('classic');
  const [dobbelsteenModus, setDobbelsteenModus] = useState<DobbelsteenModus>('echt');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 relative overflow-hidden">
      {/* Decorative floating dice */}
      <div className="absolute top-[12%] left-[8%] float-dice opacity-20 text-4xl select-none pointer-events-none" aria-hidden="true">🎲</div>
      <div className="absolute top-[20%] right-[10%] float-dice-alt opacity-15 text-3xl select-none pointer-events-none" aria-hidden="true">🎲</div>
      <div className="absolute bottom-[15%] left-[12%] float-dice-alt opacity-10 text-5xl select-none pointer-events-none" aria-hidden="true">🎲</div>
      <div className="absolute bottom-[25%] right-[8%] float-dice opacity-15 text-3xl select-none pointer-events-none" aria-hidden="true">🎲</div>

      <div className="setup-card rounded-2xl p-8 max-w-md w-full border border-gray-700/50 relative z-10">
        {/* Logo area */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-gradient mb-1 tracking-tight" style={{ fontFamily: "'Nunito', sans-serif" }}>QWIXX</h1>
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/30" />
            <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-lg shadow-yellow-400/30" />
            <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/30" />
            <div className="w-3 h-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/30" />
          </div>
          <p className="text-gray-400 text-sm">Het snelle dobbelspel</p>
        </div>

        <div className="space-y-6">
          {/* Variant selectie */}
          <div>
            <label className="text-white font-bold text-sm uppercase tracking-wide block mb-3">Variant</label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
              {VARIANT_LIJST.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVariantId(v.id)}
                  className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                    variantId === v.id
                      ? 'border-yellow-400 bg-yellow-400/10 shadow-lg shadow-yellow-400/5'
                      : 'border-gray-600/50 hover:border-gray-500 bg-gray-800/30'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-bold ${variantId === v.id ? 'text-yellow-400' : 'text-white'}`}>
                      {v.naam}
                    </span>
                    <div className="flex gap-0.5">
                      {v.rijen.slice(0, 4).map((rij) => {
                        const stijl = getKleurStijl(rij.primairKleur);
                        return <div key={rij.id} className={`w-2 h-2 rounded-full ${stijl.bg}`} />;
                      })}
                    </div>
                  </div>
                  <div className="text-gray-400 text-xs">{v.beschrijving}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Spelmodus */}
          <div>
            <label className="text-white font-bold text-sm uppercase tracking-wide block mb-3">Spelmodus</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setModus('solo')}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  modus === 'solo'
                    ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400 shadow-lg shadow-yellow-400/5'
                    : 'border-gray-600/50 text-gray-400 hover:border-gray-500 bg-gray-800/30'
                }`}
              >
                <div className="font-bold">Solo</div>
                <div className="text-xs mt-1 opacity-70">Speel tegen de computer</div>
              </button>
              <button
                onClick={() => setModus('advies')}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  modus === 'advies'
                    ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400 shadow-lg shadow-yellow-400/5'
                    : 'border-gray-600/50 text-gray-400 hover:border-gray-500 bg-gray-800/30'
                }`}
              >
                <div className="font-bold">Advies</div>
                <div className="text-xs mt-1 opacity-70">Krijg tips bij je worp</div>
              </button>
            </div>
          </div>

          {modus === 'solo' && (
            <div>
              <label className="text-white font-bold text-sm uppercase tracking-wide block mb-3">Tegenstanders</label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((n) => (
                  <button
                    key={n}
                    onClick={() => setAantalAI(n)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      aantalAI === n
                        ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400 shadow-lg shadow-yellow-400/5'
                        : 'border-gray-600/50 text-gray-400 hover:border-gray-500 bg-gray-800/30'
                    }`}
                  >
                    <div className="font-bold text-lg">{n}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dobbelstenen keuze */}
          <div>
            <label className="text-white font-bold text-sm uppercase tracking-wide block mb-3">Dobbelstenen</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setDobbelsteenModus('echt')}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  dobbelsteenModus === 'echt'
                    ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400 shadow-lg shadow-yellow-400/5'
                    : 'border-gray-600/50 text-gray-400 hover:border-gray-500 bg-gray-800/30'
                }`}
              >
                <div className="font-bold">Echte dobbelstenen</div>
                <div className="text-xs mt-1 opacity-70">Gooi zelf en voer in</div>
              </button>
              <button
                onClick={() => setDobbelsteenModus('digitaal')}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  dobbelsteenModus === 'digitaal'
                    ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400 shadow-lg shadow-yellow-400/5'
                    : 'border-gray-600/50 text-gray-400 hover:border-gray-500 bg-gray-800/30'
                }`}
              >
                <div className="font-bold">In de app</div>
                <div className="text-xs mt-1 opacity-70">De app gooit voor je</div>
              </button>
            </div>
          </div>

          <button
            onClick={() => onStart(modus, modus === 'solo' ? aantalAI : 0, variantId, dobbelsteenModus)}
            className="w-full py-3.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 font-black rounded-xl hover:from-yellow-300 hover:to-amber-400 transition-all text-lg btn-lift tracking-wide"
          >
            Start spel
          </button>
        </div>
      </div>
    </div>
  );
}
