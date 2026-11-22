import Link from 'next/link';
import './globals.css';
import { meta, project, stripTags } from '../lib/pim';

export const metadata = {
  title: `${project.name} | ${project.location?.city ?? ''}`,
  description: stripTags(project.description).slice(0, 160),
};

export default function RootLayout({ children }) {
  return (
    <html lang="nl">
      <body>
        <header className="site-header">
          <div className="container header-inner">
            <Link href="/" className="brand">
              {project.name}
            </Link>
            <nav className="nav">
              <Link href="/">Overzicht</Link>
              <Link href="/aanbod/">Aanbod</Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <div className="container">
            <p>
              {project.name} — {project.location?.city}. Data gegenereerd uit een AM PIM MCP snapshot
              van {meta.fetchedAt.slice(0, 10)}.
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
      </body>
    </html>
  );
}
