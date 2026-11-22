import Link from 'next/link';
import './globals.css';
import { meta, project, stripTags } from '../lib/pim';
import { JsonLd, projectJsonLd } from '../lib/jsonld';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://eilandenvanhainfase1b.vercel.app';
const description = stripTags(project.description).slice(0, 160);

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: `${project.name} | ${project.location?.city ?? ''}`,
  description,
  openGraph: {
    title: `${project.name} | ${project.location?.city ?? ''}`,
    description,
    type: 'website',
    url: '/',
    images: project.images?.length ? [project.images[0].sizes?.original] : [],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="nl">
      <body>
        <a href="#main" className="skip-link">
          Direct naar inhoud
        </a>
        <header className="site-header">
          <div className="container header-inner">
            <Link href="/" className="brand">
              {project.name}
            </Link>
            <nav className="nav" aria-label="Hoofdnavigatie">
              <Link href="/">Overzicht</Link>
              <Link href="/aanbod/">Aanbod</Link>
            </nav>
          </div>
        </header>
        <main id="main">{children}</main>
        <footer className="site-footer">
          <div className="container">
            <p>
              {project.name} — {project.location?.city}. Data gegenereerd uit een AM PIM MCP
              snapshot van <time dateTime={meta.fetchedAt}>{meta.fetchedAt.slice(0, 10)}</time>.
              Machineleesbaar: <Link href="/pim/snapshot.json">/pim/snapshot.json</Link> ·{' '}
              <Link href="/llms.txt">/llms.txt</Link>
            </p>
            {project.website && (
              <p>
                <a href={project.website} target="_blank" rel="noreferrer">
                  Officiële projectpagina
                </a>
              </p>
            )}
          </div>
        </footer>
        <JsonLd data={projectJsonLd(project)} />
      </body>
    </html>
  );
}
