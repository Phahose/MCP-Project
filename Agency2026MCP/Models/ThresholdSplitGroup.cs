namespace Agency2026MCP.Models
{
    public class ThresholdSplitGroup
    {
        public string Department { get; set; } = string.Empty;
        public string VendorName { get; set; } = string.Empty;

        public List<ThresholdSplitMember> GroupMembers { get; set; } = new();

        // Derived these values for convenience, so the LLM doesn't have to do the math itself if it doesn't want to.
        public int ContractCount => GroupMembers.Count;
        public decimal TotalValue => GroupMembers.Sum(m => m.Contract.Value);
        public DateTime EarliestStart => GroupMembers.Min(m => m.Contract.StartDate!.Value);
        public DateTime LatestStart => GroupMembers.Max(m => m.Contract.StartDate!.Value);
        public int SpanDays => (int)(LatestStart - EarliestStart).TotalDays;

        // Threshold context
        public decimal ThresholdLimit { get; set; } 
        public decimal CombinedOverThreshold => TotalValue - ThresholdLimit;
        public double AverageThresholdRatio { get; set; }   // TotalValue / threshold
        public double CombinedRatioToThreshold { get; set; } 

        // Severity this is just a property to make it easier for the human to understand the risk level of the group, based on the proximity to the threshold and the number of contracts. The LLM can use its judgment to assign this value.
        public string Severity { get; set; } = string.Empty;     // "low" | "medium" | "high"
        public string Summary { get; set; } = string.Empty;
    }
}

