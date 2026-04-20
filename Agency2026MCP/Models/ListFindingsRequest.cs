namespace Agency2026MCP.Models
{
    public class ListFindingsRequest
    {
        public AmendmentCreepResponse? AmendmentCreepResult { get; init; }
        public ThresholdSplitResponse? ThresholdSplitResult { get; init; }

        // I will add SoleSource payload later if we want to implement that finding type have to discuss with team about what details to include
        // public SoleSourceFollowOnResponse? SoleSourceFollowOnResult { get; init; }
    }
}
