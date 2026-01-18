namespace OfficeQuotes.Core.Models
{
    public class EpisodeInfo
    {
        public int Season { get; set; }
        public int Episode { get; set; }

        public override string ToString() =>
            $"S{Season.ToString().PadLeft(2, '0')}E{Episode.ToString().PadLeft(2, '0')}";
    }
}