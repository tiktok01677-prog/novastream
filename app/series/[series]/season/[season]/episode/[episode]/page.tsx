import type {Metadata} from 'next';
import Link from 'next/link';
import {ChevronLeft, ChevronRight} from 'lucide-react';
import {notFound} from 'next/navigation';
import EpisodeRail from '@/components/EpisodeRail';
import VideoPlayer from '@/components/VideoPlayer';
import WatchActions from '@/components/WatchActions';
import {episodes, getAdjacentEpisodes, getEpisode, getSeries, getSeriesEpisodes} from '@/data/catalog';
import {episodeHref} from '@/components/EpisodeCard';

type EpisodePageProps = {params: Promise<{series: string; season: string; episode: string}>};

export function generateStaticParams() {
  return episodes.map((episode) => ({
    series: episode.seriesSlug,
    season: String(episode.season),
    episode: String(episode.episode),
  }));
}

export async function generateMetadata({params}: EpisodePageProps): Promise<Metadata> {
  const values = await params;
  const episode = getEpisode(values.series, Number(values.season), Number(values.episode));
  const seriesItem = getSeries(values.series);
  return episode && seriesItem
    ? {title: `${episode.title} · Season ${episode.season} · ${seriesItem.shortTitle}`, description: episode.description}
    : {title: 'Episode not found'};
}

export default async function EpisodePage({params}: EpisodePageProps) {
  const values = await params;
  const episode = getEpisode(values.series, Number(values.season), Number(values.episode));
  const seriesItem = getSeries(values.series);
  if (!episode || !seriesItem) notFound();

  const adjacent = getAdjacentEpisodes(episode);
  const seasonEpisodes = getSeriesEpisodes(seriesItem.slug).filter((item) => item.season === episode.season);

  return <main className="watch-page">
    <VideoPlayer episode={episode} seriesTitle={seriesItem.shortTitle} />
    <div className="watch-layout">
      <section className="watch-main">
        <div className="watch-title-row">
          <div><span className="brand-kicker"><b>N</b> NOW PLAYING</span><h1>{seriesItem.shortTitle}</h1><h2>Season {episode.season} · {episode.title}</h2></div>
          <WatchActions episode={episode} seriesTitle={seriesItem.shortTitle} />
        </div>
        <div className="watch-meta"><strong>{episode.video.available ? 'Available now' : 'Coming soon'}</strong><span>MP4</span><span>Private in-app playback</span></div>
        <p className="watch-description">{episode.description}</p>
        <div className="episode-navigation">
          {adjacent.previous ? <Link href={episodeHref(adjacent.previous)}><ChevronLeft /><span><small>PREVIOUS</small>{adjacent.previous.title}</span></Link> : <span />}
          {adjacent.next ? <Link href={episodeHref(adjacent.next)}><span><small>UP NEXT</small>{adjacent.next.title}</span><ChevronRight /></Link> : <span />}
        </div>
      </section>
      <aside className="watch-sidebar">
        <h3>Episode details</h3>
        <dl><div><dt>Series</dt><dd>{seriesItem.shortTitle}</dd></div><div><dt>Season</dt><dd>{episode.season}</dd></div><div><dt>Episode</dt><dd>{episode.episode}</dd></div><div><dt>Country</dt><dd>{seriesItem.country}</dd></div><div><dt>Language</dt><dd>{seriesItem.language}</dd></div><div><dt>Genres</dt><dd>{seriesItem.genres.join(', ')}</dd></div></dl>
        <details><summary>Playback help</summary><p>If playback stops, check your connection and tap “Reload”. Your watch position is saved on this device and playback stays inside NovaStream.</p></details>
      </aside>
    </div>
    <EpisodeRail eyebrow={`MORE FROM SEASON ${episode.season}`} title="All Episodes" items={seasonEpisodes} />
  </main>;
}
