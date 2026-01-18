namespace OfficeQuotes.Core.Models
{
    public class FullQuoteInfo
    {
        public EpisodeInfo Episode { get; set; }
        public Quote Quote { get; set; }

        public override string ToString() => Episode + " > " + Quote;
    }
}