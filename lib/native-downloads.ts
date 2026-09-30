import type {Episode} from '@/data/catalog';

export const DOWNLOAD_EVENT = 'novastream-download-change';
const DOWNLOAD_SNAPSHOT_KEY = 'novastream:downloads:v1';

export type DownloadState = 'queued' | 'downloading' | 'paused' | 'complete' | 'failed';

export type NativeDownload = {
  playbackId: string;
  episodeId: string;
  title: string;
  seriesTitle: string;
  season: number;
  episode: number;
  thumbnail: string;
  state: DownloadState;
  progress: number;
  downloadedBytes?: number;
  totalBytes?: number;
  error?: string;
};

export type DownloadRequest = {
  playbackId: string;
  episodeId: string;
  title: string;
  seriesTitle: string;
  season: number;
  episode: number;
  thumbnail: string;
  url: string;
  expiresAt: string;
};

type NovaStreamAndroidBridge = {
  getDownloads?: () => string;
  startDownload?: (payload: string) => void;
  pauseDownload?: (playbackId: string) => void;
  resumeDownload?: (playbackId: string) => void;
  cancelDownload?: (playbackId: string) => void;
  deleteDownload?: (playbackId: string) => void;
  playOffline?: (playbackId: string) => void;
};

declare global {
  interface Window {
    NovaStreamAndroid?: NovaStreamAndroidBridge;
    NovaStreamDownloads?: {receive: (payload: string) => void};
  }
}

function normalizeDownloads(value: unknown): NativeDownload[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): NativeDownload[] => {
    if (!item || typeof item !== 'object') return [];
    const candidate = item as Partial<NativeDownload>;
    if (typeof candidate.playbackId !== 'string' || typeof candidate.episodeId !== 'string') return [];
    const allowed: DownloadState[] = ['queued', 'downloading', 'paused', 'complete', 'failed'];
    const state = allowed.includes(candidate.state as DownloadState) ? candidate.state as DownloadState : 'failed';
    return [{
      playbackId: candidate.playbackId,
      episodeId: candidate.episodeId,
      title: typeof candidate.title === 'string' ? candidate.title : 'Episode',
      seriesTitle: typeof candidate.seriesTitle === 'string' ? candidate.seriesTitle : 'NovaStream',
      season: Number.isFinite(candidate.season) ? Number(candidate.season) : 0,
      episode: Number.isFinite(candidate.episode) ? Number(candidate.episode) : 0,
      thumbnail: typeof candidate.thumbnail === 'string' ? candidate.thumbnail : '/icon.svg',
      state,
      progress: Math.min(100, Math.max(0, Number(candidate.progress) || 0)),
      downloadedBytes: Number.isFinite(candidate.downloadedBytes) ? Number(candidate.downloadedBytes) : undefined,
      totalBytes: Number.isFinite(candidate.totalBytes) ? Number(candidate.totalBytes) : undefined,
      error: typeof candidate.error === 'string' ? candidate.error : undefined,
    }];
  });
}

function parseSnapshot(raw: string | null): NativeDownload[] {
  if (!raw) return [];
  try { return normalizeDownloads(JSON.parse(raw)); } catch { return []; }
}

function saveSnapshot(downloads: NativeDownload[]) {
  try { window.localStorage.setItem(DOWNLOAD_SNAPSHOT_KEY, JSON.stringify(downloads)); } catch { /* Native storage remains authoritative. */ }
}

export function hasNativeDownloadBridge() {
  return typeof window !== 'undefined' && typeof window.NovaStreamAndroid?.startDownload === 'function';
}

export function readDownloads(): NativeDownload[] {
  if (typeof window === 'undefined') return [];
  try {
    const nativeValue = window.NovaStreamAndroid?.getDownloads?.();
    if (nativeValue) {
      const downloads = parseSnapshot(nativeValue);
      saveSnapshot(downloads);
      return downloads;
    }
  } catch { /* Fall back to the last native snapshot. */ }
  return parseSnapshot(window.localStorage.getItem(DOWNLOAD_SNAPSHOT_KEY));
}

export function receiveDownloadSnapshot(payload: string) {
  const downloads = parseSnapshot(payload);
  saveSnapshot(downloads);
  window.dispatchEvent(new CustomEvent<NativeDownload[]>(DOWNLOAD_EVENT, {detail: downloads}));
}

export function optimisticDownload(episode: Episode, seriesTitle: string) {
  const current = readDownloads().filter((item) => item.playbackId !== episode.video.playbackId);
  const next: NativeDownload[] = [{
    playbackId: episode.video.playbackId,
    episodeId: episode.id,
    title: episode.title,
    seriesTitle,
    season: episode.season,
    episode: episode.episode,
    thumbnail: episode.thumbnail,
    state: 'queued',
    progress: 0,
  }, ...current];
  saveSnapshot(next);
  window.dispatchEvent(new CustomEvent<NativeDownload[]>(DOWNLOAD_EVENT, {detail: next}));
}

export function buildDownloadRequest(episode: Episode, seriesTitle: string, url: string, expiresAt: string): DownloadRequest {
  return {
    playbackId: episode.video.playbackId,
    episodeId: episode.id,
    title: episode.title,
    seriesTitle,
    season: episode.season,
    episode: episode.episode,
    thumbnail: episode.thumbnail,
    url,
    expiresAt,
  };
}

export function nativeDownloadCommand(command: 'pause' | 'resume' | 'cancel' | 'delete' | 'play', playbackId: string) {
  const bridge = window.NovaStreamAndroid;
  if (!bridge) return false;
  const actions = {
    pause: bridge.pauseDownload,
    resume: bridge.resumeDownload,
    cancel: bridge.cancelDownload,
    delete: bridge.deleteDownload,
    play: bridge.playOffline,
  };
  const action = actions[command];
  if (!action) return false;
  action.call(bridge, playbackId);
  return true;
}
