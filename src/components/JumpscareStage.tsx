import { Volume2 } from 'lucide-react';
import { type RefObject } from 'react';

interface JumpscareStageProps {
  active: boolean;
  needsSoundTap: boolean;
  containerRef: RefObject<HTMLDivElement | null>;
  videoRef: RefObject<HTMLVideoElement | null>;
  onVideoEnded: () => void;
  onManualPlayWithSound: () => void;
}

export function JumpscareStage({
  active,
  needsSoundTap,
  containerRef,
  videoRef,
  onVideoEnded,
  onManualPlayWithSound,
}: JumpscareStageProps) {
  return (
    <div
      ref={containerRef}
      data-testid="jumpscare-stage"
      aria-hidden={!active}
      className={
        active
          ? 'fixed inset-0 z-50 flex h-screen w-screen items-center justify-center overflow-hidden bg-black'
          : 'pointer-events-none fixed -left-[9999px] top-0 h-px w-px opacity-0 overflow-hidden'
      }
    >
      <video
        ref={videoRef}
        src="/assets/aistudio/ssstik.io_1794595833227_e8006aba.mp4"
        controls={false}
        disablePictureInPicture
        playsInline
        preload="auto"
        onEnded={onVideoEnded}
        className="h-full w-full object-cover"
      />

      {active && needsSoundTap && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/55 p-6">
          <button
            type="button"
            onClick={onManualPlayWithSound}
            className="inline-flex min-h-[52px] items-center gap-3 rounded-xl bg-rose-600 px-6 py-3.5 text-base font-bold text-white shadow-2xl hover:bg-rose-700 focus-visible:ring-4 focus-visible:ring-white/60 cursor-pointer"
          >
            <Volume2 className="h-5 w-5" aria-hidden="true" />
            <span>Putar Hadiah Dengan Suara Penuh</span>
          </button>
        </div>
      )}
    </div>
  );
}
