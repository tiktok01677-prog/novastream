'use client';

import {useEffect} from 'react';
import {DOWNLOAD_EVENT, receiveDownloadSnapshot, readDownloads} from '@/lib/native-downloads';

export default function NativeDownloadBridge() {
  useEffect(() => {
    window.NovaStreamDownloads = {receive: receiveDownloadSnapshot};
    document.documentElement.dataset.nativeApp = window.NovaStreamAndroid ? 'true' : 'false';
    const downloads = readDownloads();
    window.dispatchEvent(new CustomEvent(DOWNLOAD_EVENT, {detail: downloads}));
    return () => { delete window.NovaStreamDownloads; };
  }, []);
  return null;
}
