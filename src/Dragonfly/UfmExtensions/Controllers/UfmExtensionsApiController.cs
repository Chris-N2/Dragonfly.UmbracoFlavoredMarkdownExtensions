using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Models.Membership;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Web.Common.Authorization;

namespace Dragonfly.UfmExtensions;

[ApiVersion("1.0")]
[ApiExplorerSettings(GroupName = "UmbracoFlavoredMarkdownExtensions")]
public class UfmExtensionsApiController : UfmExtensionsApiControllerBase
{
    private readonly IBackOfficeSecurityAccessor _backOfficeSecurityAccessor;
    private readonly BlockLabelUfmMigrator _blockLabelUfmMigrator;
    private readonly ListViewLabelUfmMigrator _listViewLabelUfmMigrator;

    public UfmExtensionsApiController(IBackOfficeSecurityAccessor backOfficeSecurityAccessor, BlockLabelUfmMigrator blockLabelUfmMigrator, ListViewLabelUfmMigrator listViewLabelUfmMigrator)
    {
        _backOfficeSecurityAccessor = backOfficeSecurityAccessor;
        _blockLabelUfmMigrator = blockLabelUfmMigrator;
        _listViewLabelUfmMigrator = listViewLabelUfmMigrator;
    }

    [HttpGet("ping")]
    [ProducesResponseType<string>(StatusCodes.Status200OK)]
    public string Ping() => "Pong";

    /// <summary>
    /// Reports how every Block List and Block Grid label would convert to UFM.
    /// </summary>
    [HttpGet("evaluateBlockLabelsToUfm")]
    [Authorize(Policy = AuthorizationPolicies.SectionAccessSettings)]
    [ProducesResponseType<BlockLabelUfmReport>(StatusCodes.Status200OK)]
    public Task<IActionResult> EvaluateBlockLabels(bool UseDragonflyUfmComponents = true, bool KeepIndexOneBased = true)
        => RunBlockLabelMigrator(DryRun: true, UseDragonflyUfmComponents, KeepIndexOneBased);

    /// <summary>
    /// Converts every Block List and Block Grid label to UFM and saves the changed datatypes.
    /// </summary>
    [HttpPost("convertBlockLabelsToUfm")]
    [Authorize(Policy = AuthorizationPolicies.SectionAccessSettings)]
    [ProducesResponseType<BlockLabelUfmReport>(StatusCodes.Status200OK)]
    public Task<IActionResult> ConvertBlockLabels(bool UseDragonflyUfmComponents = true, bool KeepIndexOneBased = true)
        => RunBlockLabelMigrator(DryRun: false, UseDragonflyUfmComponents, KeepIndexOneBased);

    /// <summary>
    /// Reports how the label template of every List View column would convert to UFM.
    /// </summary>
    [HttpGet("evaluateListViewLabelsToUfm")]
    [Authorize(Policy = AuthorizationPolicies.SectionAccessSettings)]
    [ProducesResponseType<ListViewLabelUfmReport>(StatusCodes.Status200OK)]
    public Task<IActionResult> EvaluateListViewLabels(bool UseDragonflyUfmComponents = true, bool KeepIndexOneBased = true)
        => RunListViewLabelMigrator(DryRun: true, UseDragonflyUfmComponents, KeepIndexOneBased);

    /// <summary>
    /// Converts the label template of every List View column to UFM and saves the changed datatypes.
    /// </summary>
    [HttpPost("convertListViewLabelsToUfm")]
    [Authorize(Policy = AuthorizationPolicies.SectionAccessSettings)]
    [ProducesResponseType<ListViewLabelUfmReport>(StatusCodes.Status200OK)]
    public Task<IActionResult> ConvertListViewLabels(bool UseDragonflyUfmComponents = true, bool KeepIndexOneBased = true)
        => RunListViewLabelMigrator(DryRun: false, UseDragonflyUfmComponents, KeepIndexOneBased);

    /// <summary>
    /// Checks a single UFM label for common mistakes, such as a component written as an expression or a filter
    /// argument UFM cannot parse. Saves nothing.
    /// </summary>
    [HttpGet("checkUfmSyntax")]
    [Authorize(Policy = AuthorizationPolicies.SectionAccessSettings)]
    [ProducesResponseType<UfmSyntaxCheck>(StatusCodes.Status200OK)]
    public UfmSyntaxCheck CheckUfmSyntax(string Label)
        => UfmSyntaxChecker.Check(Label);

    private Task<IActionResult> RunBlockLabelMigrator(bool DryRun, bool UseDragonflyUfmComponents, bool KeepIndexOneBased)
        => RunMigrator(_blockLabelUfmMigrator, DryRun, UseDragonflyUfmComponents, KeepIndexOneBased);

    private Task<IActionResult> RunListViewLabelMigrator(bool DryRun, bool UseDragonflyUfmComponents, bool KeepIndexOneBased)
        => RunMigrator(_listViewLabelUfmMigrator, DryRun, UseDragonflyUfmComponents, KeepIndexOneBased);

    private async Task<IActionResult> RunMigrator<TReport, TChange>(LabelUfmMigratorBase<TReport, TChange> Migrator, bool DryRun, bool UseDragonflyUfmComponents, bool KeepIndexOneBased)
        where TReport : LabelUfmReport<TChange>, new()
    {
        var currentUser = _backOfficeSecurityAccessor.BackOfficeSecurity?.CurrentUser;
        if (currentUser is null)
        {
            return Unauthorized();
        }

        var report = await Migrator.RunAsync(DryRun, currentUser.Key, UseDragonflyUfmComponents, KeepIndexOneBased);

        return Ok(report);
    }

    //[HttpGet("whatsTheTimeMrWolf")]
    //[ProducesResponseType(typeof(DateTime), 200)]
    //public DateTime WhatsTheTimeMrWolf() => DateTime.Now;

    //[HttpGet("whatsMyName")]
    //[ProducesResponseType<string>(StatusCodes.Status200OK)]
    //public string WhatsMyName()
    //{
    //    // So we can see a long request in the dashboard with a spinning progress wheel
    //    Thread.Sleep(2000);

    //    var currentUser = _backOfficeSecurityAccessor.BackOfficeSecurity?.CurrentUser;
    //    return currentUser?.Name ?? "I have no idea who you are";
    //}

    //[HttpGet("whoAmI")]
    //[ProducesResponseType<IUser>(StatusCodes.Status200OK)]
    //public IUser? WhoAmI() => _backOfficeSecurityAccessor.BackOfficeSecurity?.CurrentUser;
}

