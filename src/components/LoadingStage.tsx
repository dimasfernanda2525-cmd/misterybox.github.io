import { getLoadingMessage } from '../lib/surpriseFlow';

interface LoadingStageProps {
  progress: number;
}

export function LoadingStage({ progress }: LoadingStageProps) {
  const statusText = getLoadingMessage(progress);

  return (
    <div
      data-testid="loading-stage"
      className="flex flex-col items-center justify-center py-8 px-4 text-center animate-pop-in"
    >
      {/* Intensely shaking gift box right before the jumpscare */}
      <div className="relative mb-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full bg-amber-400/35 blur-2xl scale-125"
        />
        <div className="animate-box-shake relative">
          <svg
            viewBox="0 0 220 220"
            className="h-44 w-44 sm:h-52 sm:w-52 drop-shadow-[0_18px_28px_rgba(225,29,72,0.28)]"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="loadBoxGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#F43F5E" />
                <stop offset="100%" stopColor="#BE123C" />
              </linearGradient>
              <linearGradient id="loadRibbon" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FDE68A" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
            </defs>
            <rect x="34" y="88" width="152" height="110" rx="16" fill="url(#loadBoxGrad)" />
            <rect x="96" y="88" width="28" height="110" fill="url(#loadRibbon)" />
            {/* Lid slightly popping open */}
            <g transform="translate(0, -10) rotate(-4 110 75)">
              <rect x="24" y="60" width="172" height="34" rx="12" fill="#E11D48" />
              <rect x="94" y="60" width="32" height="34" fill="url(#loadRibbon)" />
              <circle cx="110" cy="56" r="12" fill="#F59E0B" />
            </g>
          </svg>
        </div>
      </div>

      <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
        Sedang Membuka Hadiah...
      </h2>
      <p className="mt-2 text-base font-medium text-stone-600" aria-live="polite">
        {statusText}
      </p>

      {/* Progress Bar */}
      <div className="mt-6 w-full max-w-sm">
        <div className="flex items-center justify-between text-xs font-semibold text-stone-600 mb-2">
          <span>Membuka Segel Hadiah</span>
          <span className="font-mono tabular-nums text-rose-700">{progress}%</span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-3.5 w-full overflow-hidden rounded-full bg-stone-200 border border-stone-300/70"
        >
          <div
            className="h-full bg-gradient-to-r from-rose-600 via-amber-500 to-rose-500 transition-[width] duration-75 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
