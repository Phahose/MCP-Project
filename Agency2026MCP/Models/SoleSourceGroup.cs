namespace Agency2026MCP.Models
{
    public class SoleSourceGroup
    {
        // Context
        public string Department { get; set; } = string.Empty;
        public string Vendor { get; set; } = string.Empty;
        public Contract BaseContract { get; set; } = new();
        public double TimeSpanDays { get; set; }
        // Timeline anchor
        // Evidence
        public List<SoleSourceFinding> FollowOnContracts { get; set; } = new();
        public List<Contract> SoleSourceContracts { get; set; } = new();
        // Aggregates
        public decimal TotalSoleSourceValue => FollowOnContracts.Sum(c => c.Contract.Value);
        public int FollowOnCount => FollowOnContracts.Count;
        public int SoleSourceCount => SoleSourceContracts.Count;
        // Scoring
        public string Severity { get; set; } = string.Empty; // "low" | "medium" | "high"
        public double AverageScore { get; set; }
        // Human-readable summary
        public string Summary { get; set; } = string.Empty;

    }
}
