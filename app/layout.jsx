import { IBM_Plex_Sans, Space_Grotesk } from 'next/font/google';
import SiteFooter from '../components/site-footer.jsx';
import './globals.css';

const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-display',
});

const body = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
});

export const metadata = {
  title: 'Review Copilot',
  description: 'Turn App Store reviews into fixes, replies, and roadmap decisions.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
