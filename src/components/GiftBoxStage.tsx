interface GiftBoxStageProps {
  onOpenBox: () => void;
}

export function GiftBoxStage({ onOpenBox }: GiftBoxStageProps) {
  return (
    <div className="relative flex flex-col items-center justify-center py-4 select-none">
      {/* Subtle festive starburst halo behind gift box */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-72 w-72 sm:h-88 sm:w-88 rounded-full bg-gradient-to-tr from-amber-300/35 via-rose-200/25 to-amber-100/20 blur-2xl -translate-x-1/2 -translate-y-1/2"
      />

      <button
        type="button"
        onClick={onOpenBox}
        data-testid="gift-box-button"
        aria-label="Ketuk kotak hadiah yang melompat untuk membuka hadiah"
        className="group relative flex flex-col items-center justify-center rounded-3xl p-6 sm:p-8 focus:outline-none focus-visible:ring-4 focus-visible:ring-rose-500/40 active:scale-95 transition-transform duration-150 cursor-pointer"
      >
        {/* Bouncing Gift Box */}
        <div className="relative animate-gift-jump">
          <svg
            viewBox="0 0 220 220"
            className="h-48 w-48 sm:h-56 sm:w-56 drop-shadow-[0_18px_28px_rgba(225,29,72,0.22)] transition-transform duration-200 group-hover:scale-105"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="boxBodyGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#F43F5E" />
                <stop offset="100%" stopColor="#BE123C" />
              </linearGradient>
              <linearGradient id="boxLidGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FB7185" />
                <stop offset="100%" stopColor="#E11D48" />
              </linearGradient>
              <linearGradient id="ribbonGold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FDE68A" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
            </defs>

            {/* Box Base */}
            <rect x="34" y="88" width="152" height="110" rx="16" fill="url(#boxBodyGrad)" />
            {/* Box Base Shading */}
            <rect x="34" y="88" width="152" height="18" fill="#881337" opacity="0.22" />
            {/* Vertical Gold Ribbon on Base */}
            <rect x="96" y="88" width="28" height="110" fill="url(#ribbonGold)" />
            <rect x="96" y="88" width="6" height="110" fill="#FEF3C7" opacity="0.45" />

            {/* Gift Lid */}
            <rect x="24" y="60" width="172" height="34" rx="12" fill="url(#boxLidGrad)" />
            {/* Lid Gold Ribbon */}
            <rect x="94" y="60" width="32" height="34" fill="url(#ribbonGold)" />
            <rect x="94" y="60" width="6" height="34" fill="#FEF3C7" opacity="0.45" />

            {/* Ribbon Bow Loops */}
            <path
              d="M110 60 C86 24, 48 26, 56 50 C62 64, 90 62, 110 60 Z"
              fill="url(#ribbonGold)"
              stroke="#B45309"
              strokeWidth="2"
            />
            <path
              d="M110 60 C134 24, 172 26, 164 50 C158 64, 130 62, 110 60 Z"
              fill="url(#ribbonGold)"
              stroke="#B45309"
              strokeWidth="2"
            />
            {/* Bow Center Knot */}
            <circle cx="110" cy="58" r="12" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
            <circle cx="107" cy="54" r="4" fill="#FEF3C7" opacity="0.7" />

            {/* Subtle Star Accents on Box */}
            <path
              d="M62 126 L65 133 L72 136 L65 139 L62 146 L59 139 L52 136 L59 133 Z"
              fill="#FDE68A"
              opacity="0.8"
            />
            <path
              d="M158 148 L160 153 L165 155 L160 157 L158 162 L156 157 L151 155 L156 153 Z"
              fill="#FDE68A"
              opacity="0.75"
            />
          </svg>

          {/* Tap Impact Ripple Rings at top-right lid */}
          <span
            aria-hidden="true"
            className="animate-tap-ripple pointer-events-none absolute right-5 top-8 h-12 w-12 rounded-full border-4 border-amber-400"
          />

          {/* Animated Hand Knocking / Tapping on the Gift Box */}
          <div
            aria-hidden="true"
            className="animate-hand-knock pointer-events-none absolute -right-4 -top-2 sm:-right-6 sm:-top-3 drop-shadow-[0_10px_16px_rgba(28,25,23,0.22)]"
          >
            <svg viewBox="0 0 96 96" className="h-20 w-20 sm:h-24 sm:w-24">
              {/* Cartoon / Vector Tapping Hand */}
              <g transform="rotate(-18 48 48)">
                {/* Cuff / Wrist */}
                <rect x="44" y="56" width="32" height="24" rx="8" fill="#1C1917" />
                <rect x="46" y="56" width="28" height="6" rx="3" fill="#F59E0B" />
                {/* Palm */}
                <path
                  d="M36 42 C36 34, 44 30, 54 30 C64 30, 72 36, 72 46 L72 58 L38 58 Z"
                  fill="#FDBA74"
                  stroke="#9A3412"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                {/* Pointing / Knocking Index Finger */}
                <path
                  d="M38 44 L22 22 C19 18, 25 12, 30 16 L46 34"
                  fill="#FDBA74"
                  stroke="#9A3412"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Curled Knuckles */}
                <circle cx="52" cy="40" r="5" fill="#FB923C" stroke="#9A3412" strokeWidth="2" />
                <circle cx="60" cy="42" r="5" fill="#FB923C" stroke="#9A3412" strokeWidth="2" />
                <circle cx="67" cy="46" r="4.5" fill="#FB923C" stroke="#9A3412" strokeWidth="2" />
              </g>
            </svg>
          </div>
        </div>

        {/* Ground Shadow synced with jump */}
        <div
          aria-hidden="true"
          className="animate-gift-shadow mt-1 h-4 w-36 rounded-full bg-stone-900/25 blur-[2px]"
        />

        {/* Clear Single-Line Primary Action Prompt */}
        <span className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-xl bg-rose-600 px-6 py-3 text-base font-bold text-white shadow-lg shadow-rose-600/25 transition-colors duration-150 group-hover:bg-rose-700 whitespace-nowrap">
          Ketuk Kotak Hadiah
        </span>
      </button>
    </div>
  );
}
