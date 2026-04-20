namespace Agency2026MCP.Models
{
    public class Thresholds
    {
        // Old vs new threshold
        public const decimal OldThreshold = 75000m;
        public const decimal NewThreshold = 135000m;
        // Date when new threshold starts
        public static DateTime ChangeDate = new DateTime(2026, 1, 1);

        // 1. Get threshold based on date
        public static decimal GetThreshold(DateTime date)
        {
            if (date >= ChangeDate)
                return NewThreshold;

            return OldThreshold;
        }

        // 2. Check if value is below threshold
        public static bool IsBelow(decimal value, DateTime date)
        {
            return value < GetThreshold(date);
        }

        // 3. How close is value to threshold (0–1+)
        public static decimal GetRatio(decimal value, DateTime date)
        {
            decimal threshold = GetThreshold(date);

            if (threshold == 0)
                return 0;

            return value / threshold;
        }

        public static string GetSeverity(int contractCount, double combinedRatio)
        {
            if (contractCount >= 3 && combinedRatio >= 2.0) return "high";
            if (contractCount >= 2 && combinedRatio >= 1.5) return "medium";
            return "low";
        }
    }
}
