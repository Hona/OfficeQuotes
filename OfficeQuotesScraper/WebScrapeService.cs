using System;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using HtmlAgilityPack;
using OfficeQuotes.Core.Models;

namespace OfficeQuotesScraper
{
    public class WebScrapeService
    {
        private HttpClient HttpClient { get; } = new HttpClient();

        public async Task<EpisodeData> GetEpisodeDataAsync(int season, int episode)
        {
            var output = new EpisodeData
            {
                Season = season,
                Episode = episode
            };

            var pageUri = OfficeQuotesUtility.GetEpisodePage(season, episode);
            string pageText;
            try
            {
                pageText = await HttpClient.GetStringAsync(pageUri);
            }
            catch
            {
                throw new Exception($"Could not find page for S{season}E{episode}.");
            }

            var htmlPage = new HtmlDocument();
            htmlPage.LoadHtml(pageText);

            var innerText = htmlPage.DocumentNode.Descendants("article").First().InnerText;

            var episodeTitleStart = innerText.IndexOf("&#8220", StringComparison.Ordinal);
            var episodeTitleEnd = innerText.Substring(episodeTitleStart).IndexOf("&#8221", StringComparison.Ordinal);

            var episodeTitle = innerText.Substring(episodeTitleStart, episodeTitleEnd)
                .Substring(Constants.HtmlStartQuote.Length);
            output.EpisodeName = HtmlEntity.DeEntitize(episodeTitle);

            var quoteBlocks = htmlPage.DocumentNode.SelectNodes("//div[@class='quote']");
            foreach (var quoteBlock in quoteBlocks.Descendants().Where(x => x?.NextSibling != null && x.Name == "b"))
            {
                try
                {
                    var character = quoteBlock.InnerText.TrimEnd(':');
                    var quote = string.Empty;

                    var currentBlock = quoteBlock.NextSibling;
                    while (currentBlock != null && currentBlock.Name != "b")
                    {
                        quote += currentBlock.InnerText.TrimStart(' ');

                        currentBlock = currentBlock.NextSibling;
                    }

                    output.EpisodeQuotes.Add(new Quote
                    {
                        Character = HtmlEntity.DeEntitize(character).Replace("\t", "").Trim(),
                        Text = HtmlEntity.DeEntitize(quote).Replace("\t", "").Trim()
                    });
                }
                catch (Exception e)
                {
                    Console.WriteLine("Error with: " + quoteBlock.InnerText);
                    Console.WriteLine(e);
                    throw;
                }
            }

            return output;
        }
    }
}