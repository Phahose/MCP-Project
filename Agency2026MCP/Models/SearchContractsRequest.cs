namespace Agency2026MCP.Models
{
    public class SearchContractsRequest
    {
        public string? Department { get; set; }
        public string? VendorName { get; set; }
        public string? ServicesText { get; set; }
        public string? ContractNumber { get; set; }

        public DateTime? StartDateFrom { get; set; }
        public DateTime? StartDateTo { get; set; }

        public decimal? MinValue { get; set; }
        public decimal? MaxValue { get; set; }

        public string? FiscalYear { get; set; }
        public string? PermittedSituation { get; set; }
        public string? ProcurementMethod { get; set; }

        /// <summary>
        /// "original_only" | "amendments_only" | "all"
        /// </summary>
        public string RecordType { get; set; } = "original_only";
        public int Limit { get; set; } = 50;
    }
}
