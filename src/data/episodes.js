import episodes from "./episodes_data_small.json";

export const formatEpisodeId = (season, episode) =>
  `S${season}E${String(episode).padStart(2, "0")}`;

export const getEpisodes = () => episodes;

export const getEpisodeById = (episodeId) => {
  const match = /S(\d+)E(\d+)/i.exec(episodeId);
  if (!match) return null;
  const season = Number(match[1]);
  const episode = Number(match[2]);
  return episodes.find(
    (entry) => entry.season === season && entry.episode === episode
  );
};

export const getEpisodeIds = () =>
  episodes.map((entry) => formatEpisodeId(entry.season, entry.episode));

export const groupBySeason = () => {
  return episodes.reduce((acc, entry) => {
    if (!acc[entry.season]) {
      acc[entry.season] = [];
    }
    acc[entry.season].push(entry);
    return acc;
  }, {});
};
