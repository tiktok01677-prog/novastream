import Link from 'next/link';

export default function NotFound() {
  return <main className="not-found"><span>404</span><h1>This story is not here</h1><p>The page may have moved or the episode is not available yet.</p><Link className="button primary" href="/">Back to Home</Link></main>;
}
