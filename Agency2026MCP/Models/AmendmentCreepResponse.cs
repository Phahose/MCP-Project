namespace Agency2026MCP.Models
{
    public class AmendmentCreepResponse
    {
        public decimal TotalAmendmentCreep { get; set; }
        public decimal TotalAmendmentValue { get; set; }
        public decimal FinalContractValue { get; set; }
        public decimal CreepRatio { get; set; }
        public int TotalContractsAnalyzed { get; set; }
        public List<Contract> ContractsWithCreep { get; set; } = new();
        public string OriginalContractNumber { get; set; } = string.Empty;
        public string OriginalVendorName { get; set; } = string.Empty;
        public decimal OriginalContractValue { get; set; }
        public string OriginalContractServices { get; set; } = string.Empty;
        public decimal MaxAmendmentValue { get; set; }
        public string MaxAmendmentServices { get; set; } = string.Empty;
        public List<string> Warnings { get; set; } = new();
        public List<string> Errors { get; set; } = new();
        public string Severity { get; set; } = string.Empty; // "Low", "Medium", "High"
        public string Department { get; set; } = string.Empty;
    }
}
