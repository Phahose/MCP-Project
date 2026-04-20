
namespace Agency2026MCP.Models
{
    public class SearchContractsResponse
    {
        public int TotalMatches { get; set; }
        public int ReturnedCount { get; set; }
        public SearchContractsRequest AppliedFilters { get; set; } = new();
        public List<string> Warnings { get; set; } = new();
        public List<Contract> Contracts { get; set; } = new();
    }
}

