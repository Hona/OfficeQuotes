using System;
using System.Collections.Generic;
using System.IO;
using BlazorStrap;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Newtonsoft.Json;
using OfficeQuotes.Core.Models;

namespace OfficeQuotesBlazor
{
    public class Startup
    {
        public Startup(IConfiguration configuration) => Configuration = configuration;

        private IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        // For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddRazorPages();
            services.AddServerSideBlazor();

            var text = File.ReadAllText(Path.Combine(Environment.CurrentDirectory, "data", "full_quotes_data.json"));
            var fullInfo = JsonConvert.DeserializeObject<List<FullQuoteInfo>>(text);

            var seasonEpisodeCounts =
                JsonConvert.DeserializeObject<SeasonEpisodesInfo>(
                    File.ReadAllText(Path.Combine(Environment.CurrentDirectory, "data", "season_episode_counts.json")));

            var episodeData = JsonConvert.DeserializeObject<List<EpisodeData>>(
                File.ReadAllText(Path.Combine(Environment.CurrentDirectory, "data", "episodes_data_small.json")));

            var officeQuotesFullData = new OfficeQuotesFullData
            {
                EpisodeDataList = episodeData,
                FullQuoteInfoList = fullInfo,
                SeasonEpisodeCounts = seasonEpisodeCounts
            };

            services.AddSingleton(officeQuotesFullData);

            services.AddSingleton<Random>();
            services.AddBootstrapCss();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();

            app.UseRouting();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapBlazorHub();
                endpoints.MapFallbackToPage("/_Host");
            });
        }
    }
}