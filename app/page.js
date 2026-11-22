import Link from 'next/link';
import MapSvg from './MapSvg';
import {
  project,
  housetypes,
  availabilityOf,
  formatPrice,
  priceRangeLabel,
  imgUrl,
  stripTags,
} from '../lib/pim';

const heroImage = project.images?.length ? imgUrl(project.images[0], '2k') || imgUrl(project.images[0], 'original') : null;

function Fact({ label, value }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="fact">
      <span className="fact-label">{label}</span>
      <span className="fact-value">{value}</span>
    </div>
  );
}

export default function HomePage() {
  const available = project.houses_available ?? 0;
  const total = project.expectedHouses ?? housetypes.reduce((n, ht) => n + availabilityOf(ht).total, 0);

  return (
    <>
      <section className="hero">
        {heroImage && <img src={heroImage} alt={project.name} className="hero-img" />}
        <div className="hero-overlay container">
          <h1>{project.name}</h1>
          <p className="hero-sub">{project.location?.city}</p>
          <div className="badges">
            {project.status && <span className="badge badge-status">{project.status}</span>}
            {project.progress && <span className="badge">{project.progress}</span>}
            {project.startSale && <span className="badge">Verkoopstart: {project.startSale}</span>}
          </div>
        </div>
      </section>

      <section className="container facts">
        <Fact label="Koopprijs" value={priceRangeLabel(project['price-range'])} />
        <Fact
          label="Woonoppervlak"
          value={
            project.living_surface_range
              ? `${project.living_surface_range.min} – ${project.living_surface_range.max} m²`
              : null
          }
        />
        <Fact
          label="Kamers"
          value={project.room_count_range ? `${project.room_count_range.min} kamers` : null}
        />
        <Fact label="Woningen" value={`${available} van ${total} beschikbaar`} />
        <Fact label="Bouwjaar" value={project.construction_year} />
        <Fact label="Verkoopvoorwaarde" value={project.sale_condition} />
      </section>

      <section className="container section">
        <h2 className="section-title">Over het project</h2>
        <div className="description" dangerouslySetInnerHTML={{ __html: project.description || '' }} />
      </section>

      {project.images?.length > 1 && (
        <section className="container section">
          <h2 className="section-title">Impressie</h2>
          <div className="gallery">
            {project.images.slice(1).map((img, i) => {
              const src = imgUrl(img, 'large') || imgUrl(img, 'original');
              return src ? <img key={i} src={src} alt={`${project.name} impressie ${i + 1}`} loading="lazy" /> : null;
            })}
          </div>
        </section>
      )}

      {housetypes.length > 0 && (
        <section className="container section">
          <h2 className="section-title">Woningtypes</h2>
          <div className="types-grid">
            {housetypes.map((ht) => {
              const avail = availabilityOf(ht);
              const img = ht.images?.length ? imgUrl(ht.images[0], 'large') || imgUrl(ht.images[0], 'original') : null;
              return (
                <Link href={`/aanbod/#type-${ht.id}`} key={ht.id} className="type-card">
                  {img && <img src={img} alt={ht.name} className="type-img" loading="lazy" />}
                  <div className="type-body">
                    <h3>{ht.name}</h3>
                    <p className="price">{priceRangeLabel(ht.pricerange)}</p>
                    <p className="meta-row">
                      {ht['livingsurface-range']?.min != null && (
                        <span>{ht['livingsurface-range'].min} m²</span>
                      )}
                      {ht['roomcount-range']?.min != null && <span>{ht['roomcount-range'].min} kamers</span>}
                      {ht.bedroom_count_range?.min != null && (
                        <span>{ht.bedroom_count_range.min} slaapkamers</span>
                      )}
                    </p>
                    <p className="avail">{avail.total > 0 ? `${avail.total} beschikbaar` : 'Uitverkocht'}</p>
                  </div>
                </Link>
              );
            })}
          </div>
          <p className="section-more">
            <Link href="/aanbod/">Bekijk alle {total} woningen met bouwnummers, prijzen en plattegronden →</Link>
          </p>
        </section>
      )}

      <section className="container section">
        <h2 className="section-title">Locatie</h2>
        <div className="map-wrap">
          <MapSvg area={project.area} location={project.location} />
          <p>
            {project.name}, {project.location?.city}
            {project.location ? ` — ${project.location.lat.toFixed(5)}, ${project.location.lng.toFixed(5)}` : ''}
          </p>
        </div>
      </section>

      {((project.files?.length ?? 0) > 0 || (project.external_media?.length ?? 0) > 0) && (
        <section className="container section">
          <h2 className="section-title">Brochures & documenten</h2>
          <ul className="download-list">
            {(project.files || []).map((f, i) => (
              <li key={`f-${i}`}>
                <a href={f.file} target="_blank" rel="noreferrer">
                  {f.title || 'Document'} {f.category ? `(${f.category})` : ''}
                </a>
              </li>
            ))}
            {(project.external_media || []).map((m, i) => (
              <li key={`m-${i}`}>
                <a href={m.url} target="_blank" rel="noreferrer">
                  Brochure (Issuu)
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
