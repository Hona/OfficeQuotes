import { useEffect, useMemo, useState } from "preact/hooks";
import Fuse from "fuse.js";

const fuseOptions = {
  includeScore: true,
  threshold: 0.35,
  ignoreLocation: true,
  minMatchCharLength: 2,
  keys: ["text", "character", "episodeName", "episodeId"]
};

const formatEpisodeLabel = (entry) =>
  `Season ${entry.season} - Episode ${entry.episode} - ${entry.episodeId}`;

const SearchIsland = () => {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState([]);

  useEffect(() => {
    let active = true;
    fetch("/search-index.json")
      .then((res) => res.json())
      .then((data) => {
        if (active) setIndex(data);
      });
    return () => {
      active = false;
    };
  }, []);

  const fuse = useMemo(() => new Fuse(index, fuseOptions), [index]);
  const results = query.trim()
    ? fuse.search(query.trim(), { limit: 200 }).map((entry) => entry.item)
    : [];

  return (
    <div className="search-box">
      <label>
        <span className="search-meta">Search the archive</span>
        <input
          type="search"
          placeholder="Try: pretzel day, dunder mifflin, jim"
          value={query}
          onInput={(event) => setQuery(event.currentTarget.value)}
          aria-label="Search quotes"
        />
      </label>
      <div className="search-meta">
        {query.trim().length === 0
          ? "Type to search every line."
          : `${results.length} result${results.length === 1 ? "" : "s"}`}
      </div>
      <div className="quote-list">
        {results.map((entry) => (
          <article className="quote-item" key={entry.id}>
            <strong>{entry.character}</strong>: {entry.text}
            <div className="search-meta">{entry.episodeName}</div>
            <div className="search-meta">{formatEpisodeLabel(entry)}</div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default SearchIsland;
