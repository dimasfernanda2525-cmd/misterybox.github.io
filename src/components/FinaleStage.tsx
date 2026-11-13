import { ExternalLink, RotateCcw, Send } from 'lucide-react';
import { useState, type FormEvent, type MouseEvent } from 'react';
import {
  ALLOWED_REACTION_EMOJIS,
  buildInstagramTarget,
  detectMobilePlatform,
  validateReactionInput,
  type SurpriseStats,
} from '../lib/surpriseFlow';

interface FinaleStageProps {
  stats: SurpriseStats;
  onInstagramClick: () => void;
  onReplay: () => void;
  onReactionSubmitted: (updatedStats: SurpriseStats) => void;
}

export function FinaleStage({
  stats,
  onInstagramClick,
  onReplay,
  onReactionSubmitted,
}: FinaleStageProps) {
  const [imgError, setImgError] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string>(ALLOWED_REACTION_EMOJIS[0]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const instagram = buildInstagramTarget('diferrr_');

  const handleOpenInstagram = (event: MouseEvent<HTMLAnchorElement>) => {
    onInstagramClick();
    const platform = detectMobilePlatform(navigator.userAgent);
    if (platform === 'desktop') {
      return;
    }

    event.preventDefault();
    const nativeUri = platform === 'android' ? instagram.androidIntentUri : instagram.appUri;
    const fallbackTimer = window.setTimeout(() => {
      if (!document.hidden) {
        window.location.assign(instagram.webUrl);
      }
    }, 850);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        window.clearTimeout(fallbackTimer);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.location.assign(nativeUri);
  };

  const handleReactionSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setFormSuccess(false);

    const check = validateReactionInput({ name, emoji: selectedEmoji, message });
    if (!check.valid || !check.sanitized) {
      setFormError(check.error ?? 'Periksa kembali isian reaksi anda.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(check.sanitized),
      });
      const payload = (await response.json()) as { stats?: SurpriseStats; error?: string };
      if (!response.ok || !payload.stats) {
        setFormError(payload.error ?? 'Gagal mengirim reaksi.');
        return;
      }
      onReactionSubmitted(payload.stats);
      setName('');
      setMessage('');
      setFormSuccess(true);
    } catch {
      setFormError('Koneksi bermasalah. Coba lagi sebentar.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      data-testid="finale-stage"
      aria-label="Kejutan Terbuka"
      className="mx-auto w-full max-w-5xl animate-pop-in"
    >
      <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
        {/* Left Column: User Photo Portrait */}
        <div className="lg:col-span-5">
          <div className="relative h-full overflow-hidden rounded-3xl border border-stone-200 bg-white p-3 shadow-[0_18px_50px_-15px_rgba(28,25,23,0.12)]">
            <div className="relative aspect-[3/4] lg:aspect-auto lg:h-full lg:min-h-[540px] w-full overflow-hidden rounded-2xl bg-stone-100">
              {!imgError ? (
                <img
                  src="/assets/aistudio/Picsart_26-11-11_01-38-58-892_e191d961.png"
                  alt="Foto pemilik barcode @diferrr_"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="h-full w-full object-cover object-top"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-rose-50 via-amber-50 to-stone-100 p-6 text-center">
                  <span className="font-display text-4xl font-extrabold text-rose-600">@diferrr_</span>
                  <span className="mt-2 text-sm text-stone-600">Pemilik Barcode Kejutan</span>
                </div>
              )}

              {/* Bottom caption scrim */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent p-5 pt-14 text-white">
                <p className="font-display text-xl font-bold tracking-tight">Salam Kenal!</p>
                <p className="text-sm text-white/90">{instagram.handle}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Reveal Copy, Tappable Instagram Logo CTA, Stats & Reactions */}
        <div className="flex flex-col justify-between gap-6 lg:col-span-7">
          <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-[0_18px_50px_-15px_rgba(28,25,23,0.08)]">
            <p className="text-sm font-semibold text-rose-600">Kejutan Terungkap</p>
            <h1 className="mt-1.5 font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 text-balance">
              Kaget ya? Hadiahnya kenalan dulu sama yang punya barcode!
            </h1>
            <p className="mt-3 text-base leading-relaxed text-stone-600">
              Terima kasih sudah berani mengetuk kotak hadiahnya. Jangan lupa mampir dan ikuti akun Instagram berikut langsung dari aplikasi Instagram anda:
            </p>

            {/* Unboxed Live Metadata Stats */}
            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-stone-600">
              <span className="tabular-nums">{stats.totalScans.toLocaleString('id-ID')} scan barcode</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{stats.totalJumpscares.toLocaleString('id-ID')} kena jumpscare</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{stats.totalInstagramClicks.toLocaleString('id-ID')} buka Instagram</span>
            </div>

            {/* Tappable Instagram Logo + CTA */}
            <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <a
                href={instagram.webUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleOpenInstagram}
                data-testid="instagram-link"
                aria-label="Buka profil Instagram @diferrr_ di aplikasi Instagram"
                className="group inline-flex min-h-[56px] flex-1 items-center justify-between gap-4 rounded-2xl bg-stone-950 px-5 py-3.5 text-white shadow-lg shadow-stone-950/15 transition-transform duration-150 hover:bg-stone-900 active:scale-[0.98] focus-visible:ring-4 focus-visible:ring-rose-500/40"
              >
                <span className="flex items-center gap-3.5">
                  {/* Authentic Instagram Gradient Camera Logo */}
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#515BD4] p-2 shadow-sm transition-transform duration-200 group-hover:scale-105">
                    <svg viewBox="0 0 24 24" className="h-full w-full text-white" fill="none" aria-hidden="true">
                      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="currentColor" strokeWidth="2.2" />
                      <circle cx="12" cy="12" r="4.3" stroke="currentColor" strokeWidth="2.2" />
                      <circle cx="17.4" cy="6.6" r="1.3" fill="currentColor" />
                    </svg>
                  </span>
                  <span className="flex flex-col text-left">
                    <span className="text-xs font-medium text-stone-300">Buka Aplikasi Instagram</span>
                    <span className="font-display text-lg font-bold tracking-tight text-white">
                      {instagram.handle}
                    </span>
                  </span>
                </span>
                <ExternalLink className="h-5 w-5 shrink-0 text-stone-300 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
              </a>

              <button
                type="button"
                onClick={onReplay}
                data-testid="replay-button"
                className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-2xl border border-stone-300 bg-stone-50 px-5 py-3.5 text-sm font-semibold text-stone-800 transition-colors duration-150 hover:bg-stone-100 active:scale-[0.98] whitespace-nowrap cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                <span>Ulangi Kejutan</span>
              </button>
            </div>
          </div>

          {/* Interactive Reaction Guestbook (Fullstack Persisted) */}
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-[0_14px_40px_-15px_rgba(28,25,23,0.06)]">
            <h2 className="font-display text-lg font-bold text-stone-900">
              Tulis Reaksi Kagetmu
            </h2>

            <form onSubmit={handleReactionSubmit} className="mt-4 space-y-3" noValidate>
              <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Pilih emoji reaksi">
                {ALLOWED_REACTION_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedEmoji(emoji)}
                    aria-pressed={selectedEmoji === emoji}
                    aria-label={`Pilih reaksi ${emoji}`}
                    className={`flex h-11 w-11 items-center justify-center rounded-xl border text-xl transition-transform duration-150 cursor-pointer ${
                      selectedEmoji === emoji
                        ? 'border-rose-600 bg-rose-50 scale-105'
                        : 'border-stone-200 bg-stone-50 hover:bg-stone-100'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
                <div className="sm:col-span-4">
                  <label htmlFor="reaction-name" className="sr-only">
                    Nama anda
                  </label>
                  <input
                    id="reaction-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama anda"
                    maxLength={36}
                    className="h-11 w-full rounded-xl border border-stone-300 bg-stone-50/70 px-3.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-rose-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-6">
                  <label htmlFor="reaction-message" className="sr-only">
                    Komentar reaksi
                  </label>
                  <input
                    id="reaction-message"
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Komentar kagetmu..."
                    maxLength={140}
                    className="h-11 w-full rounded-xl border border-stone-300 bg-stone-50/70 px-3.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-rose-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-60 cursor-pointer whitespace-nowrap"
                  >
                    <Send className="h-4 w-4" aria-hidden="true" />
                    <span>{submitting ? '...' : 'Kirim'}</span>
                  </button>
                </div>
              </div>

              {formError && (
                <p role="alert" className="text-xs font-medium text-rose-600">
                  {formError}
                </p>
              )}
              {formSuccess && (
                <p role="status" className="text-xs font-medium text-emerald-700">
                  Reaksi anda berhasil ditambahkan!
                </p>
              )}
            </form>

            {/* Recent Reactions List */}
            <div className="mt-5 divide-y divide-stone-100 border-t border-stone-100">
              {stats.recentReactions.slice(0, 4).map((item) => (
                <div key={item.id} className="flex items-start gap-3 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-lg" aria-hidden="true">
                    {item.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-stone-900 truncate">{item.name}</p>
                    <p className="text-sm text-stone-600 break-words">{item.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
