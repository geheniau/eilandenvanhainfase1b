import { allHouses, project, stripTags } from '../../lib/pim';
import { JsonLd, housesJsonLd } from '../../lib/jsonld';

const houses = allHouses();

export const metadata = {
  title: `Aanbod | ${project.name}`,
  description: `${houses.length} woningen in ${project.location?.city ?? ''} — bouwnummers, prijzen, status en plattegronden uit de AM PIM. ${stripTags(project.description).slice(0, 100)}`,
};

export default function AanbodLayout({ children }) {
  return (
    <>
      <JsonLd data={housesJsonLd(project, houses)} />
      {children}
    </>
  );
}
