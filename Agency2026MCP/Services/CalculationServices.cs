#nullable disable
using Agency2026MCP.Models;
using System.Text.RegularExpressions;

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

            // Group by Department.
            var groupings = candidates
                .GroupBy(c => new { c.Department})
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
                
                var vendorgroup = group.GroupBy(c => c.VendorName)
                                .Where(g => g.Count() >= 2)
                                .ToList();

                var topVendorGroup = vendorgroup
                                    .OrderByDescending(g => g.Count())
                                    .FirstOrDefault();


                // If there are multiple vendors, identify the vendor with the most contracts in the group.
                string mostCommonVendor = topVendorGroup?.Key ?? "Multiple Vendors";

                decimal vendorTotal = topVendorGroup?.Sum(c => c.Value) ?? 0;
                decimal groupTotal = ordered.Sum(c => c.Value);

                VendorDependency vendorDependency = new VendorDependency
                {
                    VendorName = mostCommonVendor,
                    ContractCount = topVendorGroup?.Count() ?? 0,
                    TotalValue = vendorTotal,
                    DependencyRatio = groupTotal > 0 ? (double)(vendorTotal / groupTotal) : 0
                };

                decimal threshold = Thresholds.GetThreshold(ordered.First().StartDate!.Value);
                decimal combinedValue = ordered.Sum(c => c.Value);
                double combinedRatio = (double)(combinedValue / threshold);
                double avgRatio = (double)ordered.Average(c => Thresholds.GetRatio(c.Value, c.StartDate!.Value));
                

                ThresholdSplitGroup thresholdGroup = new ThresholdSplitGroup
                {
                    Department = group.Key.Department,
                   // VendorName = group.Key.VendorName,
                    VendorDependency = vendorDependency,
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

        public SoleSourceResponse CalculateSoleSourceRisk( SearchContractsResponse input)
        {
            var response = new SoleSourceResponse();

            var validContracts = input.Contracts
                .Where(c => c.StartDate.HasValue)
                .ToList();

            // filter sole source contracts first to reduce the number of comparisons needed in the nested loops    
            var validSoleSourceContracts = validContracts.Where(c => IsSoleSource(c)).ToList();
            response.TotalContractsAnalyzed = input.Contracts.Count;
            response.TotalSoleSourceContractsAnalyzed = validSoleSourceContracts.Count;

            var groups = validContracts.GroupBy(c => new { c.Department});

            foreach (var deptGroup in groups)
            {
                var groupResult = new SoleSourceGroup
                {
                    Department = deptGroup.Key.Department
                };

                foreach (var contract in deptGroup)
                {
                    var code = contract.PermittedSituation?.Trim().ToLower();

                    if (string.IsNullOrWhiteSpace(code) || !PermittedSituations.Situations.TryGetValue(code, out var permitted))
                    {
                        response.Warnings.Add( $"Contract {contract.ContractNumber} missing or invalid permitted situation.");
                        continue;
                    }

                    int weight = permitted.Weight;

                    double score = weight / 5.0;



                    string severity = weight switch
                    {
                        >= 4 => "High",
                        3 => "Medium",
                        _ => "Low"
                    };

                    groupResult.SoleSourceContracts.Add(new SoleSourceFinding
                    {
                        Contract = contract,
                        PermittedSituationCode = code,
                        PermittedSituationReason = permitted.Reason,
                        PermittedSituationWeight = weight,
                        Score = score,
                        Severity = severity
                    });
                }

                // Optional: department-level summary
                int averageGroupSevierity = groupResult.SoleSourceContracts.Any() 
                    ? (int)groupResult.SoleSourceContracts.Average(c => c.PermittedSituationWeight) 
                    : 0;
                string groupSevierity = averageGroupSevierity switch
                {
                    >= 4 => "High",
                    3 => "Medium",
                    _ => "Low"
                };
                groupResult.Severity = groupSevierity;
                groupResult.Summary = $"{groupResult.TotalSoleSoureceContracts} sole-source contracts. " + $"Average risk score: {groupResult.AverageScore:P}. total valuation at ${groupResult.TotalSoleSourceValue}";

                response.SoleSourceGroups.Add(groupResult);
            }
            return response;
        }


        //public SoleSourceResponse CalculateSoleSourceFollowOn(  SearchContractsResponse input, int windowDays = 365)
        //{
        //    var response = new SoleSourceResponse();

        //    var validContracts = input.Contracts
        //        .Where(c => c.StartDate.HasValue)
        //        .ToList();

        //    // Group by Department + Vendor
        //    var groups = validContracts
        //        .GroupBy(c => new { c.Department, c.VendorName });

        //    foreach (var group in groups)
        //    {
        //        var ordered = group
        //            .OrderBy(c => c.StartDate!.Value)
        //            .ToList();

        //        for (int i = 0; i < ordered.Count; i++)
        //        {
        //            var baseContract = ordered[i];

        //            // Only start from competitive contract
        //            if (IsSoleSource(baseContract))
        //                continue;

        //            var followOns = new List<SoleSourceFinding>();

        //            for (int j = i + 1; j < ordered.Count; j++)
        //            {
        //                var next = ordered[j];

        //                // Stop if outside time window
        //                var daysDiff = (next.StartDate!.Value - baseContract.StartDate!.Value).TotalDays;
        //                if (daysDiff > windowDays)
        //                    break;

        //                if (!IsSoleSource(next))
        //                    continue;

        //                var code = next.PermittedSituation?.Trim().ToLower();

        //                if (string.IsNullOrWhiteSpace(code) ||
        //                    !PermittedSituations.Situations.TryGetValue(code, out var permitted))
        //                {
        //                    response.Warnings.Add(
        //                        $"Contract {next.ContractNumber} missing or invalid permitted situation.");
        //                    continue;
        //                }

        //                int weight = permitted.Weight;
        //                double score = weight / 5.0;

        //                followOns.Add(new SoleSourceFinding
        //                {
        //                    Contract = next,
        //                    PermittedSituationCode = code,
        //                    PermittedSituationReason = permitted.Reason,
        //                    PermittedSituationWeight = weight,
        //                    Score = score
        //                });
        //            }

        //            if (followOns.Any())
        //            {
        //                var finding = new SoleSourceGroup
        //                {
        //                    Department = group.Key.Department,
        //                    VendorName = group.Key.VendorName,
        //                    BaseContract = baseContract,
        //                    FollowOnContracts = followOns,
        //                    FollowOnCount = followOns.Count,
        //                    AverageRiskScore = followOns.Average(f => f.Score),
        //                    TimeSpanDays =(followOns.Last().Contract.StartDate!.Value - baseContract.StartDate!.Value).TotalDays
        //                };

        //                finding.Summary =
        //                    $"{finding.VendorName} received {finding.FollowOnCount} sole-source follow-on contract(s) " +
        //                    $"after a competitive award. Avg risk: {finding.AverageRiskScore:P}. " +
        //                    $"Time span: {finding.TimeSpanDays} days.";

        //                response.SoleSourceGroups.Add(finding);
        //            }
        //        }
        //    }

        //    response.TotalContractsAnalyzed = input.Contracts.Count;
        //    response.WindowDaysUsed = windowDays;

        //    return response;
        //}

        // This will eventually be replaced with a more robust method, potentially leveraging an external NLP service or library for better semantic understanding. For now, it uses a simple Jaccard similarity based on unique word overlap.
        private bool IsSoleSource(Contract contract)
        {
            // Placeholder logic: In a real implementation, this would check specific fields or flags in the contract data to determine if it's marked as sole source.
            return contract.isSoleSource;
        }
        private double CompareDescriptions(string a, string b)
        {
            if (string.IsNullOrWhiteSpace(a) || string.IsNullOrWhiteSpace(b))
                return 0;

            var wordsA = a.ToLower().Split(' ').Distinct();
            var wordsB = b.ToLower().Split(' ').Distinct();

            var intersection = wordsA.Intersect(wordsB).Count();
            var union = wordsA.Union(wordsB).Count();

            return union == 0 ? 0 : (double)intersection / union;
        }
    }
}
