'use client';

import {Check, Download, Pause, Play, RotateCcw} from 'lucide-react';
import {useEffect, useState} from 'react';
import type {Episode} from '@/data/catalog';
import {
  buildDownloadRequest,
  DOWNLOAD_EVENT,
  hasNativeDownloadBridge,
  nativeDownloadCommand,
  optimisticDownload,
  readDownloads,
  type NativeDownload,
} from '@/lib/native-downloads';

type DownloadPayload = {url?: string; expiresAt?: string; error?: string};
const mediaApiBase = (process.env.NEXT_PUBLIC_MEDIA_API_URL ?? '').replace(/\/$/, '');

export default function DownloadAction({episode, seriesTitle}:{episode:Episode; seriesTitle:string}) {
  const [downloads, setDownloads] = useState<NativeDownload[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const update = (event?: Event) => {
      const detail = (event as CustomEvent<NativeDownload[]> | undefined)?.detail;
      setDownloads(Array.isArray(detail) ? detail : readDownloads());
    };
    update();
    window.addEventListener(DOWNLOAD_EVENT, update);
    return () => window.removeEventListener(DOWNLOAD_EVENT, update);
  }, []);

  const item = downloads.find((download) => download.playbackId === episode.video.playbackId);

  const start = async () => {
    if (busy || !episode.video.available) return;
    if (!hasNativeDownloadBridge()) {
      setMessage('Offline download is available inside the NovaStream Android app.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch(`${mediaApiBase}/api/download/${encodeURIComponent(episode.video.playbackId)}`, {
        cache: 'no-store',
        headers: {'Accept': 'application/json'},
      });
      const payload = await response.json().catch(() => null) as DownloadPayload | null;
      if (!response.ok || !payload?.url || !payload.expiresAt) throw new Error(payload?.error || 'Download could not be prepared.');
      optimisticDownload(episode, seriesTitle);
      window.NovaStreamAndroid?.startDownload?.(JSON.stringify(buildDownloadRequest(episode, seriesTitle, payload.url, payload.expiresAt)));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Download could not be prepared.');
    } finally {
      setBusy(false);
    }
  };

  const action = () => {
    if (!item) { void start(); return; }
    if (item.state === 'complete') nativeDownloadCommand('play', item.playbackId);
    else if (item.state === 'downloading' || item.state === 'queued') nativeDownloadCommand('pause', item.playbackId);
    else if (item.state === 'paused') nativeDownloadCommand('resume', item.playbackId);
    else void start();
  };

  const Icon = item?.state === 'complete' ? Check : item?.state === 'downloading' || item?.state === 'queued' ? Pause : item?.state === 'paused' ? Play : item?.state === 'failed' ? RotateCcw : Download;
  const label = busy ? 'Preparing…' : item?.state === 'complete' ? 'Play offline' : item?.state === 'downloading' ? `${Math.round(item.progress)}%` : item?.state === 'queued' ? 'Queued' : item?.state === 'paused' ? 'Resume' : item?.state === 'failed' ? 'Retry' : 'Download';

  return <div className="download-action-wrap">
    <button className={`save-button download-action${item?.state === 'complete' ? ' complete' : ''}`} type="button" onClick={action} disabled={busy || !episode.video.available}>
      <Icon /><span>{label}</span>
      {item && item.state !== 'complete' ? <i style={{width: `${item.progress}%`}} /> : null}
    </button>
    {message ? <span className="download-message" role="status">{message}</span> : null}
  </div>;
}
