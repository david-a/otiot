import type { Progress } from '$lib/types';

const STORAGE_KEY = 'otiot:progress';

interface ProgressState {
  [playerId: string]: Progress;
}

const safeParse = (value: string | null): ProgressState => {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === 'object') {
      return parsed as ProgressState;
    }
  } catch {
    // ignore
  }
  return {};
};

export const createPlayerId = (name: string): string => {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '') || 'player';
};

export const loadProgress = (playerId: string): Progress | null => {
  const browser = typeof window !== 'undefined';
  if (!browser) return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const state = safeParse(raw);
  return state[playerId] ?? null;
};

export const saveProgress = (progress: Progress): void => {
  const browser = typeof window !== 'undefined';
  if (!browser) return;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const state = safeParse(raw);
  state[progress.playerId] = progress;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};


