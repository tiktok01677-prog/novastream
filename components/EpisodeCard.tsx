import Link from 'next/link';
import Image from 'next/image';
import {Play} from 'lucide-react';
import type {Episode} from '@/data/catalog';

export function episodeHref(episode: Episode) {
  return `/series/${episode.seriesSlug}/season/${episode.season}/episode/${episode.episode}/`;
}

export default function EpisodeCard({episode, priority = false}:{episode:Episode; priority?:boolean}) {
  return <Link className="episode-card" href={episodeHref(episode)}>
    <div className="episode-thumb">
      <Image src={episode.thumbnail} alt={`${episode.title} thumbnail`} fill sizes="(max-width: 700px) 83vw, (max-width: 1000px) 45vw, 31vw" priority={priority} />
      <span className="episode-number">S{episode.season} · E{episode.episode}</span>
      <span className="card-play"><Play fill="currentColor" /></span>
    </div>
    <div className="episode-card-copy">
      <div><strong>{episode.title}</strong><span>HD</span></div>
      <small>{episode.label}</small>
    </div>
  </Link>;
}
