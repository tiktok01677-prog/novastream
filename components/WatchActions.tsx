'use client';

import {Check, Share2} from 'lucide-react';
import {useState} from 'react';
import type {Episode} from '@/data/catalog';
import SaveButton from './SaveButton';
import DownloadAction from './DownloadAction';

export default function WatchActions({episode, seriesTitle}:{episode:Episode; seriesTitle:string}) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const data = {title: `${seriesTitle} · ${episode.title}`, text: `Watch Season ${episode.season}, ${episode.title} on NovaStream`, url: window.location.href};
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      }
    } catch { /* Closing the system share sheet needs no error state. */ }
  };

  return <div className="watch-actions">
    <DownloadAction episode={episode} seriesTitle={seriesTitle} />
    <SaveButton kind="episodes" id={episode.id} />
    <button className="save-button" type="button" onClick={share}>{copied ? <Check /> : <Share2 />}<span>{copied ? 'Copied' : 'Share'}</span></button>
  </div>;
}
