'use client';

import {Search, X} from 'lucide-react';
import {useDeferredValue, useState} from 'react';
import {episodes, getSeries, seriesList} from '@/data/catalog';
import EpisodeCard from './EpisodeCard';
import SeriesCard from './SeriesCard';

export default function SearchExperience() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const seriesMatches = seriesList.filter((item) => {
    const searchable = `${item.title} ${item.shortTitle} ${item.genres.join(' ')} ${item.country}`.toLowerCase();
    return !deferredQuery || searchable.includes(deferredQuery);
  });
  const episodeMatches = episodes.filter((episode) => {
    const seriesItem = getSeries(episode.seriesSlug);
    const searchable = `${seriesItem?.title ?? ''} ${seriesItem?.shortTitle ?? ''} season ${episode.season} episode ${episode.episode} ${episode.title} ${episode.label}`.toLowerCase();
    return !deferredQuery || searchable.includes(deferredQuery);
  });
  const empty = seriesMatches.length === 0 && episodeMatches.length === 0;

  return <>
    <label className="search-box">
      <Search aria-hidden="true" />
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search series and episodes" autoComplete="off" autoFocus />
      {query ? <button type="button" onClick={() => setQuery('')} aria-label="Clear search"><X /></button> : null}
    </label>
    {empty ? <div className="empty-state compact"><Search /><h2>No results found</h2><p>Try “Fatih”, “Season 4” or “Episode 2”.</p></div> : null}
    {seriesMatches.length ? <section className="content-section flush search-results"><header className="section-heading"><div><span>TOP RESULT</span><h2>Series</h2></div></header><div className="series-grid">{seriesMatches.map((item) => <SeriesCard item={item} key={item.slug} />)}</div></section> : null}
    {episodeMatches.length ? <section className="content-section flush search-results"><header className="section-heading"><div><span>AVAILABLE NOW</span><h2>Episodes</h2></div></header><div className="episode-grid">{episodeMatches.map((episode) => <EpisodeCard episode={episode} key={episode.id} />)}</div></section> : null}
  </>;
}
