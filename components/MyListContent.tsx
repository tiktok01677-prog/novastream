'use client';

import Link from 'next/link';
import {Bookmark} from 'lucide-react';
import {episodes, seriesList} from '@/data/catalog';
import {LIBRARY_EVENT, readLibrary, type SavedLibrary} from '@/lib/local-library';
import {useEffect, useState} from 'react';
import EpisodeCard from './EpisodeCard';
import SeriesCard from './SeriesCard';

export default function MyListContent() {
  const [library, setLibrary] = useState<SavedLibrary | null>(null);
  useEffect(() => {
    const update = () => setLibrary(readLibrary());
    update();
    window.addEventListener(LIBRARY_EVENT, update);
    return () => window.removeEventListener(LIBRARY_EVENT, update);
  }, []);

  if (!library) return <div className="card-skeleton" aria-label="Loading saved titles" />;
  const savedEpisodes = episodes.filter((episode) => library.episodes.includes(episode.id));
  const savedSeries = seriesList.filter((item) => library.series.includes(item.slug));

  if (savedSeries.length === 0 && savedEpisodes.length === 0) return <div className="empty-state">
    <Bookmark />
    <h2>Your list is waiting</h2>
    <p>Save a series or episode and it will stay on this device—no account needed.</p>
    <Link className="button primary" href="/browse/">Browse titles</Link>
  </div>;

  return <>
    {savedSeries.length ? <section className="content-section flush"><header className="section-heading"><div><span>SAVED SERIES</span><h2>Series</h2></div></header><div className="series-grid">{savedSeries.map((item) => <SeriesCard item={item} key={item.slug} />)}</div></section> : null}
    {savedEpisodes.length ? <section className="content-section flush"><header className="section-heading"><div><span>SAVED EPISODES</span><h2>Episodes</h2></div></header><div className="episode-grid">{savedEpisodes.map((episode) => <EpisodeCard episode={episode} key={episode.id} />)}</div></section> : null}
  </>;
}
