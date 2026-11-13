import { useCallback, useEffect, useRef, useState } from 'react';
import { ExplosionCanvas } from './components/ExplosionCanvas';
import { FinaleStage } from './components/FinaleStage';
import { GiftBoxStage } from './components/GiftBoxStage';
import { JumpscareStage } from './components/JumpscareStage';
import { LoadingStage } from './components/LoadingStage';
import {
  calculateLoadingProgress,
  LOADING_DURATION_MS,
  resolveInitialPhase,
  type SurprisePhase,
  type SurpriseStats,
} from './lib/surpriseFlow';

const INITIAL_STATS: SurpriseStats = {
  totalScans: 128,
  totalJumpscares: 114,
  totalInstagramClicks: 67,
  recentReactions: [],
};

export default function App() {
  const [phase, setPhase] = useState<SurprisePhase>(() =>
    typeof window !== 'undefined' ? resolveInitialPhase(window.location.search) : 'intro',
  );
  const [burstKey, setBurstKey] = useState(1);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [needsSoundTap, setNeedsSoundTap] = useState(false);
  const [stats, setStats] = useState<SurpriseStats>(INITIAL_STATS);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const jumpscareContainerRef = useRef<HTMLDivElement | null>(null);
  const scanLoggedRef = useRef(false);

  const postEvent = useCallback(async (type: 'scan' | 'jumpscare' | 'instagram_click') => {
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      if (res.ok) {
        const updated = (await res.json()) as SurpriseStats;
        setStats(updated);
      }
    } catch {
      // Ignore transient network errors so the surprise flow never breaks
    }
  }, []);

  // Load initial stats & register initial barcode scan once
  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        if (!scanLoggedRef.current) {
          scanLoggedRef.current = true;
          const res = await fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'scan' }),
          });
          if (res.ok && active) {
            setStats((await res.json()) as SurpriseStats);
            return;
          }
        }
        const statsRes = await fetch('/api/stats');
        if (statsRes.ok && active) {
          setStats((await statsRes.json()) as SurpriseStats);
        }
      } catch {
        // Non-blocking fallback
      }
    };
    init();
    return () => {
      active = false;
    };
  }, []);

  // Sync body state attribute for testability
  useEffect(() => {
    document.body.setAttribute('data-phase', phase);
  }, [phase]);

  const startJumpscarePlayback = useCallback(() => {
    setPhase('jumpscare');
    postEvent('jumpscare');

    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;
    video.muted = false;
    video.volume = 1.0;

    // Request fullscreen on the container wrapper (not <video>) so browser player controls stay hidden
    const container = jumpscareContainerRef.current;
    if (container && container.requestFullscreen) {
      container.requestFullscreen().catch(() => {
        // Fixed full-viewport overlay already fills 100% of screen
      });
    }

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setNeedsSoundTap(false);
        })
        .catch(() => {
          // If unmuted autoplay is blocked (e.g. ?phase=jumpscare), prompt one tap for full audio
          setNeedsSoundTap(true);
        });
    }
  }, [postEvent]);

  // Loading countdown timer -> triggers fullscreen jumpscare
  useEffect(() => {
    if (phase !== 'loading') return;

    const startTime = performance.now();
    setLoadingProgress(0);

    const interval = window.setInterval(() => {
      const elapsed = performance.now() - startTime;
      const pct = calculateLoadingProgress(elapsed, LOADING_DURATION_MS);
      setLoadingProgress(pct);

      if (elapsed >= LOADING_DURATION_MS) {
        window.clearInterval(interval);
        startJumpscarePlayback();
      }
    }, 50);

    return () => {
      window.clearInterval(interval);
    };
  }, [phase, startJumpscarePlayback]);

  // Trigger explosion when returning to intro or reaching finale
  useEffect(() => {
    if (phase === 'intro' || phase === 'finale') {
      setBurstKey((prev) => prev + 1);
    }
  }, [phase]);

  const handleOpenBox = () => {
    // Unlock audio/video playback synchronously inside the user's tap gesture
    const video = videoRef.current;
    if (video) {
      video.muted = false;
      video.volume = 1.0;
      const prime = video.play();
      if (prime !== undefined) {
        prime
          .then(() => {
            video.pause();
            video.currentTime = 0;
            setNeedsSoundTap(false);
          })
          .catch(() => {
            // Will retry in startJumpscarePlayback
          });
      }
    }
    setPhase('loading');
  };

  const handleManualPlayWithSound = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    video.volume = 1.0;
    video.play().then(() => {
      setNeedsSoundTap(false);
    }).catch(() => {});
  };

  const handleVideoEnded = () => {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
    setPhase('finale');
  };

  const handleReplay = () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
    setNeedsSoundTap(false);
    setLoadingProgress(0);
    setPhase('intro');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FFFDF7] text-stone-900">
      {/* Subtle festive warm sunburst background */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed left-1/2 top-1/2 -z-10 h-[150vmax] w-[150vmax] opacity-40 animate-sunburst"
        style={{
          background:
            'repeating-conic-gradient(from 0deg, rgba(251, 191, 36, 0.14) 0deg 12deg, transparent 12deg 24deg)',
        }}
      />

      {/* Immediate Festive Explosion Canvas on Intro & Finale */}
      {(phase === 'intro' || phase === 'finale') && <ExplosionCanvas burstKey={burstKey} />}

      {/* Main Content Container */}
      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-4 py-10 sm:px-8 sm:py-14">
        {phase === 'intro' && (
          <section
            data-testid="intro-stage"
            className="flex w-full max-w-3xl flex-col items-center text-center animate-pop-in"
          >
            <p className="text-sm font-bold tracking-wide text-rose-600">
              Kejutan Scan Barcode · Edisi Spesial
            </p>

            <h1 className="mt-3 font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-stone-900 text-balance leading-[1.08]">
              Selamat!
            </h1>

            <p className="mt-4 max-w-2xl text-lg sm:text-xl font-semibold leading-relaxed text-stone-700 text-balance">
              Karena anda telah menscan barcode. Anda berhak memenangkan hadiah berikut.
            </p>

            {/* Bouncing Gift Box + Knocking Hand */}
            <div className="mt-6 sm:mt-8">
              <GiftBoxStage onOpenBox={handleOpenBox} />
            </div>

            {/* Clean unboxed live metadata */}
            <p className="mt-2 text-xs sm:text-sm font-medium text-stone-500">
              <span className="tabular-nums">{stats.totalScans.toLocaleString('id-ID')}</span> orang telah menscan barcode ini
              <span className="mx-2" aria-hidden="true">·</span>
              <span>Ketuk kotak di atas untuk klaim</span>
            </p>
          </section>
        )}

        {phase === 'loading' && <LoadingStage progress={loadingProgress} />}

        {phase === 'finale' && (
          <FinaleStage
            stats={stats}
            onInstagramClick={() => postEvent('instagram_click')}
            onReplay={handleReplay}
            onReactionSubmitted={(updated) => setStats(updated)}
          />
        )}
      </main>

      {/* Pre-mounted Fullscreen Jumpscare Video Stage */}
      <JumpscareStage
        active={phase === 'jumpscare'}
        needsSoundTap={needsSoundTap}
        containerRef={jumpscareContainerRef}
        videoRef={videoRef}
        onVideoEnded={handleVideoEnded}
        onManualPlayWithSound={handleManualPlayWithSound}
      />
    </div>
  );
}
