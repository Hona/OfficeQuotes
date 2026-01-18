# [OfficeQuotes.xyz](https://officequotes.xyz)

> All the quotes from The Office (US)

## Static Site

This site is built with Astro and prerenders every episode for SEO.

### Commands

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run preview`

### Data pipeline

Scraper output lives in `src/data/episodes_data_small.json`. Update the data via the .NET scraper in `OfficeQuotesScraper`.

### SEO

Build generates:
- `public/sitemap.xml`
- `public/robots.txt`
- `public/search-index.json`
