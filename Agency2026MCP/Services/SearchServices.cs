using Agency2026MCP.Models;
using Dapper;
using Npgsql;

namespace Agency2026MCP.Services
{
    public class SearchServices
    {
        private readonly NpgsqlConnection _db;

        // This is the base SELECT used in both Search() and GetContracts()
        // It parses the contract number into base + amendment code on the fly
        private const string BaseSelect = @"
            SELECT
                contract_number                                                     AS ContractNumber,
                REGEXP_REPLACE(contract_number, '\s*\([a-z]\)$', '', 'i')         AS BaseContractNumber,
                CASE 
                    WHEN contract_number ~ '\([a-z]\)$' 
                    THEN REGEXP_REPLACE(contract_number, '^.*\(([a-z])\)$', '\1', 'i')
                    ELSE NULL 
                END                                                                 AS AmendmentCode,
                ministry                                                            AS Department,
                vendor                                                              AS VendorName,
                contract_services                                                   AS Services,
                amount                                                              AS Value,
                start_date                                                          AS StartDate,
                end_date                                                            AS EndDate,
                display_fiscal_year                                                 AS FiscalYear,
                permitted_situations                                                AS PermittedSituation,
                TRUE                                                                AS IsSoleSource
            FROM ab.ab_sole_source";

        // Junk contract numbers we want to exclude from all queries
        private const string ExcludeJunk = @"
            contract_number NOT IN ('N/A', 'NA', 'n/a', 'Standing Offer', 
                                    'standing offer', 'FDH', 'CCIS', 'NA ', 'n/A')
            AND contract_number IS NOT NULL
            AND TRIM(contract_number) != ''";

        public SearchServices(NpgsqlConnection db)
        {
            _db = db;
        }

        public List<string> ListDepartments()
        {
            var sql = @"
                SELECT DISTINCT TRIM(ministry) AS department
                FROM ab.ab_sole_source
                WHERE ministry IS NOT NULL 
                  AND TRIM(ministry) != ''
                ORDER BY department";

            return _db.Query<string>(sql).ToList();
        }

        public List<string> ListVendors(string vendorNameContains)
        {
            var sql = @"
                SELECT DISTINCT TRIM(vendor) AS vendor
                FROM ab.ab_sole_source
                WHERE vendor ILIKE @search
                  AND vendor IS NOT NULL
                  AND TRIM(vendor) != ''
                ORDER BY vendor";

            return _db.Query<string>(sql, new { search = $"%{vendorNameContains}%" }).ToList();
        }

