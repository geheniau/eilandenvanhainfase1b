'use client';

import { useMemo, useState } from 'react';
import {
  housetypes,
  allHouses,
  availabilityOf,
  priceRangeLabel,
  housePrice,
  imgUrl,
  statusClass,
} from '../../lib/pim';

const houses = allHouses();

export default function AanbodPage() {
  const [status, setStatus] = useState('alle');
  const [typeId, setTypeId] = useState('alle');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('prijs-asc');

  const statuses = useMemo(() => [...new Set(houses.map((h) => h.status).filter(Boolean))], []);

  const filtered = useMemo(() => {
    let list = houses.filter((h) => {
      if (status !== 'alle' && h.status !== status) return false;
      if (typeId !== 'alle' && String(h.housetypeId) !== typeId) return false;
      const price = housePrice(h)?.min ?? housePrice(h)?.max;
      if (minPrice && (price == null || price < Number(minPrice))) return false;
      if (maxPrice && (price == null || price > Number(maxPrice))) return false;
      return true;
    });
    const byPrice = (a, b) => (housePrice(a)?.min ?? 0) - (housePrice(b)?.min ?? 0);
    if (sort === 'prijs-asc') list = [...list].sort(byPrice);
    if (sort === 'prijs-desc') list = [...list].sort((a, b) => byPrice(b, a));
    if (sort === 'bouwnummer') list = [...list].sort((a, b) => String(a.build_id).localeCompare(String(b.build_id), 'nl', { numeric: true }));
    return list;
  }, [status, typeId, minPrice, maxPrice, sort]);

  const groups = useMemo(() => {
    const map = new Map();
    for (const h of filtered) {
      const key = h.housetypeId ?? 0;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(h);
    }
    return housetypes
      .filter((ht) => map.has(ht.id))
      .map((ht) => ({ housetype: ht, houses: map.get(ht.id) }));
  }, [filtered]);

  const forSale = houses.filter((h) => (h.status || '').toLowerCase().includes('koop')).length;

  return (
    <div className="container section">
      <h1 className="section-title">Aanbod</h1>
      <p className="lead">
        {forSale} van {houses.length} woningen te koop — bouwnummers, prijzen en plattegronden uit de PIM.
      </p>

      <div className="filter-bar">
        <label className="filter">
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="alle">Alle</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="filter">
          Woningtype
          <select value={typeId} onChange={(e) => setTypeId(e.target.value)}>
            <option value="alle">Alle types</option>
            {housetypes.map((ht) => (
              <option key={ht.id} value={ht.id}>
                {ht.name}
              </option>
            ))}
          </select>
        </label>
        <label className="filter">
          Min. prijs (€)
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="bijv. 600000"
            min="0"
            step="5000"
          />
        </label>
        <label className="filter">
          Max. prijs (€)
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="bijv. 700000"
            min="0"
            step="5000"
          />
        </label>
        <label className="filter">
          Sorteren
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="prijs-asc">Prijs oplopend</option>
            <option value="prijs-desc">Prijs aflopend</option>
            <option value="bouwnummer">Bouwnummer</option>
          </select>
        </label>
      </div>

      <p className="result-count">{filtered.length} woningen gevonden</p>

      {groups.map(({ housetype: ht, houses: hs }) => {
        const avail = availabilityOf(ht);
        const img = ht.images?.length ? imgUrl(ht.images[0], 'normal') || imgUrl(ht.images[0], 'original') : null;
        return (
          <section key={ht.id} id={`type-${ht.id}`} className="house-group">
            <div className="group-header">
              {img && <img src={img} alt={ht.name} className="group-img" loading="lazy" />}
              <div>
                <h2>{ht.name}</h2>
                <p className="meta-row">
                  <span>{priceRangeLabel(ht.pricerange)}</span>
                  {ht['livingsurface-range']?.min != null && <span>{ht['livingsurface-range'].min} m²</span>}
                  {ht['roomcount-range']?.min != null && <span>{ht['roomcount-range'].min} kamers</span>}
                  <span>{avail.total} beschikbaar</span>
                </p>
              </div>
            </div>
            <div className="house-grid">
              {hs.map((h) => {
                const price = housePrice(h);
                return (
                  <article key={h.id} className="house-card">
                    <div className="house-top">
                      <strong>Bouwnummer {h.build_id}</strong>
                      <span className={statusClass(h.status)}>{h.status}</span>
                    </div>
                    <p className="price">{priceRangeLabel(price)}</p>
                    <dl className="specs">
                      {h.living_surface != null && (
                        <div className="spec">
                          <dt>Woonopp.</dt>
                          <dd>{h.living_surface} m²</dd>
                        </div>
                      )}
                      {h.room_count != null && (
                        <div className="spec">
                          <dt>Kamers</dt>
                          <dd>{h.room_count}</dd>
                        </div>
                      )}
                      {h.bedroom_count != null && (
                        <div className="spec">
                          <dt>Slaapk.</dt>
                          <dd>{h.bedroom_count}</dd>
                        </div>
                      )}
                      {h.energy_label && (
                        <div className="spec">
                          <dt>Energie</dt>
                          <dd>{h.energy_label}</dd>
                        </div>
                      )}
                      {h.model && (
                        <div className="spec">
                          <dt>Model</dt>
                          <dd>{h.model}</dd>
                        </div>
                      )}
                    </dl>
                    <div className="house-links">
                      {(h.floorplans || []).map((fp, i) => (
                        <a key={`fp-${i}`} href={fp.link} target="_blank" rel="noreferrer">
                          Plattegrond
                        </a>
                      ))}
                      {(h.files || []).map((f, i) => (
                        <a key={`df-${i}`} href={f.file} target="_blank" rel="noreferrer">
                          {f.title || 'Document'}
                        </a>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
