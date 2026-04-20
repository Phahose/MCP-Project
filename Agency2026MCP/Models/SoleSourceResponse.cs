namespace Agency2026MCP.Models
{
    public class SoleSourceResponse
    {
        public decimal TotalSoleSourceValue { get; set; }
        public int SoleSourceCount { get; set; }
        public List<Contract> SoleSourceContracts { get; set; } = new();
    }
}
