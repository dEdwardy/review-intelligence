import SiteFooter from '../components/site-footer.jsx';
import './globals.css';

export const metadata = {
  title: 'Review Copilot',
  description: 'Turn App Store reviews into fixes, replies, and roadmap decisions.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
