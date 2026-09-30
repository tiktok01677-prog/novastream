'use client';

import {useCallback, useEffect, useRef, useState} from 'react';

const SEEN_KEY = 'novastream:intro-seen';
let seenInThisRuntime = false;

export default function Splash() {
  const [phase, setPhase] = useState<'visible' | 'leaving' | 'hidden'>('visible');
  const closing = useRef(false);
  const finishTimer = useRef<number | null>(null);

  const dismiss = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    seenInThisRuntime = true;
    try { window.sessionStorage.setItem(SEEN_KEY, '1'); } catch { /* Storage can be blocked. */ }
    setPhase('leaving');
    finishTimer.current = window.setTimeout(() => {
      document.documentElement.classList.add('intro-seen');
      setPhase('hidden');
    }, 560);
  }, []);

  useEffect(() => {
    try {
      if (seenInThisRuntime || window.sessionStorage.getItem(SEEN_KEY) === '1') {
        document.documentElement.classList.add('intro-seen');
        setPhase('hidden');
        return;
      }
    } catch { /* Keep the intro available if storage is blocked. */ }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(dismiss, reduceMotion ? 320 : 1650);
    return () => {
      window.clearTimeout(timer);
      if (finishTimer.current) window.clearTimeout(finishTimer.current);
    };
  }, [dismiss]);

  if (phase === 'hidden') return null;

  return <div className={`splash${phase === 'leaving' ? ' is-leaving' : ''}`} role="status" aria-label="Opening NovaStream">
    <div className="splash-vignette" aria-hidden="true" />
    <div className="splash-grain" aria-hidden="true" />
    <div className="splash-flare" aria-hidden="true" />
    <div className="splash-ring" aria-hidden="true" />
    <div className="splash-content">
      <div className="splash-mark" aria-hidden="true"><span>N</span><span>S</span></div>
      <div className="splash-line" aria-hidden="true"><i /></div>
    </div>
    <button type="button" onClick={dismiss}>Skip Intro</button>
  </div>;
}
