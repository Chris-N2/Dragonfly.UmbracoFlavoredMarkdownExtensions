namespace Dragonfly.UfmExtensions;

using System.Linq;
using System.Text.Json.Nodes;

using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Serialization;
using Umbraco.Cms.Core.Services;

/// <summary>
/// Rewrites the AngularJS label templates on the columns of every List View datatype as Umbraco Flavored Markdown.
/// Run with DryRun to report what would change without saving anything.
/// </summary>
public sealed class ListViewLabelUfmMigrator(
	IDataTypeService dataTypeService,
	IConfigurationEditorJsonSerializer configurationSerializer,
	ILogger<ListViewLabelUfmMigrator> logger)
	: LabelUfmMigratorBase<ListViewLabelUfmReport, ListViewLabelChange>(dataTypeService, configurationSerializer, logger)
{
	private const string LabelTemplatePropertyName = "nameTemplate";

	protected override string[] EditorAliases { get; } = ["Umbraco.ListView"];

	protected override bool ConvertConfiguration(IDataType DataType, JsonObject Configuration, ListViewLabelUfmReport Report)
	{
		var changed = false;

		foreach (var column in Configuration["includeProperties"]?.AsArray().OfType<JsonObject>() ?? [])
		{
			//Most columns have no label template; only report the ones that do.
			if (string.IsNullOrWhiteSpace(column[LabelTemplatePropertyName]?.GetValue<string>()))
			{
				continue;
			}

			var columnAlias = column["alias"]?.GetValue<string>() ?? "(unnamed column)";

			changed |= ConvertLabel(column, LabelTemplatePropertyName, DataType, null, columnAlias, Report);
		}

		return changed;
	}

	protected override ListViewLabelChange CreateChange(IDataType DataType, string Description, string PropertyName, BlockLabelConversion Conversion, bool Applied)
		=> new()
		{
			DataTypeName = DataType.Name ?? string.Empty,
			Column = Description,
			Property = PropertyName,
			OriginalLabel = Conversion.OriginalLabel,
			ConvertedLabel = Conversion.ConvertedLabel,
			Status = Conversion.Status.ToString(),
			Applied = Applied,
			Warnings = Conversion.Warnings,
		};
}

public class ListViewLabelUfmReport : LabelUfmReport<ListViewLabelChange>
{
}

public class ListViewLabelChange
{
	public string DataTypeName { get; set; } = string.Empty;

	public string Column { get; set; } = string.Empty;

	public string Property { get; set; } = string.Empty;

	public string OriginalLabel { get; set; } = string.Empty;

	public string ConvertedLabel { get; set; } = string.Empty;

	public string Status { get; set; } = string.Empty;

	public bool Applied { get; set; }

	public List<string> Warnings { get; set; } = [];
}

public class ListViewLabelUfmComposer : IComposer
{
	public void Compose(IUmbracoBuilder builder)
	{
		builder.Services.AddTransient<ListViewLabelUfmMigrator>();
	}
}
