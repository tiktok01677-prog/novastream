import Link from 'next/link';

export default function Footer() {
  return <footer className="footer">
    <img src="/logo.svg" alt="NovaStream" width="720" height="180" />
    <p>Stories Beyond Borders</p>
    <div><Link href="/">Home</Link><Link href="/browse/">Browse</Link><Link href="/my-list/">My List</Link></div>
    <small>© 2026 NovaStream</small>
  </footer>;
}
