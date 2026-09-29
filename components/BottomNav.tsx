'use client';

import Link from 'next/link';
import {Bookmark, Clapperboard, Home, Search} from 'lucide-react';
import {usePathname} from 'next/navigation';

const items = [
  {href: '/', label: 'Home', Icon: Home},
  {href: '/browse/', label: 'Browse', Icon: Clapperboard},
  {href: '/search/', label: 'Search', Icon: Search},
  {href: '/my-list/', label: 'Saved', Icon: Bookmark},
];

export default function BottomNav() {
  const pathname = usePathname();
  return <nav className="bottom-nav" aria-label="App navigation">
    {items.map(({href, label, Icon}) => {
      const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
      return <Link className={active ? 'active' : ''} href={href} key={href} aria-current={active ? 'page' : undefined}>
        <Icon aria-hidden="true" />
        <span>{label}</span>
      </Link>;
    })}
  </nav>;
}
