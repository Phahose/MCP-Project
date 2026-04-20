namespace Agency2026MCP.Models
{
    public class ThresholdSplitMember
    {
        public Contract Contract { get; set; } = new();
        public bool IsBelowThreshold { get; set; }
        public decimal ThresholdRatio { get; set; }
    }
}
