import type {Metadata, Viewport} from 'next';
import Script from 'next/script';
import './globals.css';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import Splash from '@/components/Splash';
import NetworkStatus from '@/components/NetworkStatus';
import Footer from '@/components/Footer';
import NativeDownloadBridge from '@/components/NativeDownloadBridge';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';

const splashStateScript = `
  (function () {
    try {
      if (window.sessionStorage.getItem('novastream:intro-seen') === '1') {
        document.documentElement.classList.add('intro-seen');
      }
    } catch (_) {}
  })();
`;

export const metadata: Metadata = {
  title: {default: 'NovaStream — Stories Beyond Borders', template: '%s | NovaStream'},
  description: 'A cinematic streaming experience for stories beyond borders.',
  manifest: '/manifest.webmanifest',
  icons: {icon: '/icon.svg'},
  robots: {index: false, follow: false},
};

export const viewport: Viewport = {
  themeColor: '#050505',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en">
    <body>
      <Script id="novastream-splash-state" strategy="beforeInteractive">{splashStateScript}</Script>
      <ServiceWorkerRegister />
      <NativeDownloadBridge />
      <Splash />
      <NetworkStatus />
      <Header />
      <div className="app-content">{children}</div>
      <Footer />
      <BottomNav />
    </body>
  </html>;
}
