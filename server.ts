import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  validateReactionInput,
  type SurpriseStats,
  type VisitorReaction,
} from './src/lib/surpriseFlow.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '.data');
const STORE_PATH = path.join(DATA_DIR, 'surprise-store.json');

const SEED_REACTIONS: VisitorReaction[] = [
  {
    id: 'seed-1',
    name: 'Raka Pratama',
    emoji: '😱',
    message: 'Beneran kaget woy volume HP lagi full!',
    createdAt: '2026-11-12T08:15:00.000Z',
  },
  {
    id: 'seed-2',
    name: 'Nadia Putri',
    emoji: '😂',
    message: 'Kirain beneran dapet iPhone dari barcode, mantap bang @diferrr_',
    createdAt: '2026-11-12T13:40:00.000Z',
  },
];

const DEFAULT_STORE: SurpriseStats = {
  totalScans: 128,
  totalJumpscares: 114,
  totalInstagramClicks: 67,
  recentReactions: SEED_REACTIONS,
};

let writeQueue = Promise.resolve();

async function readStore(): Promise<SurpriseStats> {
  try {
    const raw = await fs.readFile(STORE_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<SurpriseStats>;
    return {
      totalScans: typeof parsed.totalScans === 'number' ? parsed.totalScans : DEFAULT_STORE.totalScans,
      totalJumpscares:
        typeof parsed.totalJumpscares === 'number' ? parsed.totalJumpscares : DEFAULT_STORE.totalJumpscares,
      totalInstagramClicks:
        typeof parsed.totalInstagramClicks === 'number'
          ? parsed.totalInstagramClicks
          : DEFAULT_STORE.totalInstagramClicks,
      recentReactions: Array.isArray(parsed.recentReactions)
        ? parsed.recentReactions
        : DEFAULT_STORE.recentReactions,
    };
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(STORE_PATH, JSON.stringify(DEFAULT_STORE, null, 2), 'utf-8');
    return structuredClone(DEFAULT_STORE);
  }
}

async function mutateStore(updater: (current: SurpriseStats) => SurpriseStats): Promise<SurpriseStats> {
  let result: SurpriseStats = structuredClone(DEFAULT_STORE);
  writeQueue = writeQueue.then(async () => {
    const current = await readStore();
    result = updater(current);
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(STORE_PATH, JSON.stringify(result, null, 2), 'utf-8');
  });
  await writeQueue;
  return result;
}

async function createApp() {
  const app = express();
  app.use(express.json({ limit: '64kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.get('/api/stats', async (_req, res) => {
    try {
      const store = await readStore();
      res.json(store);
    } catch {
      res.status(500).json({ error: 'Gagal memuat statistik kejutan.' });
    }
  });

  app.post('/api/events', async (req, res) => {
    const eventType = (req.body as { type?: string } | undefined)?.type;
    if (eventType !== 'scan' && eventType !== 'jumpscare' && eventType !== 'instagram_click') {
      res.status(400).json({ error: 'Tipe event tidak valid.' });
      return;
    }

    try {
      const updated = await mutateStore((current) => {
        const next = { ...current };
        if (eventType === 'scan') next.totalScans += 1;
        if (eventType === 'jumpscare') next.totalJumpscares += 1;
        if (eventType === 'instagram_click') next.totalInstagramClicks += 1;
        return next;
      });
      res.json(updated);
    } catch {
      res.status(500).json({ error: 'Gagal menyimpan event.' });
    }
  });

  app.post('/api/reactions', async (req, res) => {
    const body = (req.body ?? {}) as { name?: string; emoji?: string; message?: string };
    const validation = validateReactionInput(body);
    if (!validation.valid || !validation.sanitized) {
      res.status(400).json({ error: validation.error ?? 'Input tidak valid.' });
      return;
    }

    const newReaction: VisitorReaction = {
      id: `rx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: validation.sanitized.name,
      emoji: validation.sanitized.emoji,
      message: validation.sanitized.message,
      createdAt: new Date().toISOString(),
    };

    try {
      const updated = await mutateStore((current) => ({
        ...current,
        recentReactions: [newReaction, ...current.recentReactions].slice(0, 12),
      }));
      res.status(201).json({ reaction: newReaction, stats: updated });
    } catch {
      res.status(500).json({ error: 'Gagal menyimpan reaksi.' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

createApp();
