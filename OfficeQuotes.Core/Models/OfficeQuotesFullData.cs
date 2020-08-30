using System;
using System.Collections.Generic;
using System.Text;

namespace OfficeQuotes.Core.Models
{
    public class OfficeQuotesFullData
    {
        public List<FullQuoteInfo> FullQuoteInfoList { get; set; }
        public SeasonEpisodesInfo SeasonEpisodeCounts { get; set; }
        public List<EpisodeData> EpisodeDataList { get; set; }
    }
}
