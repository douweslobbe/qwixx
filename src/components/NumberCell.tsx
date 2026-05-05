import { getKleurStijl } from '../constants';

interface Props {
  nummer: number;
  kleur: string;
  aangekruist: boolean;
  dubbelKruis?: boolean;
  isStapVeld?: boolean;
  isBonusCel?: boolean;
  isLaatsteZet?: boolean;
  klikbaar: boolean;
  voorbij: boolean;
  onClick?: () => void;
}

export function NumberCell({ nummer, kleur, aangekruist, dubbelKruis, isStapVeld, isBonusCel, isLaatsteZet, klikbaar, voorbij, onClick }: Props) {
  const stijl = getKleurStijl(kleur);
  const stapRing = isStapVeld ? 'ring-2 ring-black/70' : '';
  const bonusDot = isBonusCel ? 'ring-2 ring-yellow-300/80' : '';
  const laatsteZetRing = isLaatsteZet ? 'ring-2 ring-cyan-400 animate-pulse' : '';
  const extraRing = laatsteZetRing || stapRing || bonusDot;

  if (aangekruist) {
    return (
      <div className={`${stijl.crossed} ${stijl.text} w-9 h-9 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center font-bold text-lg sm:text-xl select-none relative ${extraRing} cell-gradient`}>
        <span className="opacity-30 text-sm">{nummer}</span>
        <span className="absolute inset-0 flex items-center justify-center text-xl sm:text-2xl font-black drop-shadow-sm">
          {dubbelKruis ? '✕✕' : '✕'}
        </span>
      </div>
    );
  }

  if (klikbaar) {
    return (
      <button
        onClick={onClick}
        className={`${stijl.bgLight} ${stijl.text} w-9 h-9 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center font-bold text-lg sm:text-xl cell-clickable scale-105 hover:scale-115 transition-transform select-none ring-2 ring-white shadow-lg ${extraRing} cell-gradient`}
      >
        {nummer}
      </button>
    );
  }

  return (
    <div className={`${stijl.bg} ${stijl.text} w-9 h-9 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center font-bold text-lg sm:text-xl select-none ${voorbij ? 'opacity-40' : 'opacity-85'} ${extraRing} cell-gradient`}>
      {nummer}
    </div>
  );
}
