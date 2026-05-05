import type { Dobbelsteen } from '../types';
import { Die } from './Die';

interface Props {
  dobbelstenen: Dobbelsteen[];
  rolling: boolean;
  witSom: number | null;
}

export function DiceArea({ dobbelstenen, rolling, witSom }: Props) {
  const witte = dobbelstenen.filter((d) => d.kleur === 'wit1' || d.kleur === 'wit2');
  const gekleurde = dobbelstenen.filter((d) => d.kleur !== 'wit1' && d.kleur !== 'wit2');

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-3 items-center flex-wrap justify-center">
        <div className="flex gap-2.5">
          {witte.map((d) => (
            <Die key={d.kleur} dobbelsteen={d} rolling={rolling} />
          ))}
        </div>
        {gekleurde.length > 0 && (
          <>
            <div className="w-px h-12 bg-gray-600/50 rounded-full" />
            <div className="flex gap-2.5">
              {gekleurde.map((d) => (
                <Die key={d.kleur} dobbelsteen={d} rolling={rolling} />
              ))}
            </div>
          </>
        )}
      </div>
      {witSom !== null && !rolling && (
        <div className="text-gray-400 text-sm">
          Witte dobbelstenen: <span className="text-white font-bold text-base">{witSom}</span>
        </div>
      )}
    </div>
  );
}
