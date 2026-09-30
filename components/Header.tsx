'use client';

import Image from 'next/image';
import Link from 'next/link';
import {Bookmark, Search} from 'lucide-react';
import {usePathname} from 'next/navigation';

const navigation = [
  {href: '/', label: 'Home'},
  {href: '/browse/', label: 'Browse'},
  {href: '/downloads/', label: 'Downloads'},
  {href: '/my-list/', label: 'My List'},
];

export default function Header() {
  const pathname = usePathname();

  return <header className="header">
    <Link href="/" className="brand" aria-label="NovaStream home">
      <Image src="/logo.svg" alt="NovaStream" width="720" height="180" priority />
    </Link>
    <nav className="desktop-nav" aria-label="Main navigation">
      {navigation.map((item) => <Link className={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)) ? 'active' : ''} href={item.href} key={item.href}>{item.label}</Link>)}
    </nav>
    <div className="header-actions">
      <Link className="header-icon saved-link" href="/my-list/" aria-label="My list"><Bookmark /></Link>
      <Link className="header-icon" href="/search/" aria-label="Search"><Search /></Link>
    </div>
  </header>;
}
