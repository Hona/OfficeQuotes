using Newtonsoft.Json;

namespace OfficeQuotes.Core.Models
{
    public class Quote
    {
        [JsonProperty("character")] public string Character { get; set; }
        [JsonProperty("text")] public string Text { get; set; }

        public override string ToString()
            => $"[{Character}]: {Text}";
    }
}