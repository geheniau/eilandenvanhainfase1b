import { availabilityOf, stripTags } from './pim';

export function statusToAvailability(status) {
  const s = (status || '').toLowerCase();
  if (s.includes('verkocht')) return 'https://schema.org/SoldOut';
  if (s.includes('optie')) return 'https://schema.org/LimitedAvailability';
  return 'https://schema.org/InStock';
}

export function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

function imagesOf(entity) {
  return (entity.images || [])
    .map((img) => img?.sizes?.original)
    .filter(Boolean);
}

export function projectJsonLd(project) {
  const price = project['price-range'] || {};
  const surface = project.living_surface_range || {};
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: project.name,
    description: stripTags(project.description).slice(0, 500),
    url: project.website || undefined,
    image: imagesOf(project),
    datePosted: project.modified || undefined,
    containedInPlace: project.location
      ? {
          '@type': 'Place',
          name: project.location.city,
          address: {
            '@type': 'PostalAddress',
            addressLocality: project.location.city,
            addressCountry: 'NL',
          },
          geo: {
            '@type': 'GeoCoordinates',
            latitude: project.location.lat,
            longitude: project.location.lng,
          },
        }
      : undefined,
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'EUR',
      lowPrice: price.min ?? undefined,
      highPrice: price.max ?? undefined,
      offerCount: project.houses_available ?? undefined,
      availability: 'https://schema.org/InStock',
    },
    numberOfRooms: project.room_count_range?.min ?? undefined,
    floorSize:
      surface.min != null
        ? {
            '@type': 'QuantitativeValue',
            minValue: surface.min,
            maxValue: surface.max,
            unitCode: 'MTK',
          }
        : undefined,
  };
}

function residenceType(model) {
  const m = (model || '').toLowerCase();
  if (m.includes('appartement')) return 'Apartment';
  if (m.includes('villa')) return 'House';
  return 'SingleFamilyResidence';
}

export function housetypesJsonLd(project, housetypes) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Woningtypes ${project.name}`,
    numberOfItems: housetypes.length,
    itemListElement: housetypes.map((ht, i) => {
      const price = ht.pricerange || ht['price-range'] || {};
      const avail = availabilityOf(ht);
      return {
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': residenceType(ht.models?.[0]),
          name: ht.name,
          description: stripTags(ht.description || '').slice(0, 300) || undefined,
          image: imagesOf(ht),
          category: 'Nieuwbouw',
          floorSize:
            ht['livingsurface-range']?.min != null
              ? {
                  '@type': 'QuantitativeValue',
                  minValue: ht['livingsurface-range'].min,
                  maxValue: ht['livingsurface-range'].max,
                  unitCode: 'MTK',
                }
              : undefined,
          numberOfRooms: ht['roomcount-range']?.min ?? undefined,
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'EUR',
            lowPrice: price.min ?? undefined,
            highPrice: price.max ?? undefined,
            offerCount: avail.total,
            availability: avail.total > 0 ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
          },
        },
      };
    }),
  };
}

export function housesJsonLd(project, houses) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Aanbod ${project.name}`,
    numberOfItems: houses.length,
    itemListElement: houses.map((h, i) => {
      const price = h.price_range || h['price-range'] || {};
      return {
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Product',
          name: `Bouwnummer ${h.build_id}`,
          sku: String(h.build_id),
          category: h.housetypeName || h.model,
          floorSize:
            h.living_surface != null
              ? { '@type': 'QuantitativeValue', value: h.living_surface, unitCode: 'MTK' }
              : undefined,
          numberOfRooms: h.room_count ?? undefined,
          offers: {
            '@type': 'Offer',
            price: price.min ?? price.max,
            priceCurrency: 'EUR',
            availability: statusToAvailability(h.status),
            url: h.floorplans?.[0]?.link || undefined,
          },
        },
      };
    }),
  };
}
