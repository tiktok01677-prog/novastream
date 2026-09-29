import type {Metadata} from 'next';
import SearchExperience from '@/components/SearchExperience';

export const metadata:Metadata = {title:'Search'};

export default function SearchPage() {
  return <main className="page-shell search-page">
    <div className="page-intro"><span>FIND YOUR STORY</span><h1>Search</h1></div>
    <SearchExperience />
  </main>;
}
