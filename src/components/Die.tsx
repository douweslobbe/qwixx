import { getKleurStijl } from '../constants';
import type { Dobbelsteen } from '../types';

interface Props {
  dobbelsteen: Dobbelsteen;
  rolling: boolean;
}

const dotPositions: Record<number, [number, number][]> = {
  1: [[1, 1]],
  2: [[0, 2], [2, 0]],
  3: [[0, 2], [1, 1], [2, 0]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
  7: [[0, 0], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 2]],
  8: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 2], [2, 0], [2, 1], [2, 2]],
};

export function Die({ dobbelsteen, rolling }: Props) {
  if (!dobbelsteen.actief) {
    return (
      <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-xl bg-gray-800 border-2 border-gray-700 opacity-30" />
    );
  }

  const isWit = dobbelsteen.kleur === 'wit1' || dobbelsteen.kleur === 'wit2';
  const stijl = !isWit ? getKleurStijl(dobbelsteen.kleur) : null;
  const bgClass = isWit ? 'bg-white border-gray-200' : stijl!.die;
  const dotClass = isWit ? 'bg-gray-800' : 'bg-white';
  const dieClass = isWit ? 'die-3d-white' : 'die-3d';

  const dots = dotPositions[dobbelsteen.waarde] ?? [];

  return (
    <div className={`w-13 h-13 sm:w-15 sm:h-15 rounded-xl border-2 ${bgClass} ${dieClass} flex items-center justify-center ${rolling ? 'dice-rolling' : ''}`}>
      <div className="grid grid-cols-3 grid-rows-3 gap-0.5 w-8 h-8 sm:w-10 sm:h-10">
        {[0, 1, 2].map((row) =>
          [0, 1, 2].map((col) => {
            const hasDot = dots.some(([r, c]) => r === row && c === col);
            return (
              <div key={`${row}-${col}`} className="flex items-center justify-center">
                {hasDot && <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${dotClass} shadow-sm`} />}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
