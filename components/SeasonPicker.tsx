'use client';

import {useRouter} from 'next/navigation';

export default function SeasonPicker({seriesSlug, seasons, selected}:{seriesSlug:string; seasons:number[]; selected:number}) {
  const router = useRouter();
  return <select
    aria-label="Select season"
    value={selected}
    onChange={(event) => router.push(`/series/${seriesSlug}/season/${event.target.value}/`)}
  >
    {seasons.map((season) => <option value={season} key={season}>Season {season}</option>)}
  </select>;
}
