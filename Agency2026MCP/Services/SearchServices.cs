using Agency2026MCP.Models;

namespace Agency2026MCP.Services
{
    public class SearchServices
    {
        private readonly List<Contract> _contracts;

        public SearchServices(List<Contract> contracts)
        {
            _contracts = contracts;
        }

        public SearchContractsResponse Search(SearchContractsRequest request)
        {
            var response = new SearchContractsResponse { AppliedFilters = request };

            // --- Normalize inputs (with warnings if anything was off) 
            var recordType = (request.RecordType ?? "original_only").ToLower();

            int limit;
            if (request.Limit <= 0)
            {
                limit = 50;
                response.Warnings.Add($"Invalid limit {request.Limit}. Defaulted to 50.");
            }
            else if (request.Limit > 500)
            {
                limit = 500;
                response.Warnings.Add($"Limit {request.Limit} exceeded maximum of 500. Capped to 500.");
            }
            else
            {
                limit = request.Limit;
            }

            // --- Input validation (hard stops) 

            if (request.MinValue.HasValue && request.MaxValue.HasValue && request.MinValue > request.MaxValue)
            {
                response.Warnings.Add("MinValue is greater than MaxValue. No results returned.");
                return response;
            }

            if (request.StartDateFrom.HasValue && request.StartDateTo.HasValue
                && request.StartDateFrom > request.StartDateTo)
            {
                response.Warnings.Add("StartDateFrom is after StartDateTo. No results returned.");
                return response;
            }

            // --- No-filter warning (fires before any filtering) 

            bool anyFilterApplied =
                !string.IsNullOrWhiteSpace(request.Department) ||
                !string.IsNullOrWhiteSpace(request.VendorName) ||
                !string.IsNullOrWhiteSpace(request.ServicesText) ||
                !string.IsNullOrWhiteSpace(request.ContractNumber) ||
                !string.IsNullOrWhiteSpace(request.FiscalYear) ||
                !string.IsNullOrWhiteSpace(request.PermittedSituation) ||
                request.MinValue.HasValue || request.MaxValue.HasValue ||
                request.StartDateFrom.HasValue || request.StartDateTo.HasValue;

            if (!anyFilterApplied)
            {
                response.Warnings.Add(
                    $"No filters applied. Returning up to {limit} records from the full dataset — " +
                    "results may not be meaningful for analysis. Consider narrowing the query.");
            }

            IEnumerable<Contract> query = _contracts;

            // 1. Record type filter
            switch (recordType)
            {
                case "original_only":
                    query = query.Where(c => !c.IsAmendment);
                    break;
                case "amendments_only":
                    query = query.Where(c => c.IsAmendment);
                    break;
                case "all":
                    // no filter
                    break;
                default:
                    response.Warnings.Add(
                        $"Unknown RecordType '{request.RecordType}'. Defaulting to 'original_only'.");
                    query = query.Where(c => !c.IsAmendment);
                    break;
            }

            // 2. Department
            if (!string.IsNullOrWhiteSpace(request.Department))
            {
                query = query.Where(c =>
                    !string.IsNullOrWhiteSpace(c.Department) &&
                    c.Department.Contains(request.Department, StringComparison.OrdinalIgnoreCase));
            }

            // 3. Vendor
            if (!string.IsNullOrWhiteSpace(request.VendorName))
            {
                query = query.Where(c =>
                    !string.IsNullOrWhiteSpace(c.VendorName) &&
                    c.VendorName.Contains(request.VendorName, StringComparison.OrdinalIgnoreCase));
            }

            // 4. Services / description
            if (!string.IsNullOrWhiteSpace(request.ServicesText))
            {
                query = query.Where(c =>
                    !string.IsNullOrWhiteSpace(c.Services) &&
                    c.Services.Contains(request.ServicesText, StringComparison.OrdinalIgnoreCase));
            }

            // 5. Contract number
            if (!string.IsNullOrWhiteSpace(request.ContractNumber))
            {
                query = query.Where(c =>
                    !string.IsNullOrWhiteSpace(c.ContractNumber) &&
                    c.ContractNumber.Contains(request.ContractNumber, StringComparison.OrdinalIgnoreCase));
            }

            // 6. Value range
            if (request.MinValue.HasValue)
                query = query.Where(c => c.Value >= request.MinValue.Value);
            if (request.MaxValue.HasValue)
                query = query.Where(c => c.Value <= request.MaxValue.Value);

            // 7. Date range
            if (request.StartDateFrom.HasValue)
            {
                query = query.Where(c =>
                    c.StartDate.HasValue && c.StartDate.Value >= request.StartDateFrom.Value);
            }
            if (request.StartDateTo.HasValue)
            {
                query = query.Where(c =>
                    c.StartDate.HasValue && c.StartDate.Value <= request.StartDateTo.Value);
            }

            // 8. Fiscal year
            if (!string.IsNullOrWhiteSpace(request.FiscalYear))
            {
                query = query.Where(c =>
                    !string.IsNullOrWhiteSpace(c.FiscalYear) &&
                    c.FiscalYear.Contains(request.FiscalYear, StringComparison.OrdinalIgnoreCase));
            }

            // 9. Permitted situation (validate letter first)
            if (!string.IsNullOrWhiteSpace(request.PermittedSituation))
            {
                var ps = request.PermittedSituation.Trim().ToLower();
                if (!PermittedSituations.Situations.ContainsKey(ps))
                {
                    response.Warnings.Add(
                        $"Unknown PermittedSituation '{request.PermittedSituation}'. " +
                        "Valid letters are a–l. Filter ignored.");
                }
                else
                {
                    query = query.Where(c =>
                        !string.IsNullOrWhiteSpace(c.PermittedSituation) &&
                        c.PermittedSituation.ToLower() == ps);
                }
            }

            // 10. Sorting
            query = query
                .OrderByDescending(c => c.StartDate ?? DateTime.MinValue)
                .ThenByDescending(c => c.Value);

            // 11. Count + scope warnings
            var totalMatches = query.Count();

            if (totalMatches == 0)
            {
                response.Warnings.Add("No contracts matched the applied filters.");
            }
            else if (totalMatches > limit)
            {
                response.Warnings.Add(
                    $"Returned {limit} of {totalMatches} matches. " +
                    "Narrow your filters or raise the limit (max 200) to see more.");
            }

            // 12. Materialize results
            var results = query
                .Take(limit)
                .Select(c => new Contract
                {
                    ContractNumber = c.ContractNumber,
                    BaseContractNumber = c.BaseContractNumber,
                    AmendmentCode = c.AmendmentCode,
                    Department = c.Department,
                    VendorName = c.VendorName,
                    Services = c.Services,
                    Value = c.Value,
                    StartDate = c.StartDate,
                    EndDate = c.EndDate,
                    FiscalYear = c.FiscalYear,
                    PermittedSituation = c.PermittedSituation
                })
                .ToList();

            // 13. Data-quality warnings on the returned rows
            if (results.Count > 0)
            {
                var missingPs = results.Count(c => string.IsNullOrWhiteSpace(c.PermittedSituation));
                if (missingPs > 0)
                    response.Warnings.Add(
                        $"{missingPs} of {results.Count} returned contracts have no PermittedSituation. " +
                        "Justification-based analysis may be incomplete.");

                var missingStart = results.Count(c => !c.StartDate.HasValue);
                if (missingStart > 0)
                    response.Warnings.Add(
                        $"{missingStart} of {results.Count} returned contracts have no StartDate. " +
                        "Date-sensitive analysis (threshold split, time clustering) may be incomplete.");

                var missingValue = results.Count(c => c.Value <= 0);
                if (missingValue > 0)
                    response.Warnings.Add(
                        $"{missingValue} of {results.Count} returned contracts have no or zero Value. " +
                        "Value-based analysis may be incomplete.");
            }

            response.TotalMatches = totalMatches;
            response.ReturnedCount = results.Count;
            response.Contracts = results;

            return response;
        }


        /// <summary>
        /// This will retun the first group of contracts that match the given contract number. 
        /// This is used for the details page, where we want to show the original contract and all its amendments together. 
        /// The contract number provided should be the base contract number (without amendment code).
        /// </summary>
        /// <param name="contractNumber"></param>
        /// <returns></returns>
        public List<Contract> GetContracts(string contractNumber)
        {
            if (string.IsNullOrWhiteSpace(contractNumber))
            {
                return new List<Contract>();
            }

            return _contracts.Where(c =>
                !string.IsNullOrWhiteSpace(c.ContractNumber) &&
                c.ContractNumber.Equals(contractNumber, StringComparison.OrdinalIgnoreCase)).ToList();
        }
    }
}
