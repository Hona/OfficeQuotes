using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;
using OfficeQuotes.Core.Models;

namespace OfficeQuotesScraper
{
    public static class Program
    {
        private static readonly object _lock = new object();

        private static void Main() => MainAsync().GetAwaiter().GetResult();

        private static async Task MainAsync()
        {
            //await IsolatedTestAsync();
            await ScrapeAllAsync();
            //ConsoleSearchAll();
        }

        private static void ConsoleSearchAll()
        {
            var text = File.ReadAllText(Constants.DataFolderPath + "/full_quotes_data.json");
            var fullInfo = JsonConvert.DeserializeObject<List<FullQuoteInfo>>(text);

            var dwightQuotes = fullInfo
                .Where(x => x.Quote.Character.Contains("dwight", StringComparison.InvariantCultureIgnoreCase)).ToList();
            var random = new Random();

            while (true)
            {
                Console.WriteLine("Dwight Quote of the Day: " + dwightQuotes[random.Next(dwightQuotes.Count)]);
                Console.WriteLine();
                Console.Write("Enter your search > ");
                var input = Console.ReadLine();

                var matches = fullInfo
                    .Where(x => x.Quote.Text.Contains(input, StringComparison.InvariantCultureIgnoreCase)).ToList();

                foreach (var match in matches)
                {
                    Console.WriteLine(match);
                }

                Console.WriteLine($"{matches.Count} lines include '{input}'");
                Console.WriteLine();
            }
        }

        private static async Task IsolatedTestAsync()
        {
            var scraper = new WebScrapeService();
            var data = await scraper.GetEpisodeDataAsync(4, 8);
            Console.WriteLine(data);
            Console.WriteLine();
            Console.ReadLine();
        }

        private static async Task ScrapeAllAsync(string dataFolder = null)
        {
            var seasonEpisodeCounts =
                JsonConvert.DeserializeObject<SeasonEpisodesInfo>(
                    await File.ReadAllTextAsync(dataFolder ??
                                                Constants.DataFolderPath + "/season_episode_counts.json"));

            var scraper = new WebScrapeService();

            var scrapeTasks = new List<Task>();
            var episodesData = new List<EpisodeData>();

            foreach (var episodeInfo in seasonEpisodeCounts.EpisodeCounts)
            {
                for (var episode = 1; episode <= episodeInfo.EpisodeCount; episode++)
                {
                    var localEpisode = episode;
                    var episodeDataLocal = episodesData;
                    scrapeTasks.Add(Task.Run(async () =>
                    {
                        try
                        {
                            var data = await scraper.GetEpisodeDataAsync(episodeInfo.SeasonNumber, localEpisode);
                            await PrintInfo(data);
                            episodeDataLocal.Add(data);
                        }
                        catch
                        {
                            Console.WriteLine($"Error with S{episodeInfo.SeasonNumber}E{localEpisode}");
                        }
                    }));
                }
            }

            await Task.WhenAll(scrapeTasks);
            Console.WriteLine("Done scraping, sorting");

            episodesData = episodesData.OrderBy(x => x.Season).ThenBy(x => x.Episode).ToList();

            var text = JsonConvert.SerializeObject(episodesData);
            await File.WriteAllTextAsync(dataFolder ?? Constants.DataFolderPath + "/episodes_data_small.json", text);

            var fullInfo = episodesData.SelectMany(x => x.EpisodeQuotes.Select(z => new FullQuoteInfo
                {Episode = new EpisodeInfo {Episode = x.Episode, Season = x.Season}, Quote = z})).ToList();
            await File.WriteAllTextAsync(dataFolder ?? Constants.DataFolderPath + "/full_quotes_data.json",
                JsonConvert.SerializeObject(fullInfo));

            foreach (var season in episodesData.GroupBy(x => x.Season))
            {
                foreach (var episode in season)
                {
                    var fileName = $"/episodes/S{season.Key}E{episode.Episode.ToString().PadLeft(2, '0')}.json";

                    var episodeFullQuotes = episode.EpisodeQuotes.Select(z => new FullQuoteInfo
                            {Episode = new EpisodeInfo {Episode = episode.Episode, Season = season.Key}, Quote = z})
                        .ToList();

                    await File.WriteAllTextAsync(dataFolder ?? Constants.DataFolderPath + fileName,
                        JsonConvert.SerializeObject(episodeFullQuotes));
                }
            }

            foreach (var fullQuoteInfo in fullInfo.GroupBy(x => x.Quote.Character))
            {
                var data = fullQuoteInfo.Select(x => x).ToList();
                await File.WriteAllTextAsync(
                    dataFolder ?? Constants.DataFolderPath + "/characters/" +
                    fullQuoteInfo.Key.Replace(@"\", "-").Replace(@"/", "-") + ".json",
                    JsonConvert.SerializeObject(data));
            }

            Console.WriteLine("Done...");
            Console.ReadLine();
        }

        private static async Task PrintInfo(EpisodeData data)
        {
            await Task.Run(() =>
            {
                lock (_lock)
                {
                    Console.WriteLine($" > Loaded {data}");
                }
            });
        }
    }
}