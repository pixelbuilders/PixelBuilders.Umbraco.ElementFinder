namespace ElementFinder.Core.Models
{
    public class Usage
    {
        public IEnumerable<Details> Usages { get; set; }
    }

    public class Details
    {
        public string PageName { get; set; }
        public string Url { get; set; }
        public string Id { get; set; }
    }
}
