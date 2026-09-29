import Link from 'next/link';
import {Play} from 'lucide-react';
import {getSeriesEpisodes, type Series} from '@/data/catalog';

export default function SeriesCard({item}:{item:Series}) {
  const episodeCount = getSeriesEpisodes(item.slug).length;
  return <Link className="series-card" href={`/series/${item.slug}/`}>
    <img src={item.heroDesktop} alt={item.shortTitle} width="1600" height="900" loading="lazy" />
    <div className="series-card-overlay">
      <span className="brand-kicker"><b>N</b> SERIES</span>
      <h3>{item.shortTitle}</h3>
      <p>{item.status} · {episodeCount} Episodes</p>
      <i><Play fill="currentColor" /></i>
    </div>
  </Link>;
}
