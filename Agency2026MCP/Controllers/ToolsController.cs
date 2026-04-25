using Microsoft.AspNetCore.Mvc;
using Agency2026MCP.Models;
using Agency2026MCP.Services;
namespace Agency2026MCP.Controllers
{
    public class ToolsController : Controller
    {
        private readonly SearchServices _searchServices;
        private readonly CalculationServices _calculationServices;

        public ToolsController(SearchServices searchServices, CalculationServices calculationServices)
        {
            _searchServices = searchServices;
            _calculationServices = calculationServices;
        }

        [HttpPost("search_contracts")]
        public IActionResult SearchContracts([FromBody] SearchContractsRequest request)
        {
            var response = _searchServices.Search(request);

            return Ok(response);
        }
        [HttpPost("calculate_amendment_creep")]
        public IActionResult CalculateAmendmentCreep([FromBody] SearchContractsResponse searchContractResponse)
        {
            var creepResult = _calculationServices.CalculateAmendmentCreep(searchContractResponse);
            return Ok(creepResult);
        }

        [HttpPost("calculate_threshold_split")]
        public IActionResult CalculateThresholdSplit([FromBody] SearchContractsResponse searchContractResponse, double proximityLimit = 0.85, int windowDays = 90)
        {
            var splitResult = _calculationServices.CalculateThresholdSplit(searchContractResponse, proximityLimit, windowDays);
            return Ok(splitResult);
        }
        [HttpGet("list_departments")]
        public IActionResult ListDepartments()
        {
            var departments = _searchServices.ListDepartments();
            return Ok(departments);
        }
        [HttpGet("list_vendors")]
        public IActionResult ListVendors([FromQuery] string vendorNameContains)
        {
            var vendors = _searchServices.ListVendors(vendorNameContains);
            return Ok(vendors);
        }
        [HttpPost("calculate_sole_source_followon")]
        public IActionResult CalculateSoleSourceFollowOn([FromBody] SearchContractsResponse searchContractResponse)
        {
            var riskResult = _calculationServices.CalculateSoleSourceFollowOn(searchContractResponse);
            return Ok(riskResult);
        }

    }
}
