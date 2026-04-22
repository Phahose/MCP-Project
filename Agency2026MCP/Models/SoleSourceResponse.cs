namespace Agency2026MCP.Models
{
    public class SoleSourceResponse
    {
        public string Department { get; set; } = string.Empty;
        public decimal TotalSoleSourceValue { get; set; }
        public int SoleSourceGroupsCount { get; set; }
        public List<SoleSourceGroup> SoleSourceGroups { get; set; } = new();
        public int TotalContractsAnalyzed { get; set; }
        public int TotalSoleSourceContractsAnalyzed { get; set; }
        public List<string> Warnings { get; set; } = new();
        public List<string> Errors { get; set; } = new();
    }
}
