'use client';

import Image from 'next/image';
import Link from 'next/link';
import {AlertTriangle, Maximize, Minimize, Moon, Play, RefreshCw, RotateCcw, ShieldCheck, SkipForward, Sun} from 'lucide-react';
import {useCallback, useEffect, useRef, useState} from 'react';
import type {Episode} from '@/data/catalog';
import {clearWatchProgress, readWatchProgress, saveLastWatched, saveWatchProgress} from '@/lib/local-library';

type PlayerState = 'idle' | 'loading' | 'ready' | 'error';
type PlaybackPayload = {url?: string; expiresAt?: string; error?: string};

const mediaApiBase = (process.env.NEXT_PUBLIC_MEDIA_API_URL ?? '').replace(/\/$/, '');
const playbackCachePrefix = 'novastream:playback:v1:';

function formatTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  return `${minutes}:${String(safeSeconds % 60).padStart(2, '0')}`;
}

export default function VideoPlayer({episode, seriesTitle, nextEpisode}:{episode:Episode; seriesTitle:string; nextEpisode?:Episode}) {
  const [state, setState] = useState<PlayerState>('idle');
  const [sourceUrl, setSourceUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [cinema, setCinema] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [resumeAt, setResumeAt] = useState(0);
  const [showNext, setShowNext] = useState(false);
  const [seekFeedback, setSeekFeedback] = useState('');
  const playerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastSavedSecondRef = useRef(0);
  const requestInFlightRef = useRef<Promise<void> | null>(null);
  const automaticRetryRef = useRef(false);
  const seekTimerRef = useRef<number | null>(null);

  const cacheKey = `${playbackCachePrefix}${episode.video.playbackId}`;

  const clearCachedPlayback = useCallback(() => {
    try { window.sessionStorage.removeItem(cacheKey); } catch { /* Session storage is optional. */ }
  }, [cacheKey]);

  const requestPlayback = useCallback(async (forceNew = false) => {
    if (!episode.video.available) return;
    if (requestInFlightRef.current) return requestInFlightRef.current;
    saveLastWatched(episode.id);
    setErrorMessage('');
    setState('loading');
    setShowNext(false);

    const task = (async () => {
      if (forceNew) clearCachedPlayback();
      if (!forceNew) {
        try {
          const cached = JSON.parse(window.sessionStorage.getItem(cacheKey) ?? 'null') as PlaybackPayload | null;
          const expiresAt = cached?.expiresAt ? Date.parse(cached.expiresAt) : 0;
          if (cached?.url && expiresAt > Date.now() + 60_000) {
            setSourceUrl(cached.url);
            return;
          }
        } catch { /* Request a fresh link if cache data is unavailable. */ }
      }

      setSourceUrl('');
      try {
        const response = await fetch(`${mediaApiBase}/api/play/${encodeURIComponent(episode.video.playbackId)}`, {
          cache: 'no-store',
          headers: {'Accept': 'application/json'},
        });
        const payload = await response.json().catch(() => null) as PlaybackPayload | null;
        if (!response.ok || !payload?.url) throw new Error(payload?.error || 'Video service is temporarily unavailable.');
        try { window.sessionStorage.setItem(cacheKey, JSON.stringify(payload)); } catch { /* Playback still works. */ }
        setSourceUrl(payload.url);
      } catch (error) {
        setState('error');
        setErrorMessage(error instanceof Error ? error.message : 'Video could not be loaded.');
      }
    })();

    requestInFlightRef.current = task;
    try { await task; } finally { requestInFlightRef.current = null; }
  }, [cacheKey, clearCachedPlayback, episode.id, episode.video.available, episode.video.playbackId]);

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
    if (progress && progress.currentTime > 10 && progress.currentTime < video.duration - 30) {
      video.currentTime = progress.currentTime;
      setResumeAt(progress.currentTime);
    }
  };

  const reloadPlayback = () => {
    const video = videoRef.current;
    if (!video || !sourceUrl) {
      void requestPlayback();
      return;
    }
    const currentTime = video.currentTime;
    setState('loading');
    video.load();
    video.addEventListener('loadedmetadata', () => {
      if (Number.isFinite(currentTime)) video.currentTime = currentTime;
      void video.play().catch(() => undefined);
    }, {once: true});
  };

  const handleVideoError = () => {
    if (!automaticRetryRef.current) {
      automaticRetryRef.current = true;
      clearCachedPlayback();
      void requestPlayback(true);
      return;
    }
    setState('error');
    setErrorMessage('Playback link expired or the video file could not be reached.');
  };

  const handleSeekGesture = (event: React.MouseEvent<HTMLVideoElement>) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;
    const position = (event.clientX - event.currentTarget.getBoundingClientRect().left) / event.currentTarget.clientWidth;
    const change = position < 0.5 ? -10 : 10;
    video.currentTime = Math.min(video.duration, Math.max(0, video.currentTime + change));
    setSeekFeedback(change < 0 ? '−10 seconds' : '+10 seconds');
    if (seekTimerRef.current) window.clearTimeout(seekTimerRef.current);
    seekTimerRef.current = window.setTimeout(() => setSeekFeedback(''), 650);
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
    const pauseWhenHidden = () => {
      if (document.hidden) videoRef.current?.pause();
    };
    document.addEventListener('visibilitychange', pauseWhenHidden);
    return () => document.removeEventListener('visibilitychange', pauseWhenHidden);
  }, []);

  useEffect(() => {
    setState('idle');
    setSourceUrl('');
    setErrorMessage('');
    setCinema(false);
    setShowNext(false);
    setSeekFeedback('');
    automaticRetryRef.current = false;
    lastSavedSecondRef.current = 0;
    const progress = readWatchProgress(episode.id);
    setResumeAt(progress?.currentTime ?? 0);
    return () => {
      if (seekTimerRef.current) window.clearTimeout(seekTimerRef.current);
    };
  }, [episode.id]);

  const nextHref = nextEpisode
    ? `/series/${nextEpisode.seriesSlug}/season/${nextEpisode.season}/episode/${nextEpisode.episode}/`
    : '';

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
        onContextMenu={(event) => event.preventDefault()}
        onDoubleClick={handleSeekGesture}
        onLoadedMetadata={restoreProgress}
        onCanPlay={() => setState('ready')}
        onTimeUpdate={trackProgress}
        onPlay={() => saveLastWatched(episode.id)}
        onEnded={() => {
          clearWatchProgress(episode.id);
          setShowNext(Boolean(nextEpisode?.video.available));
        }}
        onError={handleVideoError}
      /> : episode.video.available ? <button className="player-facade" type="button" onClick={() => requestPlayback()} aria-label={`Play ${episode.title}`}>
        <Image src={episode.thumbnail} alt="" fill priority sizes="100vw" />
        <span className="player-shade" />
        <span className="player-play"><Play fill="currentColor" /></span>
        <span className="player-label">{resumeAt > 10 ? `Resume ${episode.title} from ${formatTime(resumeAt)}` : `Tap to play ${episode.title}`}</span>
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
        <button type="button" onClick={() => requestPlayback(true)}>Try again</button>
      </div> : null}
      {seekFeedback ? <div className="seek-feedback" aria-live="polite">{seekFeedback}</div> : null}
      {showNext && nextEpisode ? <div className="next-episode-overlay">
        <span>EPISODE COMPLETE</span>
        <strong>Up next: {nextEpisode.title}</strong>
        <div>
          <button type="button" onClick={() => {
            const video = videoRef.current;
            setShowNext(false);
            if (video) { video.currentTime = 0; void video.play().catch(() => undefined); }
          }}><RotateCcw /> Replay</button>
          <Link href={nextHref}><SkipForward /> Watch next</Link>
        </div>
      </div> : null}
    </div>
    <div className="player-toolbar">
      <span><ShieldCheck /> Private NovaStream playback</span>
      <div>
        <button type="button" onClick={reloadPlayback} title="Reload player" disabled={!episode.video.available}><RefreshCw /><span>Reload</span></button>
        <button type="button" onClick={() => setCinema((value) => !value)} aria-pressed={cinema} title="Cinema mode">{cinema ? <Sun /> : <Moon />}<span>Cinema</span></button>
        <button type="button" onClick={toggleFullscreen} title="Fullscreen">{fullscreen ? <Minimize /> : <Maximize />}<span>Full screen</span></button>
      </div>
    </div>
  </div>;
}
