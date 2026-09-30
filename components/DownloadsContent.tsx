'use client';

import Image from 'next/image';
import Link from 'next/link';
import {Download, Pause, Play, RotateCcw, Trash2, X} from 'lucide-react';
import {useEffect, useState} from 'react';
import {episodes} from '@/data/catalog';
import {episodeHref} from './EpisodeCard';
import {DOWNLOAD_EVENT, hasNativeDownloadBridge, nativeDownloadCommand, readDownloads, type NativeDownload} from '@/lib/native-downloads';

function formatBytes(bytes?: number) {
  if (!bytes || bytes < 1) return '';
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} GB`;
  return `${Math.round(bytes / 1_000_000)} MB`;
}

export default function DownloadsContent() {
  const [downloads, setDownloads] = useState<NativeDownload[] | null>(null);
  const [nativeApp, setNativeApp] = useState(false);

  useEffect(() => {
    const update = (event?: Event) => {
      const detail = (event as CustomEvent<NativeDownload[]> | undefined)?.detail;
      setDownloads(Array.isArray(detail) ? detail : readDownloads());
      setNativeApp(hasNativeDownloadBridge());
    };
    update();
    window.addEventListener(DOWNLOAD_EVENT, update);
    return () => window.removeEventListener(DOWNLOAD_EVENT, update);
  }, []);

  if (!downloads) return <div className="card-skeleton" aria-label="Loading downloads" />;
  if (downloads.length === 0) return <div className="empty-state downloads-empty">
    <Download />
    <h2>No offline episodes yet</h2>
    <p>{nativeApp ? 'Open an episode and tap Download. Completed episodes will stay inside NovaStream for offline viewing.' : 'Offline downloads are managed securely inside the NovaStream Android app.'}</p>
    <Link className="button primary" href="/browse/">Browse episodes</Link>
  </div>;

  return <div className="downloads-list">
    {downloads.map((item) => {
      const catalogEpisode = episodes.find((episode) => episode.id === item.episodeId);
      const href = catalogEpisode ? episodeHref(catalogEpisode) : '/browse/';
      const active = item.state === 'downloading' || item.state === 'queued';
      return <article className="download-card" key={item.playbackId}>
        <div className="download-art"><Image src={item.thumbnail} alt="" fill sizes="(max-width: 700px) 38vw, 220px" /></div>
        <div className="download-copy">
          <small>{item.seriesTitle} · S{item.season} E{item.episode}</small>
          <h2>{item.title}</h2>
          <div className="download-state"><span>{item.state === 'complete' ? 'Ready offline' : item.state === 'failed' ? (item.error || 'Download failed') : `${Math.round(item.progress)}% · ${item.state}`}</span><b>{formatBytes(item.totalBytes)}</b></div>
          <div className="download-progress" role="progressbar" aria-label={`${item.title} download progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={item.state === 'complete' ? 100 : Math.round(item.progress)}><i style={{width: `${item.state === 'complete' ? 100 : item.progress}%`}} /></div>
          <div className="download-controls">
            {item.state === 'complete' ? <button className="primary" type="button" onClick={() => nativeDownloadCommand('play', item.playbackId)}><Play fill="currentColor" /> Play offline</button> : null}
            {active ? <button type="button" onClick={() => nativeDownloadCommand('pause', item.playbackId)}><Pause /> Pause</button> : null}
            {item.state === 'paused' ? <button className="primary" type="button" onClick={() => nativeDownloadCommand('resume', item.playbackId)}><Play /> Resume</button> : null}
            {item.state === 'failed' ? <Link href={href}><RotateCcw /> Retry from episode</Link> : null}
            {item.state !== 'complete' ? <button type="button" onClick={() => nativeDownloadCommand('cancel', item.playbackId)}><X /> Cancel</button> : null}
            <button className="danger" type="button" onClick={() => {
              if (window.confirm(`Delete ${item.title} from offline downloads?`)) nativeDownloadCommand('delete', item.playbackId);
            }}><Trash2 /> Delete</button>
          </div>
        </div>
      </article>;
    })}
  </div>;
}
