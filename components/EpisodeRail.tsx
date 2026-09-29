import type {Episode} from '@/data/catalog';
import EpisodeCard from './EpisodeCard';

export default function EpisodeRail({title, eyebrow, items, id}:{title:string; eyebrow?:string; items:Episode[]; id?:string}) {
  return <section className="content-section" id={id}>
    <header className="section-heading">
      <div>{eyebrow ? <span>{eyebrow}</span> : null}<h2>{title}</h2></div>
      <small>{items.length} available</small>
    </header>
    <div className="episode-rail">
      {items.map((episode, index) => <EpisodeCard episode={episode} priority={index === 0} key={episode.id} />)}
    </div>
  </section>;
}
