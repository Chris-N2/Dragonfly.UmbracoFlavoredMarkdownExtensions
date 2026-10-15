namespace Dragonfly.UfmExtensions;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Nodes;
using System.Threading.Tasks;

using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Serialization;
using Umbraco.Cms.Core.Services;

/// <summary>
/// Rewrites the AngularJS block labels on every Block List and Block Grid datatype as Umbraco Flavored Markdown.
/// Run with DryRun to report what would change without saving anything.
/// </summary>
public sealed class BlockLabelUfmMigrator(
	IDataTypeService dataTypeService,
	IContentTypeService contentTypeService,
	IConfigurationEditorJsonSerializer configurationSerializer,
	ILogger<BlockLabelUfmMigrator> logger)
	: LabelUfmMigratorBase<BlockLabelUfmReport, BlockLabelChange>(dataTypeService, configurationSerializer, logger)
{
	protected override string[] EditorAliases { get; } = ["Umbraco.BlockList", "Umbraco.BlockGrid"];

	protected override bool ConvertConfiguration(IDataType DataType, JsonObject Configuration, BlockLabelUfmReport Report)
		=> ConvertBlocks(DataType, Configuration, Report);

	protected override BlockLabelChange CreateChange(IDataType DataType, string Description, string PropertyName, BlockLabelConversion Conversion, bool Applied)
		=> BlockLabelChange.From(DataType, Description, PropertyName, Conversion, Applied);

	private bool ConvertBlocks(IDataType DataType, JsonObject Configuration, BlockLabelUfmReport Report)
	{
		var changed = false;

		foreach (var block in Configuration["blocks"]?.AsArray().OfType<JsonObject>() ?? [])
		{
			var contentTypeName = ContentTypeName(block["contentElementTypeKey"]?.GetValue<string>());

			changed |= ConvertLabel(block, "label", DataType, contentTypeName, contentTypeName ?? "(unknown block)", Report);

			//Block Grid areas carry their own label for the create button.
			foreach (var area in block["areas"]?.AsArray().OfType<JsonObject>() ?? [])
			{
				var areaAlias = area["alias"]?.GetValue<string>() ?? "(unnamed area)";
				var description = $"{contentTypeName ?? "(unknown block)"} > area '{areaAlias}'";

				changed |= ConvertLabel(area, "createLabel", DataType, contentTypeName, description, Report);
			}
		}

		return changed;
	}

	private string? ContentTypeName(string? ContentElementTypeKey)
	{
		return Guid.TryParse(ContentElementTypeKey, out var key)
			? contentTypeService.Get(key)?.Name
			: null;
	}
}

public class BlockLabelUfmReport : LabelUfmReport<BlockLabelChange>
{
}

public class BlockLabelChange
{
	public string DataTypeName { get; set; } = string.Empty;

	public string Block { get; set; } = string.Empty;

	public string Property { get; set; } = string.Empty;

	public string OriginalLabel { get; set; } = string.Empty;

	public string ConvertedLabel { get; set; } = string.Empty;

	public string Status { get; set; } = string.Empty;

	public bool Applied { get; set; }

	public List<string> Warnings { get; set; } = [];

	internal static BlockLabelChange From(IDataType DataType, string Description, string PropertyName, BlockLabelConversion Conversion, bool Applied)
	{
		return new BlockLabelChange
		{
			DataTypeName = DataType.Name ?? string.Empty,
			Block = Description,
			Property = PropertyName,
			OriginalLabel = Conversion.OriginalLabel,
			ConvertedLabel = Conversion.ConvertedLabel,
			Status = Conversion.Status.ToString(),
			Applied = Applied,
			Warnings = Conversion.Warnings,
		};
	}
}

public class BlockLabelUfmComposer : IComposer
{
	public void Compose(IUmbracoBuilder builder)
	{
		builder.Services.AddTransient<BlockLabelUfmMigrator>();
	}
}
