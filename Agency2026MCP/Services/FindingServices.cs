using Agency2026MCP.Models;

namespace Agency2026MCP.Services
{
    public class FindingServices
    {
        public ListFindingsResponse ListFindings(ListFindingsRequest req)
        {
            var findings = new List<Finding>();

            if (req.AmendmentCreepResult is not null)
            {
                var r = req.AmendmentCreepResult;
                findings.Add(new Finding
                {
                    Type = "AmendmentCreep",
                    Severity = r.Severity,
                    Department = r.Department,
                    VendorName = r.OriginalVendorName,
                    AmendmentCreep = r
                });
            }

            if (req.ThresholdSplitResult is not null)
            {
                foreach (var g in req.ThresholdSplitResult.SuspiciousGroups)
                {
                    findings.Add(new Finding
                    {
                        Type = "ThresholdSplit",
                        Severity = g.Severity,
                        Department = g.Department,
                        VendorName = g.VendorName,
                        ThresholdSplit = g
                    });
                }
            }

            //if (req.SoleSourceFollowOnResult is not null)
            //{
            //    var r = req.SoleSourceFollowOnResult;
            //    findings.Add(new Finding
            //    {
            //        Type = "sole_source_follow_on",
            //        Severity = r.Severity,
            //        Department = r.Department,
            //        VendorName = r.VendorName,
            //        FollowOn = r
            //    });
            //}

            return new ListFindingsResponse { Findings = findings };
        }
    }
}

