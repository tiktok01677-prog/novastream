'use client';

import Link from 'next/link';
import {Play} from 'lucide-react';
import {episodes, getSeries} from '@/data/catalog';
import {episodeHref} from './EpisodeCard';
import {readLastWatched, WATCH_EVENT} from '@/lib/local-library';
import {useEffect, useState} from 'react';

export default function ContinueWatching() {
  const [episodeId, setEpisodeId] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setEpisodeId(readLastWatched()?.episodeId ?? null);
    update();
    window.addEventListener(WATCH_EVENT, update);
    return () => window.removeEventListener(WATCH_EVENT, update);
  }, []);

  const episode = episodes.find((item) => item.id === episodeId);
  if (!episode) return null;
  const seriesItem = getSeries(episode.seriesSlug);

  return <section className="content-section continue-section">
    <header className="section-heading"><div><span>JUMP BACK IN</span><h2>Continue Watching</h2></div></header>
    <Link className="continue-card" href={episodeHref(episode)}>
      <img src={episode.thumbnail} alt="" width="1280" height="720" />
      <span className="continue-play"><Play fill="currentColor" /></span>
      <div><small>{seriesItem?.shortTitle ?? 'NOVASTREAM'}</small><strong>Season {episode.season} · {episode.title}</strong><p>Continue from your last visit</p></div>
    </Link>
  </section>;
}
