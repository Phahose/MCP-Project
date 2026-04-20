namespace Agency2026MCP.Models
{
    public class ThresholdSplitResponse
    {
        public int TotalContractsAnalyzed { get; set; }
        public int TotalGroupsFound => SuspiciousGroups.Count;
        public int TotalContractsFlagged => SuspiciousGroups.Sum(g => g.GroupMembers.Count);
        public decimal TotalFlaggedValue => SuspiciousGroups.Sum(g => g.TotalValue);

        // Echo the parameters used — this is for the audit trail.
        public double ContractsValueProximityLimit { get; set; }
        public int WindowDaysUsed { get; set; }

        // Graceful-degradation surface
        public List<string> Warnings { get; set; } = new();
        public List<string> Errors { get; set; } = new();

        public List<ThresholdSplitGroup> SuspiciousGroups { get; set; } = new();
    }
}
