namespace Agency2026MCP.Models
{
    public class SoleSourceGroup
    {
        // Context
        public string Department { get; set; } = string.Empty;
        // Timeline anchor
        // Evidence
        public List<SoleSourceFinding> SoleSourceContracts { get; set; } = new();
        // Aggregates
        public decimal TotalSoleSourceValue => SoleSourceContracts.Sum(c => c.Contract.Value);
        public int TotalSoleSoureceContracts => SoleSourceContracts.Count;
        // Scoring
        public string Severity { get; set; } = string.Empty; // "low" | "medium" | "high"
        public double AverageScore => SoleSourceContracts.Count > 0 ? SoleSourceContracts.Average(c => c.Score) : 0.0;
        // Human-readable summary
        public string Summary { get; set; } = string.Empty;
    }
}
