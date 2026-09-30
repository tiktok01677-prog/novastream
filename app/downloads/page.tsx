import type {Metadata} from 'next';
import DownloadsContent from '@/components/DownloadsContent';

export const metadata: Metadata = {title: 'Downloads'};

export default function DownloadsPage() {
  return <main className="page-shell downloads-page">
    <div className="page-intro"><span>OFFLINE LIBRARY</span><h1>Downloads</h1><p>Episodes saved privately inside the NovaStream Android app.</p></div>
    <DownloadsContent />
  </main>;
}
