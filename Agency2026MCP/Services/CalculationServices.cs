#nullable disable
using Agency2026MCP.Models;

namespace Agency2026MCP.Services
{
    public class CalculationServices
    {
        public List<AmendmentCreepResponse> CalculateAmendmentCreep(SearchContractsResponse searchContractResponse)
        {
            // Group contracts by base contract number
            var groupedContracts = searchContractResponse.Contracts.GroupBy(c => c.BaseContractNumber);
            decimal totalCreep = 0;
            List<AmendmentCreepResponse> amendmentCreepResponses = new List<AmendmentCreepResponse>();
            foreach (var group in groupedContracts)
            {
                AmendmentCreepResponse response = new AmendmentCreepResponse();
                var original = group.FirstOrDefault(c => !c.IsAmendment);
               
                DateTime earlieststartDate = group.Where(c => c.StartDate.HasValue).Min(c => c.StartDate.Value);
                DateTime latestStartDate = group.Where(c => c.StartDate.HasValue).Max(c => c.StartDate.Value);
                int numberOfAmendments = group.Count(c => c.IsAmendment);
                if (original == null)
                {
                    continue; // No original contract, skip
                }

                response.ContractdurationInDays = earlieststartDate != default && latestStartDate != default
                    ? (int)(latestStartDate - earlieststartDate).TotalDays
                    : 0;
                response.AmendmentIntensity = response.ContractdurationInDays > 0
                    ? numberOfAmendments / (decimal)response.ContractdurationInDays
                    : 0; 
                response.OriginalContractNumber = original.ContractNumber;
                response.OriginalVendorName = original.VendorName;
                response.OriginalContractValue = original.Value;
                response.OriginalContractServices = original.Services;

                var amendments = group.Where(c => c.IsAmendment).ToList();


                if (!amendments.Any())
                {
                    continue;
                }

                decimal originalValue = original.Value;

                decimal maxAmendedValue = amendments.Max(a => a.Value);
                response.TotalAmendmentValue = amendments.Sum(a => a.Value);
                response.FinalContractValue = response.TotalAmendmentValue + originalValue;
                response.MaxAmendmentValue = maxAmendedValue;
                response.MaxAmendmentServices = amendments.FirstOrDefault(a => a.Value == maxAmendedValue)?.Services;

                if (maxAmendedValue > originalValue)
                {
                    totalCreep += (maxAmendedValue - originalValue);
                }
                response.TotalAmendmentCreep = maxAmendedValue - originalValue;
                response.TotalContractsAnalyzed = group.Count();
                response.ContractsWithCreep = amendments.Where(a => a.Value > originalValue).ToList();

                if (response.CreepRatio <= 2)
                {
                    response.Severity = "low";
                }
                else if (response.CreepRatio <= 5)
                {
                    response.Severity = "medium";
                }
                else
                {
                    response.Severity = "high";
                }
                amendmentCreepResponses.Add(response);
            }

            return amendmentCreepResponses;
        }

        public ThresholdSplitResponse CalculateThresholdSplit(SearchContractsResponse input, double proximityLimit = 0.85, int windowDays = 90)
        {
            // 1. Keep only contracts sitting just below the applicable threshold.
            List<Contract> candidates = input.Contracts
                .Where(c => c.StartDate.HasValue)
                .Where(c =>
                {
                    var ratio = Thresholds.GetRatio(c.Value, c.StartDate.Value);
                    return ratio >= (decimal)proximityLimit && ratio < 1.0m;
                })
                .ToList();

            // Group by Department and Vendor.
            var groupings = candidates
                .GroupBy(c => new { c.Department, c.VendorName })
                .Where(g => g.Count() >= 2);

            // Keep only groups where contracts cluster in short time windows.
            var response = new ThresholdSplitResponse();


            // Identify and warn about contracts that were excluded due to missing start dates, as they cannot be analyzed for time-based clustering.
            var skipped = input.Contracts
                      .Where(c => !c.StartDate.HasValue)
                      .ToList();

            if (skipped.Any())
            {
                const int maxShown = 10;
                var showncontractNumbers = skipped.Take(maxShown).Select(c => c.ContractNumber);
                var suffix = skipped.Count > maxShown
                    ? $" (and {skipped.Count - maxShown} more)"
                    : "";

                response.Warnings.Add(
                    $"{skipped.Count} contract(s) excluded — missing start date: " +
                    $"{string.Join(", ", showncontractNumbers)}{suffix}");
            }

            foreach (var group in groupings)
            {
                var ordered = group.OrderBy(c => c.StartDate!.Value).ToList();
                var spanDays = (ordered.Last().StartDate!.Value - ordered.First().StartDate!.Value).TotalDays;
                if (spanDays > windowDays)
                {
                    continue;
                }
                
                decimal threshold = Thresholds.GetThreshold(ordered.First().StartDate!.Value);
                decimal combinedValue = ordered.Sum(c => c.Value);
                double combinedRatio = (double)(combinedValue / threshold);
                double avgRatio = (double)ordered.Average(c => Thresholds.GetRatio(c.Value, c.StartDate!.Value));

                ThresholdSplitGroup thresholdGroup = new ThresholdSplitGroup
                {
                    Department = group.Key.Department,
                    VendorName = group.Key.VendorName,
                    ThresholdLimit = threshold,
                    CombinedRatioToThreshold = combinedRatio,
                    AverageThresholdRatio = avgRatio,
                    Severity = Thresholds.GetSeverity(ordered.Count, combinedRatio),
                    Summary = $"Group of {ordered.Count} contracts with an average ratio of {avgRatio:P} " +
                              $"to the threshold, all within a {spanDays}-day window."
                };

                foreach (var contract in ordered)
                {
                    ThresholdSplitMember member = new ThresholdSplitMember
                    {
                        Contract = contract,
                        IsBelowThreshold = true, // Validation has already ensured this
                        ThresholdRatio = Thresholds.GetRatio(contract.Value, contract.StartDate ?? DateTime.Now)
                    };

                    thresholdGroup.GroupMembers.Add(member);
                }
               
                response.SuspiciousGroups.Add(thresholdGroup);
            }
          
            response.TotalContractsAnalyzed = input.Contracts.Count;
            response.ContractsValueProximityLimit = proximityLimit;
            response.WindowDaysUsed = windowDays;
            return response;
        }
    }
}
