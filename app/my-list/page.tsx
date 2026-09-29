import type {Metadata} from 'next';
import MyListContent from '@/components/MyListContent';

export const metadata:Metadata = {title:'My List'};

export default function MyListPage() {
  return <main className="page-shell">
    <div className="page-intro"><span>YOUR SPACE</span><h1>My List</h1><p>Saved on this device. No account required.</p></div>
    <MyListContent />
  </main>;
}
