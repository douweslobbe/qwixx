interface Props {
  strafpunten: number;
  maxStrafpunten: number;
}

export function PenaltyTrack({ strafpunten, maxStrafpunten }: Props) {
  const bijna = strafpunten === maxStrafpunten - 1;
  return (
    <div className="flex items-center gap-2 mt-2">
      <span className={`text-sm font-medium ${bijna ? 'text-red-400' : 'text-gray-400'}`}>
        Strafpunten:
      </span>
      <div className="flex gap-1">
        {Array.from({ length: maxStrafpunten }, (_, i) => (
          <div
            key={i}
            className={`w-8 h-8 rounded border-2 flex items-center justify-center font-bold text-sm
              ${i < strafpunten
                ? 'bg-gray-700 border-gray-500 text-red-400'
                : i === strafpunten && bijna
                  ? 'bg-red-900/30 border-red-500/50 text-red-500/50 animate-pulse'
                  : 'bg-gray-800/50 border-gray-600 text-gray-600'
              }`}
          >
            {i < strafpunten ? '−5' : ''}
          </div>
        ))}
      </div>
      {bijna && (
        <span className="text-red-400 text-xs font-medium animate-pulse">Nog 1 = einde!</span>
      )}
    </div>
  );
}
