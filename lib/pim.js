import snapshot from '../data/snapshot.json';

export const meta = snapshot.meta;
export const project = snapshot.project;
export const housetypes = snapshot.housetypes || [];
export const houses = Array.isArray(snapshot.houses) ? snapshot.houses : [];

export function stripTags(html) {
  return (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function formatPrice(value) {
  if (value === null || value === undefined) return '—';
  return '€ ' + Number(value).toLocaleString('nl-NL');
}

export function priceRangeLabel(range) {
  if (!range) return '—';
  const min = range.min;
  const max = range.max;
  if (min === null && max === null) return '—';
  if (min === undefined && max === undefined) return '—';
  if (min === max) return formatPrice(min);
  return `${formatPrice(min)} – ${formatPrice(max)}`;
}

export function housePrice(house) {
  return house.price_range || house['price-range'] || null;
}

export function imgUrl(image, size = 'large') {
  if (!image || !image.sizes) return null;
  return image.sizes[size] || image.sizes.original || null;
}

export function availabilityOf(housetype) {
  const a = housetype.availability || {};
  return {
    forSale: a['for-sale'] || 0,
    option: a['option'] || 0,
    total: (a['for-sale'] || 0) + (a['option'] || 0),
  };
}

export function allHouses() {
  const nested = housetypes.flatMap((ht) =>
    (ht.houses || []).map((h) => ({ ...h, housetypeName: ht.name, housetypeId: ht.id }))
  );
  return nested.length > 0 ? nested : houses;
}

export function statusClass(status) {
  const s = (status || '').toLowerCase();
  if (s.includes('koop')) return 'badge badge-tekoop';
  if (s.includes('optie')) return 'badge badge-optie';
  if (s.includes('verkocht')) return 'badge badge-verkocht';
  return 'badge';
}
