import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const site = "https://officequotes.xyz";
const publicDir = path.join(root, "public");
const dataPath = path.join(root, "src", "data", "episodes_data_small.json");

const formatEpisodeId = (season, episode) =>
  `S${season}E${String(episode).padStart(2, "0")}`;

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const buildSearchIndex = (episodes) => {
  const index = episodes.flatMap((episode) => {
    const episodeId = formatEpisodeId(episode.season, episode.episode);
    return episode.all_quotes.map((quote, idx) => ({
      id: `${episodeId}-${idx}`,
      episodeId,
      episodeName: episode.episode_name,
      season: episode.season,
      episode: episode.episode,
      character: quote.character,
      text: quote.text
    }));
  });

  fs.writeFileSync(
    path.join(publicDir, "search-index.json"),
    JSON.stringify(index)
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

const main = () => {
  ensureDir(publicDir);
  const episodes = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  buildSearchIndex(episodes);
  buildSitemap(episodes);
  buildRobots();
};

main();
