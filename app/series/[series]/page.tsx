import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {Play} from 'lucide-react';
import EpisodeCard from '@/components/EpisodeCard';
import SaveButton from '@/components/SaveButton';
import SeasonPicker from '@/components/SeasonPicker';
import {getSeries, getSeriesEpisodes, seriesList} from '@/data/catalog';

type SeriesPageProps = {params: Promise<{series: string}>};

export function generateStaticParams() {
  return seriesList.map((item) => ({series: item.slug}));
}

export async function generateMetadata({params}: SeriesPageProps): Promise<Metadata> {
  const {series: slug} = await params;
  const seriesItem = getSeries(slug);
  return seriesItem
    ? {title: seriesItem.shortTitle, description: seriesItem.description}
    : {title: 'Series not found'};
}

export default async function SeriesPage({params}: SeriesPageProps) {
  const {series: slug} = await params;
  const seriesItem = getSeries(slug);
  if (!seriesItem) notFound();

  const items = getSeriesEpisodes(seriesItem.slug);
  const firstEpisode = items[0];
  if (!firstEpisode) notFound();

  const availableSeasons = [...new Set(items.map((episode) => episode.season))].sort((a, b) => b - a);
  const featuredSeason = availableSeasons[0];

  return <main>
    <section className="series-banner">
      <picture aria-hidden="true"><source media="(max-width:700px)" srcSet={seriesItem.heroMobile} /><img src={seriesItem.heroDesktop} alt="" width="1600" height="900" /></picture>
      <div className="series-banner-shade" />
      <div className="series-banner-copy">
        <span className="brand-kicker"><b>N</b> ORIGINAL SERIES</span>
        <h1>{seriesItem.shortTitle}</h1>
        <div className="meta-row"><strong>{seriesItem.status}</strong><span>{items.length} Episodes</span><span>HD</span></div>
        <p>{seriesItem.description}</p>
        <div className="hero-actions">
          <Link className="button primary" href={`/series/${seriesItem.slug}/season/${firstEpisode.season}/episode/${firstEpisode.episode}/`}><Play /> Play Episode 1</Link>
          <SaveButton kind="series" id={seriesItem.slug} />
        </div>
      </div>
    </section>
    <div className="series-content">
      <div className="season-head"><div><span>EPISODE GUIDE</span><h2>Season {featuredSeason}</h2></div><SeasonPicker seriesSlug={seriesItem.slug} seasons={availableSeasons} selected={featuredSeason} /></div>
      <div className="episode-list-pro">{items.filter((episode) => episode.season === featuredSeason).map((episode) => <EpisodeCard episode={episode} key={episode.id} />)}</div>
      <section className="about-series">
        <div><span>ABOUT</span><h2>{seriesItem.title}</h2><p>{seriesItem.description}</p></div>
        <dl><div><dt>Country</dt><dd>{seriesItem.country}</dd></div><div><dt>Language</dt><dd>{seriesItem.language}</dd></div><div><dt>Genres</dt><dd>{seriesItem.genres.join(', ')}</dd></div><div><dt>Available</dt><dd>{items.length} episodes</dd></div></dl>
      </section>
    </div>
  </main>;
}
