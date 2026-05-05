import { getKleurStijl } from '../constants';

interface Props {
  kleur: string;
  vergrendeld: boolean;
  klikbaar: boolean;
  onClick?: () => void;
}

export function LockCell({ kleur, vergrendeld, klikbaar, onClick }: Props) {
  const stijl = getKleurStijl(kleur);

  if (vergrendeld) {
    return (
      <div className={`${stijl.crossed} ${stijl.text} w-9 h-9 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center text-xl select-none`}>
        🔒
      </div>
    );
  }

  if (klikbaar) {
    return (
      <button
        onClick={onClick}
        className={`${stijl.bgLight} ${stijl.text} w-9 h-9 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center text-xl cell-clickable scale-105 hover:scale-115 transition-transform select-none ring-2 ring-white shadow-lg`}
      >
        🔒
      </button>
    );
  }

  return (
    <div className={`${stijl.bg} ${stijl.text} w-9 h-9 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center text-xl opacity-30 select-none`}>
      🔒
    </div>
  );
}
