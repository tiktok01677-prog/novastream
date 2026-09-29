import type {Metadata} from 'next';
import EpisodeRail from '@/components/EpisodeRail';
import SeriesCard from '@/components/SeriesCard';
import {episodes, seriesList} from '@/data/catalog';

export const metadata:Metadata = {title:'Browse'};

export default function BrowsePage() {
  return <main className="page-shell">
    <div className="page-intro"><span>DISCOVER</span><h1>Browse</h1><p>Explore every title currently available on NovaStream.</p></div>
    <section className="content-section flush"><header className="section-heading"><div><span>SERIES</span><h2>Historical drama</h2></div><small>{seriesList.length} {seriesList.length === 1 ? 'title' : 'titles'}</small></header><div className="series-grid">{seriesList.map((item) => <SeriesCard item={item} key={item.slug} />)}</div></section>
    <EpisodeRail eyebrow="NOW STREAMING" title="Available Episodes" items={episodes} />
  </main>;
}
