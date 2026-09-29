'use client';

import {useEffect, useState} from 'react';
import {readWatchProgress, WATCH_EVENT} from '@/lib/local-library';

export default function EpisodeProgress({episodeId, compact = false}:{episodeId:string; compact?:boolean}) {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const update = () => {
      const progress = readWatchProgress(episodeId);
      const next = progress && progress.duration > 0 ? (progress.currentTime / progress.duration) * 100 : 0;
      setPercent(Math.min(100, Math.max(0, next)));
    };
    update();
    window.addEventListener(WATCH_EVENT, update);
    return () => window.removeEventListener(WATCH_EVENT, update);
  }, [episodeId]);

  if (percent < 1) return null;
  return <span className={`watch-progress${compact ? ' compact' : ''}`} aria-label={`${Math.round(percent)} percent watched`}>
    <i style={{width: `${percent}%`}} />
  </span>;
}
