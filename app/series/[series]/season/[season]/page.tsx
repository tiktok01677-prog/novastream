import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import EpisodeCard from '@/components/EpisodeCard';
import {episodes, getSeries, getSeriesEpisodes} from '@/data/catalog';

type SeasonPageProps = {params: Promise<{series: string; season: string}>};

export function generateStaticParams() {
  const routes = new Map<string, {series: string; season: string}>();
  for (const episode of episodes) {
    const params = {series: episode.seriesSlug, season: String(episode.season)};
    routes.set(`${params.series}:${params.season}`, params);
  }
  return [...routes.values()];
}

export async function generateMetadata({params}: SeasonPageProps): Promise<Metadata> {
  const {series: slug, season} = await params;
  const seriesItem = getSeries(slug);
  return seriesItem ? {title: `Season ${season} · ${seriesItem.shortTitle}`} : {title: 'Season not found'};
}

export default async function SeasonPage({params}: SeasonPageProps) {
  const {series: slug, season: value} = await params;
  const season = Number(value);
  const seriesItem = getSeries(slug);
  if (!seriesItem || !Number.isInteger(season)) notFound();

  const items = getSeriesEpisodes(seriesItem.slug).filter((episode) => episode.season === season);
  if (!items.length) notFound();

  return <main className="page-shell season-page">
    <div className="season-masthead"><img src={seriesItem.heroDesktop} alt="" width="1600" height="900" /><div><Link href={`/series/${seriesItem.slug}/`}>← {seriesItem.shortTitle}</Link><span>EPISODE GUIDE</span><h1>Season {season}</h1><p>{items.length} episodes available</p></div></div>
    <div className="episode-grid season-grid">{items.map((episode) => <EpisodeCard episode={episode} key={episode.id} />)}</div>
  </main>;
}
