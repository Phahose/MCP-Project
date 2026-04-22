namespace Agency2026MCP.Models
{
    public class Contract
    {
        // Identity
        public string ContractNumber { get; set; } = string.Empty;
        public string BaseContractNumber { get; set; } = string.Empty;
        public string? AmendmentCode { get; set; }
        public bool IsAmendment => !string.IsNullOrWhiteSpace(AmendmentCode);
        public bool isSoleSource { get; set; }
        // Justification
        public string? PermittedSituation { get; set; } // normalized to lowercase
      
        // Parties
        public string Department { get; set; } = string.Empty;
        public string DepartmentAddress { get; set; } = string.Empty;
        public string VendorName { get; set; } = string.Empty;
        public string VendorAddress { get; set; } = string.Empty;
       
        // Contract body
        public string Services { get; set; } = string.Empty;
        public decimal Value { get; set; } // This is the value of the contract if ammendment it is the value each ammenment added to the contract
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string FiscalYear { get; set; } = string.Empty;
    }
}
