import type { BeurtStap } from '../types';

interface Props {
  beurtStap: BeurtStap;
  isActieveSpeler: boolean;
  heeftStap1Gekozen: boolean;
  heeftStap2Gekozen: boolean;
  strafpunten: number;
  maxStrafpunten: number;
  kanTerugNaarStap1: boolean;
  onGooi: () => void;
  onBevestigStap1: () => void;
  onPasStap1: () => void;
  onBevestigStap2: () => void;
  onPasStap2: () => void;
  onTerugNaarStap1: () => void;
  onVolgendeBeurt: () => void;
}

export function GameControls({
  beurtStap,
  isActieveSpeler,
  heeftStap1Gekozen,
  heeftStap2Gekozen,
  strafpunten,
  maxStrafpunten,
  kanTerugNaarStap1,
  onGooi,
  onPasStap1,
  onBevestigStap1,
  onPasStap2,
  onBevestigStap2,
  onTerugNaarStap1,
  onVolgendeBeurt,
}: Props) {
  if (beurtStap === 'gooien') {
    return (
      <div className="flex gap-3 justify-center">
        <button
          onClick={onGooi}
          className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 font-black rounded-xl hover:from-yellow-300 hover:to-amber-400 transition-all text-lg btn-lift"
        >
          🎲 Gooi dobbelstenen
        </button>
      </div>
    );
  }

  if (beurtStap === 'stap1') {
    return (
      <div className="flex flex-col items-center gap-2">
        {isActieveSpeler ? (
          <p className="text-gray-400 text-sm">
            Stap 1: Kies een vakje voor de <span className="text-white font-medium">witte som</span> (alle spelers)
            <span className="text-gray-500"> — daarna volgt stap 2 (wit+kleur, alleen jij)</span>
          </p>
        ) : (
          <p className="text-gray-400 text-sm">
            <span className="text-white font-medium">Witte som</span> — optioneel, geen strafpunt bij passen
          </p>
        )}
        <div className="flex gap-3">
          <button
            onClick={onPasStap1}
            className="px-5 py-2 bg-gray-700 text-gray-300 font-medium rounded-lg hover:bg-gray-600 transition-colors"
          >
            Pas
          </button>
          {heeftStap1Gekozen && (
            <button
              onClick={onBevestigStap1}
              className="px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:from-green-400 hover:to-emerald-400 transition-all shadow-lg shadow-green-500/20"
            >
              ✓ Bevestig
            </button>
          )}
        </div>
      </div>
    );
  }

  if (beurtStap === 'stap2' && isActieveSpeler) {
    const strafRisico = !heeftStap1Gekozen;
    const isLaatsteStraf = strafRisico && strafpunten === maxStrafpunten - 1;
    const strafLabel = strafRisico
      ? isLaatsteStraf
        ? `Pas (−5 strafpunt! ${strafpunten + 1}/${maxStrafpunten} = EINDE SPEL)`
        : `Pas (−5 strafpunt! ${strafpunten + 1}/${maxStrafpunten})`
      : 'Pas';
    return (
      <div className="flex flex-col items-center gap-2">
        <p className="text-gray-400 text-sm">
          Stap 2: Kies een vakje voor <span className="text-white font-medium">wit + kleur</span> (alleen jij)
          {!heeftStap1Gekozen && <span className="text-yellow-400/80"> — pas je beide = strafpunt!</span>}
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          {kanTerugNaarStap1 && (
            <button
              onClick={onTerugNaarStap1}
              className="px-4 py-2 bg-gray-700/60 text-gray-400 font-medium rounded-lg hover:bg-gray-600 transition-colors text-sm border border-gray-600"
            >
              ← Terug naar wit+wit
            </button>
          )}
          <button
            onClick={onPasStap2}
            className={`px-5 py-2 font-medium rounded-lg transition-colors ${
              isLaatsteStraf
                ? 'bg-red-600 text-white hover:bg-red-500 animate-pulse'
                : strafRisico
                  ? 'bg-red-700/70 text-red-200 hover:bg-red-600/70'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {strafLabel}
          </button>
          {heeftStap2Gekozen && (
            <button
              onClick={onBevestigStap2}
              className="px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:from-green-400 hover:to-emerald-400 transition-all shadow-lg shadow-green-500/20"
            >
              ✓ Bevestig
            </button>
          )}
        </div>
      </div>
    );
  }

  if (beurtStap === 'stap2' && !isActieveSpeler) {
    return (
      <div className="flex flex-col items-center gap-2">
        <p className="text-gray-400 text-sm">Wachten... de actieve speler kiest een vakje.</p>
        {/* In advies-simulatie: toon knop om naar klaar te gaan */}
        <button
          onClick={onPasStap2}
          className="px-5 py-2 bg-gray-700 text-gray-400 font-medium rounded-lg hover:bg-gray-600 transition-colors text-sm"
        >
          Klaar met beurt →
        </button>
      </div>
    );
  }

  if (beurtStap === 'klaar') {
    return (
      <div className="flex gap-3 justify-center">
        <button
          onClick={onVolgendeBeurt}
          className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 font-black rounded-xl hover:from-yellow-300 hover:to-amber-400 transition-all btn-lift"
        >
          Volgende beurt →
        </button>
      </div>
    );
  }

  return null;
}
