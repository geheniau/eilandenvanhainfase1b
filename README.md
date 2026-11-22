# Eilanden van Hain – Fase 1B (projectwebsite via PIM MCP)

Statische projectwebsite (SSG) voor één AM PIM-project. Alle content wordt bij build-tijd
opgehaald uit de **AM PIM MCP** (endpoint via `PIM_MCP_URL` in `.env.local`) en vastgelegd in een
snapshot (`data/snapshot.json`). De site zelf is volledig statisch (`next build` met
`output: 'export'` → `out/`) en heeft dus geen runtime-afhankelijkheid van de PIM.

## Structuur

- `scripts/fetch-pim.mjs` — MCP-client (streamable HTTP) die `get_project`, `list_housetypes`,
  `get_housetype` en `list_houses` aanroept en naar `data/snapshot.json` schrijft.
- `data/snapshot.json` — de vastgelegde PIM-snapshot (gecommit, zodat builden zonder token kan).
- `lib/pim.js` — laadt de snapshot + format-helpers (prijzen in nl-NL, afbeeldingen, status).
- `app/page.js` — home: hero, kerncijfers, beschrijving, impressie, woningtypes, locatiekaart, brochures.
- `app/aanbod/page.js` — aanbod: alle bouwnummers per woningtype met filter (status, type, prijs) en sortering.
- `app/MapSvg.js` — kaart (SVG) op basis van het GeoJSON-gebied + coördinaat uit de PIM.

## Setup

```bash
npm install
```

## PIM-snapshot verversen

Kopieer `.env.example` naar `.env.local` en vul in:

- `PIM_MCP_URL` — MCP endpoint (verplicht; staat bewust niet in de repo, vraag 'm op bij de PIM-beheerder)
- `PIM_MCP_TOKEN` — Bearer token voor de PIM MCP (**nooit committen**, `.env.local` staat in `.gitignore`)
- `PIM_PROJECT_ID` — project-id in de PIM (standaard `1409` = Eilanden van Hain - Fase 1B)

Daarna:

```bash
npm run fetch   # schrijft data/snapshot.json
```

## Bouwen (statisch)

```bash
npm run build   # → out/ (index.html, aanbod/index.html, ...)
```

De output in `out/` is een puur statische site: te hosten op elke static host
(bijv. GitHub Pages, Netlify, Vercel static, of een eigen webserver).

## Lokaal bekijken

```bash
npm run dev                 # lokale ontwikkelmodus
# of na build:
cd out && python3 -m http.server 8000   # → http://localhost:8000
```

## AI-agent support (machineleesbaar)

De site is naast voor mensen ook gebouwd voor AI-agents:

- `public/llms.txt` — descreve de site, pagina's, data-endpoints en de PIM MCP-bron.
- `public/robots.txt` + `public/sitemap.xml` — crawlen/discovery.
- `public/pim/snapshot.json` — de volledige PIM-snapshot als ruwe JSON (wordt bij elke
  `npm run build`/`npm run dev` gekopieerd uit `data/snapshot.json` via `scripts/prepare-public.mjs`).
- JSON-LD (schema.org) in elke pagina:
  - `/` — `RealEstateListing` (project: geo, prijsrange, availability) + `ItemList` van woningtypes
  - `/aanbod/` — `ItemList` van alle woningen (`sku` = bouwnummer, `Offer` met prijs en
    `availability` gemapt van de PIM-status: Te Koop → InStock, Optie → LimitedAvailability, Verkocht → SoldOut)
- Semantische HTML: `header/nav/main/footer`, skip-link, `<time>` voor de snapshot-datum, `lang="nl"`, alt-teksten, aria-label op de kaart.

Agents zonder PIM-toegang gebruiken `/pim/snapshot.json`; live PIM-data is alleen beschikbaar
voor geautoriseerde maintainers via de MCP-connector (project id 1409).

## Ander project

Zet `PIM_PROJECT_ID` op een ander project-id (zie `list_projects_summary` in de PIM MCP),
run `npm run fetch` en `npm run build`. De pagina's renderen automatisch alle velden
(beschrijving, afbeeldingen, USPs, woningtypes, woningen, bestanden, locatie) uit de snapshot.
