import fs from "node:fs";
import path from "node:path";
import flexsearch from "flexsearch";

const { Index } = flexsearch;

const root = process.cwd();
const site = "https://officequotes.xyz";
const publicDir = path.join(root, "public");
const dataPath = path.join(root, "src", "data", "episodes_data_small.json");

const SEARCH_OPTIONS = {
  tokenize: "forward",
  cache: 100,
  resolution: 9,
  depth: 3,
  minlength: 3
};

const formatEpisodeId = (season, episode) =>
  `S${season}E${String(episode).padStart(2, "0")}`;

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const buildSearchIndex = async (episodes) => {
  const index = new Index(SEARCH_OPTIONS);
  const items = [];
  const episodeMeta = {};
  let id = 0;

  episodes.forEach((episode) => {
    const episodeId = formatEpisodeId(episode.season, episode.episode);
    const episodeLabel = `Season ${episode.season} Episode ${episode.episode}`;
    episodeMeta[episodeId] = episode.episode_name;

    episode.all_quotes.forEach((quote, quoteIndex) => {
      items.push([
        episodeId,
        quoteIndex,
        quote.character,
        quote.text
      ]);
      const searchable = `${quote.text} ${quote.character} ${episode.episode_name} ${episodeId} ${episodeLabel}`;
      index.add(id, searchable);
      id += 1;
    });
  });

  const serialized = [];
  await index.export((key, data) => {
    if (data !== undefined) {
      serialized.push({ key, data });
    }
  });

  const payload = {
    index: serialized,
    items,
    episodeMeta
  };

  fs.writeFileSync(
    path.join(publicDir, "search-index.json"),
    JSON.stringify(payload)
  );
};

const buildSitemap = (episodes) => {
  const today = new Date().toISOString().split("T")[0];
  const urls = [
    {
      loc: `${site}/`,
      changefreq: "monthly",
      priority: "1.0"
    },
    ...episodes.map((episode) => {
      const episodeId = formatEpisodeId(episode.season, episode.episode);
      return {
        loc: `${site}/episode/${episodeId}`,
        changefreq: "monthly",
        priority: "0.7"
      };
    })
  ];

  const body = urls
    .map((url) => {
      return [
        "  <url>",
        `    <loc>${url.loc}</loc>`,
        `    <lastmod>${today}</lastmod>`,
        `    <changefreq>${url.changefreq}</changefreq>`,
        `    <priority>${url.priority}</priority>`,
        "  </url>"
      ].join("\n");
    })
    .join("\n");

  const sitemap = [
    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
    "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">",
    body,
    "</urlset>"
  ].join("\n");

  fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemap);
};

const buildRobots = () => {
  const robots = [
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${site}/sitemap.xml`
  ].join("\n");

  fs.writeFileSync(path.join(publicDir, "robots.txt"), robots);
};

const main = async () => {
  ensureDir(publicDir);
  const episodes = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  await buildSearchIndex(episodes);
  buildSitemap(episodes);
  buildRobots();
};

await main();
