import Link from 'next/link';
import {Info, Play} from 'lucide-react';
import {getSeriesEpisodes, series} from '@/data/catalog';
import SaveButton from './SaveButton';

export default function Hero() {
  const seriesEpisodes = getSeriesEpisodes(series.slug);
  const firstEpisode = seriesEpisodes[0];
  const [titleLead, ...titleRest] = series.shortTitle.split(' ');
  return <section className="hero">
    <picture className="hero-art" aria-hidden="true">
      <source media="(max-width: 700px)" srcSet={series.heroMobile} />
      <img src={series.heroDesktop} alt="" width="1600" height="900" fetchPriority="high" />
    </picture>
    <div className="hero-overlay" />
    <div className="hero-content">
      <span className="brand-kicker"><b>N</b> ORIGINAL SERIES</span>
      <h1>{titleLead} <em>{titleRest.join(' ')}</em></h1>
      <div className="meta-row">
        <strong>{series.status}</strong><span>{seriesEpisodes.length} Episodes</span><span>HD</span><i>16+</i>
      </div>
      <p>{series.description}</p>
      <div className="hero-actions">
        <Link className="button primary" href={`/series/${series.slug}/season/${firstEpisode.season}/episode/${firstEpisode.episode}/`}><Play /> Play</Link>
        <Link className="button secondary" href={`/series/${series.slug}/`}><Info /> More Info</Link>
        <SaveButton kind="series" id={series.slug} compact />
      </div>
    </div>
    <a className="hero-scroll" href="#episodes" aria-label="Scroll to episodes"><span /></a>
  </section>;
}
