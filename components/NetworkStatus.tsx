'use client';

import {WifiOff} from 'lucide-react';
import {useEffect, useState} from 'react';

export default function NetworkStatus() {
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);
  return offline ? <div className="network-status" role="status"><WifiOff /> You are offline. Video playback needs an internet connection.</div> : null;
}
