'use client';

import {RefreshCcw} from 'lucide-react';

export default function ErrorPage({reset}:{error:Error & {digest?:string};reset:()=>void}) {
  return <main className="not-found"><span>!</span><h1>Something interrupted the story</h1><p>Check your connection and try loading this screen again.</p><button className="button primary" type="button" onClick={reset}><RefreshCcw /> Try Again</button></main>;
}
