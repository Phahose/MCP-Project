namespace Agency2026MCP.Models
{
    public class Finding
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty; 
        public string Severity { get; set; } = string.Empty; 
        public string Summary { get; set; } = string.Empty; 

        // What the finding is about (lets you filter/sort)
        public string Department { get; set; } = string.Empty;
        public string VendorName { get; set; } = string.Empty;

        public decimal RelevantValue { get; set; } 
        public DateTime GeneratedAt { get; set; }

        // Type-specific payload (exactly one populated; nulls on the others)
        public AmendmentCreepResponse? AmendmentCreep { get; set; }
        public ThresholdSplitGroup? ThresholdSplit { get; set; }
        // I will add SoleSource payload later if we want to implement that finding type have to discuss with team about what details to include
    }
}
