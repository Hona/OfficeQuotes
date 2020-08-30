using System;

namespace OfficeQuotesScraper
{
    public static class OfficeQuotesUtility
    {
        public static readonly Uri OfficeQuotesBaseURI = new Uri("https://www.officequotes.net/");

        public static Uri GetEpisodePage(int season, int episode)
            => new Uri(OfficeQuotesBaseURI, $"no{season}-{episode.ToString().PadLeft(2, '0')}.php");
    }
}