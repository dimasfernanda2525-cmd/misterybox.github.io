export type SurprisePhase = 'intro' | 'loading' | 'jumpscare' | 'finale';

export interface InstagramTarget {
  username: string;
  handle: string;
  webUrl: string;
  appUri: string;
  androidIntentUri: string;
}

export interface VisitorReaction {
  id: string;
  name: string;
  emoji: string;
  message: string;
  createdAt: string;
}

export interface SurpriseStats {
  totalScans: number;
  totalJumpscares: number;
  totalInstagramClicks: number;
  recentReactions: VisitorReaction[];
}

export const ALLOWED_REACTION_EMOJIS = ['😱', '😂', '🤣', '🎁', '🔥', '👏'] as const;

export const LOADING_DURATION_MS = 2100;

export const LOADING_STEPS = [
  { threshold: 0, label: 'Memverifikasi kode barcode anda...' },
  { threshold: 35, label: 'Membuka segel kotak hadiah...' },
  { threshold: 72, label: 'Menyiapkan hadiah spesial anda...' },
] as const;

export function resolveInitialPhase(search: string): SurprisePhase {
  const params = new URLSearchParams(search);
  const explicitPhase = params.get('phase');
  if (
    explicitPhase === 'intro' ||
    explicitPhase === 'loading' ||
    explicitPhase === 'jumpscare' ||
    explicitPhase === 'finale'
  ) {
    return explicitPhase;
  }
  if (params.get('autostart') === '1') {
    return 'loading';
  }
  return 'intro';
}

export function calculateLoadingProgress(elapsedMs: number, totalMs: number = LOADING_DURATION_MS): number {
  if (totalMs <= 0) return 100;
  const clamped = Math.max(0, Math.min(elapsedMs, totalMs));
  // Ease slightly then accelerate right before 100% for suspense
  const ratio = clamped / totalMs;
  const eased = ratio < 0.7 ? ratio * 1.05 : 0.735 + ((ratio - 0.7) / 0.3) * 0.265;
  return Math.min(100, Math.round(eased * 100));
}

export function getLoadingMessage(progress: number): string {
  let current: string = LOADING_STEPS[0].label;
  for (const step of LOADING_STEPS) {
    if (progress >= step.threshold) {
      current = step.label;
    }
  }
  return current;
}

export function buildInstagramTarget(rawUsername: string): InstagramTarget {
  const username = rawUsername.trim().replace(/^@+/, '') || 'diferrr_';
  return {
    username,
    handle: `@${username}`,
    webUrl: `https://www.instagram.com/${username}/`,
    appUri: `instagram://user?username=${username}`,
    androidIntentUri: `intent://instagram.com/_u/${username}/#Intent;package=com.instagram.android;scheme=https;end`,
  };
}

export function detectMobilePlatform(userAgent: string): 'android' | 'ios' | 'desktop' {
  const ua = userAgent.toLowerCase();
  if (/android/.test(ua)) return 'android';
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  return 'desktop';
}

export interface ReactionValidationResult {
  valid: boolean;
  error?: string;
  sanitized?: {
    name: string;
    emoji: string;
    message: string;
  };
}

export function validateReactionInput(input: {
  name?: string;
  emoji?: string;
  message?: string;
}): ReactionValidationResult {
  const name = (input.name ?? '').trim();
  const message = (input.message ?? '').trim();
  const emoji = (input.emoji ?? '😱').trim();

  if (name.length < 2) {
    return { valid: false, error: 'Nama minimal 2 karakter.' };
  }
  if (name.length > 36) {
    return { valid: false, error: 'Nama maksimal 36 karakter.' };
  }
  if (message.length < 2) {
    return { valid: false, error: 'Tulis komentar singkat minimal 2 karakter.' };
  }
  if (message.length > 140) {
    return { valid: false, error: 'Pesan maksimal 140 karakter.' };
  }

  const allowedEmoji = (ALLOWED_REACTION_EMOJIS as readonly string[]).includes(emoji)
    ? emoji
    : ALLOWED_REACTION_EMOJIS[0];

  return {
    valid: true,
    sanitized: {
      name,
      emoji: allowedEmoji,
      message,
    },
  };
}
