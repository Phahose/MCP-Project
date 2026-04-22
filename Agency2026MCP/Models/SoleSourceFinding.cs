namespace Agency2026MCP.Models
{
    public class SoleSourceFinding
    {
        public Contract Contract { get; set; } = default!;
        public string PermittedSituationCode { get; set; } = string.Empty;
        public string PermittedSituationReason { get; set; } = string.Empty;
        public int PermittedSituationWeight { get; set; }
        public double Score { get; set; }
        public string Severity { get; set; } = string.Empty;
    }
}
