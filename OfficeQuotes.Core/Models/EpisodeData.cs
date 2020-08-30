using System.Collections.Generic;
using Newtonsoft.Json;

namespace OfficeQuotes.Core.Models
{
    public class EpisodeData
    {
        [JsonProperty("season")] public int Season { get; set; }
        [JsonProperty("episode")] public int Episode { get; set; }
        [JsonProperty("episode_name")] public string EpisodeName { get; set; }
        [JsonProperty("all_quotes")] public List<Quote> EpisodeQuotes { get; set; } = new List<Quote>();

        public override string ToString()
            =>
                $"S{Season.ToString().PadLeft(2, '0')}E{Episode.ToString().PadLeft(2, '0')}: '{EpisodeName}' with {EpisodeQuotes?.Count ?? 0} quotes";
    }
}