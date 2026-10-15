namespace Dragonfly.UfmExtensions;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Nodes;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Serialization;
using Umbraco.Cms.Core.Services;

/// <summary>
/// Walks every datatype of the editors a derived migrator handles, converting the AngularJS labels in its
/// configuration to Umbraco Flavored Markdown. Run with DryRun to report what would change without saving anything.
/// </summary>
public abstract class LabelUfmMigratorBase<TReport, TChange>(
	IDataTypeService dataTypeService,
	IConfigurationEditorJsonSerializer configurationSerializer,
	ILogger logger)
	where TReport : LabelUfmReport<TChange>, new()
{
	protected abstract string[] EditorAliases { get; }

	/// <summary>
	/// Converts the labels in one datatype's configuration in place, returning whether any changed.
	/// </summary>
	protected abstract bool ConvertConfiguration(IDataType DataType, JsonObject Configuration, TReport Report);

	protected abstract TChange CreateChange(IDataType DataType, string Description, string PropertyName, BlockLabelConversion Conversion, bool Applied);

	public async Task<TReport> RunAsync(bool DryRun, Guid UserKey, bool UseDragonflyUfmComponents = true, bool KeepIndexOneBased = true)
	{
		var report = new TReport
		{
			DryRun = DryRun,
			UseDragonflyUfmComponents = UseDragonflyUfmComponents,
			KeepIndexOneBased = KeepIndexOneBased,
		};

		var dataTypes = (await dataTypeService.GetAllAsync())
			.Where(x => EditorAliases.Contains(x.EditorAlias))
			.ToList();

		foreach (var dataType in dataTypes)
		{
			report.DataTypesScanned++;

			var configuration = JsonNode.Parse(configurationSerializer.Serialize(dataType.ConfigurationData))?.AsObject();
			if (configuration is null)
			{
				continue;
			}

			var changed = ConvertConfiguration(dataType, configuration, report);

			if (!changed || DryRun)
			{
				continue;
			}

			var updated = configurationSerializer.Deserialize<Dictionary<string, object>>(configuration.ToJsonString());
			if (updated is null)
			{
				logger.LogWarning("{Migrator} : Unable to rebuild the configuration for datatype '{DataTypeName}'", GetType().Name, dataType.Name);
				continue;
			}

			dataType.ConfigurationData = updated;
			await dataTypeService.UpdateAsync(dataType, UserKey);
			report.DataTypesSaved++;

			logger.LogInformation("{Migrator} : Updated labels on datatype '{DataTypeName}'", GetType().Name, dataType.Name);
		}

		return report;
	}

	protected bool ConvertLabel(JsonObject Owner, string PropertyName, IDataType DataType, string? ContentTypeName, string Description, TReport Report)
	{
		var label = Owner[PropertyName]?.GetValue<string>();
		var conversion = BlockLabelUfmConverter.Convert(label, ContentTypeName, Report.UseDragonflyUfmComponents, Report.KeepIndexOneBased);

		switch (conversion.Status)
		{
			case BlockLabelConversionStatus.NoChangeNeeded:
				Report.LabelsUnchanged.Add(CreateChange(DataType, Description, PropertyName, conversion, Applied: false));
				return false;

			//Half-converting a label that needs a UFM component would leave it broken, so leave it as it is.
			case BlockLabelConversionStatus.NeedsManualReview:
				Report.LabelsNeedingReview.Add(CreateChange(DataType, Description, PropertyName, conversion, Applied: false));
				return false;

			default:
				Owner[PropertyName] = conversion.ConvertedLabel;
				Report.LabelsConverted.Add(CreateChange(DataType, Description, PropertyName, conversion, Applied: !Report.DryRun));
				return true;
		}
	}
}

public abstract class LabelUfmReport<TChange>
{
	public bool DryRun { get; set; }

	public bool UseDragonflyUfmComponents { get; set; }

	public bool KeepIndexOneBased { get; set; }

	public int DataTypesScanned { get; set; }

	public int DataTypesSaved { get; set; }

	public int LabelsNeedingReviewCount => LabelsNeedingReview.Count;

	public int LabelsConvertedCount => LabelsConverted.Count;

	public int LabelsUnchangedCount => LabelsUnchanged.Count;

	public List<TChange> LabelsNeedingReview { get; set; } = [];

	public List<TChange> LabelsConverted { get; set; } = [];

	public List<TChange> LabelsUnchanged { get; set; } = [];
}
