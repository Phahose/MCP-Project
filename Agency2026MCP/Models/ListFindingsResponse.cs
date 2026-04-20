namespace Agency2026MCP.Models
{
    public class ListFindingsResponse
    {
        public List<Finding> Findings { get; init; } = new();
        public int DetectorsRun { get; init; }   // how many tools were run to generate the findings
    }
}