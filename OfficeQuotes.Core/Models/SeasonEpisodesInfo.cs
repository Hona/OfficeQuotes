using System;
using System.Collections.Generic;
using System.Linq;

namespace OfficeQuotes.Core.Models
{
    public class SeasonEpisodesInfo
    {
        public List<SeasonEpisodeCount> EpisodeCounts { get; set; } = new List<SeasonEpisodeCount>();

        public int GetEpisodeCount(int season)
        {
            if (EpisodeCounts == null || EpisodeCounts.Count == 0)
            {
                throw new Exception("No season episode count info");
            }

            var seasonInfo = EpisodeCounts.FirstOrDefault(x => x.SeasonNumber == season) ??
                             throw new Exception("No info found for that season.");
            return seasonInfo.EpisodeCount;
        }

        public override string ToString()
            =>
                $"Information on {EpisodeCounts.Count} seasons, with a total of {EpisodeCounts.Aggregate(0, (totalEpisodes, nextSeasonInfo) => totalEpisodes += nextSeasonInfo.EpisodeCount)} episodes";
    }
}