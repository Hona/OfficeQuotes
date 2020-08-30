using Newtonsoft.Json;

namespace OfficeQuotes.Core.Models
{
    public class SeasonEpisodeCount
    {
        [JsonProperty("season_number")] public int SeasonNumber { get; set; }
        [JsonProperty("episode_count")] public int EpisodeCount { get; set; }

        public override string ToString()
            => $"Season: {SeasonNumber} with {EpisodeCount} episodes";
    }
}