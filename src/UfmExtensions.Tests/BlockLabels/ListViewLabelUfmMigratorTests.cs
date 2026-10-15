using Microsoft.Extensions.Logging.Abstractions;
using NSubstitute;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Serialization;
using Umbraco.Cms.Core.Services;

namespace Dragonfly.UfmExtensions.Tests;

public class ListViewLabelUfmMigratorTests
{
	private const string Configuration = """
		{"includeProperties":[
			{"alias":"updateDate","header":"Last edited","isSystem":true},
			{"alias":"title","header":"Title","nameTemplate":"{{title}}"},
			{"alias":"plain","header":"Plain","nameTemplate":"Static text"}
		]}
		""";

	private readonly IDataTypeService _dataTypeService = Substitute.For<IDataTypeService>();
	private readonly IConfigurationEditorJsonSerializer _serializer = Substitute.For<IConfigurationEditorJsonSerializer>();
	private readonly IDataType _dataType = Substitute.For<IDataType>();
	private string? _savedConfiguration;

	public ListViewLabelUfmMigratorTests()
	{
		_dataType.EditorAlias.Returns("Umbraco.ListView");
		_dataType.Name.Returns("List View - Assets Listing");
		_dataTypeService.GetAllAsync().Returns(Task.FromResult<IEnumerable<IDataType>>([_dataType]));
		_serializer.Serialize(Arg.Any<object?>()).Returns(Configuration);
		_serializer.Deserialize<Dictionary<string, object>>(Arg.Any<string>())
			.Returns(call =>
			{
				_savedConfiguration = call.Arg<string>();
				return new Dictionary<string, object>();
			});
	}

	private ListViewLabelUfmMigrator CreateMigrator()
		=> new(_dataTypeService, _serializer, NullLogger<ListViewLabelUfmMigrator>.Instance);

	[Fact]
	public async Task Dry_run_reports_conversions_without_saving()
	{
		var report = await CreateMigrator().RunAsync(DryRun: true, Guid.NewGuid());

		var converted = Assert.Single(report.LabelsConverted);
		Assert.Equal("title", converted.Column);
		Assert.Equal("${ title }", converted.ConvertedLabel);
		Assert.False(converted.Applied);
		Assert.Equal(1, report.DataTypesScanned);
		Assert.Equal(0, report.DataTypesSaved);
		await _dataTypeService.DidNotReceiveWithAnyArgs().UpdateAsync(default!, default);
	}

	[Fact]
	public async Task Columns_without_a_label_template_are_ignored()
	{
		var report = await CreateMigrator().RunAsync(DryRun: true, Guid.NewGuid());

		Assert.Equal("plain", Assert.Single(report.LabelsUnchanged).Column);
		Assert.Empty(report.LabelsNeedingReview);
	}

	[Fact]
	public async Task Convert_saves_the_changed_datatype()
	{
		var report = await CreateMigrator().RunAsync(DryRun: false, Guid.NewGuid());

		Assert.Equal(1, report.DataTypesSaved);
		Assert.True(Assert.Single(report.LabelsConverted).Applied);
		Assert.Contains("${ title }", _savedConfiguration);
		await _dataTypeService.ReceivedWithAnyArgs(1).UpdateAsync(default!, default);
	}
}
