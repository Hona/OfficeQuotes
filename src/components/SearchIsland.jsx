import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import flexsearch from "flexsearch";

const { Index } = flexsearch;

const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 200;

const SEARCH_OPTIONS = {
  tokenize: "forward",
  cache: 100,
  resolution: 9,
  depth: 3,
  minlength: MIN_QUERY_LENGTH
};

const parseEpisodeLabel = (episodeId) => {
  const match = /S(\d+)E(\d+)/i.exec(episodeId);
  if (!match) return episodeId;
  const season = Number(match[1]);
  const episode = Number(match[2]);
  return `Season ${season} - Episode ${episode} - ${episodeId}`;
};

const SearchIsland = () => {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState([]);
  const [episodeMeta, setEpisodeMeta] = useState({});
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const indexRef = useRef(null);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  const updateUrl = (value) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (value) {
      url.searchParams.set("q", value);
    } else {
      url.searchParams.delete("q");
    }
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  };

  useEffect(() => {
    let active = true;
    fetch("/search-index.json")
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        const index = new Index(SEARCH_OPTIONS);
        data.index.forEach((chunk) => index.import(chunk.key, chunk.data));
        indexRef.current = index;
        setItems(data.items);
        setEpisodeMeta(data.episodeMeta || {});
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const shouldFocus =
      window.location.hash === "#search" ||
      new URLSearchParams(window.location.search).has("q");
    if (inputRef.current && shouldFocus) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const seed = params.get("q");
    if (seed) {
      setQuery(seed);
      updateUrl(seed);
    }
  }, []);

  useEffect(() => {
    const cards = document.querySelector("[data-search-cards]");
    if (!cards) return;
    const active = query.trim().length >= MIN_QUERY_LENGTH;
    cards.style.display = active ? "none" : "";
  }, [query]);


  useEffect(() => {
    if (!indexRef.current || isLoading) return;

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    const normalized = query.trim();
    if (normalized.length < MIN_QUERY_LENGTH) {
      setResults([]);
      updateUrl(normalized.length ? normalized : "");
      return;
    }

    debounceRef.current = window.setTimeout(() => {
      const matches = indexRef.current.search(normalized, 200);
      const mapped = matches
        .map((id) => {
          const item = items[id];
          if (!item) return null;
          return { id, item };
        })
        .filter(Boolean);
      setResults(mapped);
      updateUrl(normalized);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [items, query, isLoading]);

  const metaText = useMemo(() => {
    if (isLoading) {
      return "Loading search index...";
    }
    if (query.trim().length === 0) {
      return "Type to search every line.";
    }
    if (query.trim().length < MIN_QUERY_LENGTH) {
      return `Keep typing... (${MIN_QUERY_LENGTH} characters minimum)`;
    }
    if (results.length === 0) {
      return "No results yet. Try a different phrase.";
    }
    return `${results.length} result${results.length === 1 ? "" : "s"}`;
  }, [isLoading, query, results.length]);

  const hasResults = results.length > 0 && query.trim().length >= MIN_QUERY_LENGTH;

  return (
    <div className="search-box" data-search-box>
      <label>
        <span className="search-meta">Search the archive</span>
        <input
          ref={inputRef}
          type="search"
          placeholder="Try: pretzel day, dunder mifflin, jim"
          value={query}
          onInput={(event) => setQuery(event.currentTarget.value)}
          aria-label="Search quotes"
        />
      </label>
      <div className="search-meta">{metaText}</div>
      {hasResults ? (
        <div className="quote-list" data-search-results>
          {results.map(({ id, item }) => {
            const [episodeId, quoteIndex, character, text] = item;
            const episodeName = episodeMeta[episodeId] || episodeId;
            const anchorId = `quote-${episodeId}-${quoteIndex}`;
            return (
              <article className="quote-item" key={id}>
                <strong>{character}</strong>: {text}
                <div className="search-meta">{episodeName}</div>
                <div className="search-meta">{parseEpisodeLabel(episodeId)}</div>
                <div className="search-actions">
                  <a href={`/episode/${episodeId}#${anchorId}`}>
                    Jump to quote
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

export default SearchIsland;
