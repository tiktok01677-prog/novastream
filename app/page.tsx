import Hero from '@/components/Hero';
import EpisodeRail from '@/components/EpisodeRail';
import ContinueWatching from '@/components/ContinueWatching';
import SeriesCard from '@/components/SeriesCard';
import {episodes, seriesList} from '@/data/catalog';

export default function Home() {
  return <main>
    <Hero />
    <div className="home-content">
      <ContinueWatching />
      <EpisodeRail id="episodes" eyebrow="NOW STREAMING" title="Season 4 Episodes" items={episodes} />
      <section className="content-section">
        <header className="section-heading"><div><span>FEATURED SERIES</span><h2>Explore the story</h2></div></header>
        <div className="series-grid">{seriesList.map((item) => <SeriesCard item={item} key={item.slug} />)}</div>
      </section>
      <section className="platform-note">
        <span>01</span>
        <div><small>NOVASTREAM</small><h2>One home for powerful stories.</h2><p>Fast playback, a clean watch list and a catalogue designed to grow with new licensed dramas.</p></div>
      </section>
    </div>
  </main>;
}