        public SearchContractsResponse Search(SearchContractsRequest request)
        {
            var response = new SearchContractsResponse { AppliedFilters = request };

            // --- Normalize limit
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

            // --- Hard stop validations
            if (request.MinValue.HasValue && request.MaxValue.HasValue
                && request.MinValue > request.MaxValue)
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

            // --- No filter warning
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

            // --- Validate permitted situation
            if (!string.IsNullOrWhiteSpace(request.PermittedSituation))
            {
                var ps = request.PermittedSituation.Trim().ToLower();
                if (!PermittedSituations.Situations.ContainsKey(ps))
                {
                    response.Warnings.Add(
                        $"Unknown PermittedSituation '{request.PermittedSituation}'. " +
                        "Valid letters are a–l. Filter ignored.");
                    request.PermittedSituation = null;
                }
            }

            // --- Build WHERE conditions
            var conditions = new List<string> { ExcludeJunk };
            var parameters = new DynamicParameters();

            // Record type
            var recordType = (request.RecordType ?? "original_only").ToLower();
            switch (recordType)
            {
                case "original_only":
                    conditions.Add("contract_number !~ '\\([a-z]\\)$'");
                    break;
                case "amendments_only":
                    conditions.Add("contract_number ~ '\\([a-z]\\)$'");
                    break;
                case "all":
                    break;
                default:
                    response.Warnings.Add(
                        $"Unknown RecordType '{request.RecordType}'. Defaulting to 'original_only'.");
                    conditions.Add("contract_number !~ '\\([a-z]\\)$'");
                    break;
            }

            if (!string.IsNullOrWhiteSpace(request.Department))
            {
                conditions.Add("ministry ILIKE @department");
                parameters.Add("department", $"%{request.Department}%");
            }

            if (!string.IsNullOrWhiteSpace(request.VendorName))
            {
                conditions.Add("vendor ILIKE @vendor");
                parameters.Add("vendor", $"%{request.VendorName}%");
            }

            if (!string.IsNullOrWhiteSpace(request.ServicesText))
            {
                conditions.Add("contract_services ILIKE @services");
                parameters.Add("services", $"%{request.ServicesText}%");
            }

            if (!string.IsNullOrWhiteSpace(request.ContractNumber))
            {
                conditions.Add("contract_number ILIKE @contractNumber");
                parameters.Add("contractNumber", $"%{request.ContractNumber}%");
            }

            if (request.MinValue.HasValue)
            {
                conditions.Add("amount >= @minValue");
                parameters.Add("minValue", request.MinValue.Value);
            }

            if (request.MaxValue.HasValue)
            {
                conditions.Add("amount <= @maxValue");
                parameters.Add("maxValue", request.MaxValue.Value);
            }

            if (request.StartDateFrom.HasValue)
            {
                conditions.Add("start_date >= @startDateFrom");
                parameters.Add("startDateFrom", request.StartDateFrom.Value);
            }

            if (request.StartDateTo.HasValue)
            {
                conditions.Add("start_date <= @startDateTo");
                parameters.Add("startDateTo", request.StartDateTo.Value);
            }

            if (!string.IsNullOrWhiteSpace(request.FiscalYear))
            {
                conditions.Add("display_fiscal_year ILIKE @fiscalYear");
                parameters.Add("fiscalYear", $"%{request.FiscalYear}%");
            }

            if (!string.IsNullOrWhiteSpace(request.PermittedSituation))
            {
                conditions.Add("LOWER(permitted_situations) = @permittedSituation");
                parameters.Add("permittedSituation",
                    request.PermittedSituation.Trim().ToLower());
            }

            var whereClause = "WHERE " + string.Join(" AND ", conditions);

            // --- Count total matches
            var countSql = $"SELECT COUNT(*) FROM ab.ab_sole_source {whereClause}";
            var totalMatches = _db.ExecuteScalar<int>(countSql, parameters);

            if (totalMatches == 0)
            {
                response.Warnings.Add("No contracts matched the applied filters.");
                response.TotalMatches = 0;
                response.ReturnedCount = 0;
                return response;
            }

            if (totalMatches > limit)
            {
                response.Warnings.Add(
                    $"Returned {limit} of {totalMatches} matches. " +
                    "Narrow your filters or raise the limit (max 500) to see more.");
            }

            // --- Fetch results
            parameters.Add("limit", limit);

            var sql = $@"
                {BaseSelect}
                {whereClause}
                ORDER BY start_date DESC NULLS LAST, amount DESC
                LIMIT @limit";

            var results = _db.Query<Contract>(sql, parameters).ToList();

            // --- Data quality warnings
            var missingPs = results.Count(c =>
                string.IsNullOrWhiteSpace(c.PermittedSituation));
            if (missingPs > 0)
                response.Warnings.Add(
                    $"{missingPs} of {results.Count} returned contracts have no " +
                    "PermittedSituation. Justification-based analysis may be incomplete.");

            var missingStart = results.Count(c => !c.StartDate.HasValue);
            if (missingStart > 0)
                response.Warnings.Add(
                    $"{missingStart} of {results.Count} returned contracts have no " +
                    "StartDate. Date-sensitive analysis may be incomplete.");

            var missingValue = results.Count(c => c.Value <= 0);
            if (missingValue > 0)
                response.Warnings.Add(
                    $"{missingValue} of {results.Count} returned contracts have no " +
                    "or zero Value. Value-based analysis may be incomplete.");

            response.TotalMatches = totalMatches;
            response.ReturnedCount = results.Count;
            response.Contracts = results;

            return response;
        }

        public List<Contract> GetContracts(string contractNumber)
        {
            if (string.IsNullOrWhiteSpace(contractNumber))
                return new List<Contract>();

            var sql = $@"
                {BaseSelect}
                WHERE REGEXP_REPLACE(contract_number, '\s*\([a-z]\)$', '', 'i') 
                      ILIKE @contractNumber
                  AND {ExcludeJunk}
                ORDER BY start_date ASC NULLS LAST, end_date ASC NULLS LAST";

            return _db.Query<Contract>(sql,
                new { contractNumber = $"%{contractNumber}%" }).ToList();
        }
    }
}