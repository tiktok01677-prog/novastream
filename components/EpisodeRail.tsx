import type {Episode} from '@/data/catalog';
import EpisodeCard from './EpisodeCard';

export default function EpisodeRail({title, eyebrow, items, id}:{title:string; eyebrow?:string; items:Episode[]; id?:string}) {
  const availableCount = items.filter((item) => item.video.available).length;
  return <section className="content-section" id={id}>
    <header className="section-heading">
      <div>{eyebrow ? <span>{eyebrow}</span> : null}<h2>{title}</h2></div>
      <small>{availableCount} available</small>
    </header>
    <div className="episode-rail">
      {items.map((episode, index) => <EpisodeCard episode={episode} priority={index === 0} key={episode.id} />)}
    </div>
  </section>;
}
