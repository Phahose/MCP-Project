namespace Agency2026MCP.Models
{
    public class VendorDependency
    {
        public string VendorName { get; set; } = string.Empty;
        public int ContractCount { get; set; }
        public decimal TotalValue { get; set; }
        public double DependencyRatio { get; set; }
    }
}
