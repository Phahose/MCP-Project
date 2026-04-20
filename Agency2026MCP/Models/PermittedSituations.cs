namespace Agency2026MCP.Models
{
    /// <summary>
    /// Maps the single-letter "Permitted Situations" code on a GoA sole-source
    /// contract to its numeric reason and human-readable description.
    ///
    /// Source: Government of Alberta Sole-Source Contracts for Government Business
    /// disclosure legend (12 permitted reasons, letters a–l).
    /// </summary>
    public class PermittedSituations
    {
        /// <summary>
        /// A single permitted-situation entry.
        /// Weight is what we are using to rank the defensibility of the reason, on a scale of 0 to 5,
        /// where 1< = legally protected or narrow carve-out (low suspicion) and
        /// 5 = highly discretionary and commonly abused (high suspicion).
        /// Detection tools use Weight as a factor in their scoring.
        /// 
        /// Letters a–l mapped to the 12 permitted reasons with their defensibility weight.
        /// </summary>
        public static readonly IReadOnlyDictionary<string, (int Number, string Reason, int Weight)> 
            
       Situations = new Dictionary<string, (int, string, int)>
       {
           ["a"] = (1, "From philanthropic institutions, prison labour, or persons with disabilities", 1),
           ["b"] = (2, "From a public body or non-profit organization", 1),
           ["c"] = (3, "Representational or promotional purposes outside Alberta", 3),
           ["d"] = (4, "Health services and social services", 1),
           ["e"] = (5, "On behalf of an entity not covered by NWPTA", 2),
           ["f"] = (6, "Entities operating sporting or convention facilities", 2),
           ["g"] = (7, "Only one supplier", 5),
           ["h"] = (8, "Unforeseeable urgency", 5),
           ["i"] = (9, "Confidential or privileged nature", 4),
           ["j"] = (10, "Lawyers and notaries", 1),
           ["k"] = (11, "Treasury services", 1),
           ["l"] = (12, "No bids received", 2),
       };
    }
}
