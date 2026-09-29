export const LIBRARY_KEY = 'novastream:library:v1';
export const LAST_WATCHED_KEY = 'novastream:last-watched:v1';
export const LIBRARY_EVENT = 'novastream-library-change';
export const WATCH_EVENT = 'novastream-watch-change';
export const WATCH_PROGRESS_KEY = 'novastream:watch-progress:v1';

export type SavedLibrary = {
  episodes: string[];
  series: string[];
};

export type LastWatched = {
  episodeId: string;
  watchedAt: string;
};

export type WatchProgress = {
  currentTime: number;
  duration: number;
  updatedAt: string;
};

const emptyLibrary: SavedLibrary = {episodes: [], series: []};

export function readLibrary(): SavedLibrary {
  if (typeof window === 'undefined') return emptyLibrary;
  try {
    const value = JSON.parse(window.localStorage.getItem(LIBRARY_KEY) ?? 'null');
    return {
      episodes: Array.isArray(value?.episodes) ? value.episodes : [],
      series: Array.isArray(value?.series) ? value.series : [],
    };
  } catch {
    return emptyLibrary;
  }
}

export function toggleLibraryItem(kind: keyof SavedLibrary, id: string) {
  const library = readLibrary();
  const exists = library[kind].includes(id);
  const values = exists ? library[kind].filter((item) => item !== id) : [...library[kind], id];
  const next = {...library, [kind]: values};
  try {
    window.localStorage.setItem(LIBRARY_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(LIBRARY_EVENT));
  } catch { return exists; }
  return !exists;
}

export function saveLastWatched(episodeId: string) {
  const value: LastWatched = {episodeId, watchedAt: new Date().toISOString()};
  try {
    window.localStorage.setItem(LAST_WATCHED_KEY, JSON.stringify(value));
    window.dispatchEvent(new Event(WATCH_EVENT));
  } catch { /* Playback still works when storage is unavailable. */ }
}

export function readLastWatched(): LastWatched | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = JSON.parse(window.localStorage.getItem(LAST_WATCHED_KEY) ?? 'null');
    return typeof value?.episodeId === 'string' ? value : null;
  } catch {
    return null;
  }
}

export function readWatchProgress(episodeId: string): WatchProgress | null {
  if (typeof window === 'undefined') return null;
  try {
    const all = JSON.parse(window.localStorage.getItem(WATCH_PROGRESS_KEY) ?? '{}');
    const value = all?.[episodeId];
    return Number.isFinite(value?.currentTime) && Number.isFinite(value?.duration) ? value : null;
  } catch {
    return null;
  }
}

export function saveWatchProgress(episodeId: string, currentTime: number, duration: number) {
  if (!Number.isFinite(currentTime) || !Number.isFinite(duration) || duration <= 0) return;
  try {
    const all = JSON.parse(window.localStorage.getItem(WATCH_PROGRESS_KEY) ?? '{}');
    all[episodeId] = {currentTime, duration, updatedAt: new Date().toISOString()};
    window.localStorage.setItem(WATCH_PROGRESS_KEY, JSON.stringify(all));
  } catch { /* Progress tracking is optional. */ }
}

export function clearWatchProgress(episodeId: string) {
  try {
    const all = JSON.parse(window.localStorage.getItem(WATCH_PROGRESS_KEY) ?? '{}');
    delete all[episodeId];
    window.localStorage.setItem(WATCH_PROGRESS_KEY, JSON.stringify(all));
  } catch { /* Playback completion still succeeds. */ }
}
