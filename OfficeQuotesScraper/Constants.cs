using System;
using System.IO;

namespace OfficeQuotesScraper
{
    public static class Constants
    {
        public static string DataFolderPath => Path.Combine(Environment.CurrentDirectory, "data");
        public static string HtmlStartQuote => "&#8220;";
        public static string HtmlEndQuote => "&#8221;";
    }
}