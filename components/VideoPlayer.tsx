'use client';

import Image from 'next/image';
import {AlertTriangle, Maximize, Minimize, Moon, Play, RefreshCw, ShieldCheck, Sun} from 'lucide-react';
import {useCallback, useEffect, useRef, useState} from 'react';
import type {Episode} from '@/data/catalog';
import {clearWatchProgress, readWatchProgress, saveLastWatched, saveWatchProgress} from '@/lib/local-library';

type PlayerState = 'idle' | 'loading' | 'ready' | 'error';

const mediaApiBase = (process.env.NEXT_PUBLIC_MEDIA_API_URL ?? '').replace(/\/$/, '');

export default function VideoPlayer({episode, seriesTitle}:{episode:Episode; seriesTitle:string}) {
  const [state, setState] = useState<PlayerState>('idle');
  const [sourceUrl, setSourceUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [cinema, setCinema] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastSavedSecondRef = useRef(0);

  const requestPlayback = useCallback(async () => {
    if (!episode.video.available) return;
    saveLastWatched(episode.id);
    setErrorMessage('');
    setState('loading');
    setSourceUrl('');

    try {
      const response = await fetch(`${mediaApiBase}/api/play/${encodeURIComponent(episode.video.playbackId)}`, {
        cache: 'no-store',
        headers: {'Accept': 'application/json'},
      });
      const payload = await response.json().catch(() => null) as {url?: string; error?: string} | null;
      if (!response.ok || !payload?.url) throw new Error(payload?.error || 'Video service is temporarily unavailable.');
      setSourceUrl(payload.url);
    } catch (error) {
      setState('error');
      setErrorMessage(error instanceof Error ? error.message : 'Video could not be loaded.');
    }
  }, [episode.id, episode.video.available, episode.video.playbackId]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await playerRef.current?.requestFullscreen();
    } catch { /* Android WebView may provide fullscreen through its native chrome client. */ }
  }, []);

  const restoreProgress = () => {
    const video = videoRef.current;
    if (!video) return;
    const progress = readWatchProgress(episode.id);
    if (progress && progress.currentTime > 10 && progress.currentTime < video.duration - 30) video.currentTime = progress.currentTime;
  };

  const trackProgress = () => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;
    const second = Math.floor(video.currentTime);
    if (second - lastSavedSecondRef.current < 5) return;
    lastSavedSecondRef.current = second;
    saveWatchProgress(episode.id, video.currentTime, video.duration);
  };

  useEffect(() => {
    const update = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', update);
    return () => document.removeEventListener('fullscreenchange', update);
  }, []);

  useEffect(() => {
    if (!cinema) return;
    const closeCinema = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !document.fullscreenElement) setCinema(false);
    };
    window.addEventListener('keydown', closeCinema);
    return () => window.removeEventListener('keydown', closeCinema);
  }, [cinema]);

  useEffect(() => {
    setState('idle');
    setSourceUrl('');
    setErrorMessage('');
    setCinema(false);
    lastSavedSecondRef.current = 0;
  }, [episode.id]);

  return <div className={`video-area${cinema ? ' is-cinema' : ''}`}>
    <div className={state !== 'idle' ? 'video-player loaded' : 'video-player'} ref={playerRef}>
      {sourceUrl ? <video
        ref={videoRef}
        src={sourceUrl}
        poster={episode.thumbnail}
        title={`${seriesTitle} Season ${episode.season} ${episode.title}`}
        controls
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture
        playsInline
        preload="metadata"
        crossOrigin="anonymous"
        onLoadedMetadata={restoreProgress}
        onCanPlay={() => setState('ready')}
        onTimeUpdate={trackProgress}
        onPlay={() => saveLastWatched(episode.id)}
        onEnded={() => clearWatchProgress(episode.id)}
        onError={() => {
          setState('error');
          setErrorMessage('Playback link expired or the video file could not be reached.');
        }}
      /> : episode.video.available ? <button className="player-facade" type="button" onClick={requestPlayback} aria-label={`Play ${episode.title}`}>
        <Image src={episode.thumbnail} alt="" fill priority sizes="100vw" />
        <span className="player-shade" />
        <span className="player-play"><Play fill="currentColor" /></span>
        <span className="player-label">Tap to play {episode.title}</span>
      </button> : <div className="player-facade player-unavailable" role="status">
        <Image src={episode.thumbnail} alt="" fill priority sizes="100vw" />
        <span className="player-shade" />
        <span className="player-coming-soon">Episode source is being prepared</span>
      </div>}
      {state === 'loading' ? <div className="player-loading" role="status"><i /><span>Preparing private playback…</span></div> : null}
      {state === 'error' ? <div className="player-error" role="alert">
        <AlertTriangle />
        <strong>Playback could not start</strong>
        <span>{errorMessage}</span>
        <button type="button" onClick={requestPlayback}>Try again</button>
      </div> : null}
    </div>
    <div className="player-toolbar">
      <span><ShieldCheck /> Private NovaStream playback</span>
      <div>
        <button type="button" onClick={requestPlayback} title="Reload player" disabled={!episode.video.available}><RefreshCw /><span>Reload</span></button>
        <button type="button" onClick={() => setCinema((value) => !value)} aria-pressed={cinema} title="Cinema mode">{cinema ? <Sun /> : <Moon />}<span>Cinema</span></button>
        <button type="button" onClick={toggleFullscreen} title="Fullscreen">{fullscreen ? <Minimize /> : <Maximize />}<span>Full screen</span></button>
      </div>
    </div>
  </div>;
}
