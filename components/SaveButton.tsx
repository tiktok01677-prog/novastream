'use client';

import {Bookmark, Check} from 'lucide-react';
import {useEffect, useState} from 'react';
import {LIBRARY_EVENT, readLibrary, toggleLibraryItem, type SavedLibrary} from '@/lib/local-library';

export default function SaveButton({kind, id, compact = false}:{kind:keyof SavedLibrary; id:string; compact?:boolean}) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const update = () => setSaved(readLibrary()[kind].includes(id));
    update();
    window.addEventListener(LIBRARY_EVENT, update);
    return () => window.removeEventListener(LIBRARY_EVENT, update);
  }, [id, kind]);

  return <button className={compact ? 'save-button compact' : 'save-button'} type="button" aria-pressed={saved} onClick={() => setSaved(toggleLibraryItem(kind, id))}>
    {saved ? <Check /> : <Bookmark />}
    <span>{saved ? 'Saved' : 'My List'}</span>
  </button>;
}
