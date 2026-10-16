import { customElement, property } from "@umbraco-cms/backoffice/external/lit";
import { UmbUfmComponentBase, UmbUfmElementBase, UMB_UFM_RENDER_CONTEXT } from "@umbraco-cms/backoffice/ufm";
import type { UfmToken } from "@umbraco-cms/backoffice/ufm";
import { describeValue, linksIn } from "./describe-value.js";
import { UfmItemNameResolver } from "./item-name-resolver.js";
import { UfmLinkUrlResolver } from "./link-url-resolver.js";

type BlockValue = {
  alias: string;
  value?: unknown;
};

type BlockListValue = {
  contentData?: Array<{ values?: Array<BlockValue> }>;
};

/**
 * Reads a property of the first block in a Block List or Block Grid value. A block's properties are
 * stored as a list of `{ alias, value }` pairs, which a UFM expression cannot search.
 */
function firstBlockValue(blocksValue: unknown, valueAlias: string): unknown {
  let blocks = blocksValue;

  if (typeof blocks === "string") {
    try {
      blocks = JSON.parse(blocks);
    } catch {
      return undefined;
    }
  }

  const firstBlock = (blocks as BlockListValue | undefined)?.contentData?.[0];

  return firstBlock?.values?.find((blockValue) => blockValue.alias === valueAlias)?.value;
}

/**
 * Renders a property of the first block in a Block List or Block Grid property, such as a column's
 * label template over a Block List. `OutputType` `DisplayText` (the default) renders the value by its
 * shape; `Url` renders the URL of a link picker value.
 *
 * `blocks-alias` is the property holding the blocks (`value` in a List View column), `value-alias`
 * the property to read from the first block.
 */
@customElement("ufm-first-block-value")
export class UfmFirstBlockValueElement extends UmbUfmElementBase {
  @property({ attribute: "blocks-alias" })
  blocksAlias?: string;

  @property({ attribute: "value-alias" })
  valueAlias?: string;

  @property({ attribute: "output-type" })
  outputType?: string;

  #itemNames = new UfmItemNameResolver(this);
  #linkUrls = new UfmLinkUrlResolver(this);

  constructor() {
    super();

    this.consumeContext(UMB_UFM_RENDER_CONTEXT, (context) => {
      this.observe(
        context?.value,
        async (value) => {
          const blocksValue = this.blocksAlias && value && typeof value === "object" ? (value as never)[this.blocksAlias] : value;
          const blockValue = this.valueAlias ? firstBlockValue(blocksValue, this.valueAlias) : undefined;

          this.value = (await this.#output(blockValue)) ?? "";
        },
        "observeValue",
      );
    });
  }

  async #output(blockValue: unknown): Promise<string | undefined> {
    if (this.outputType?.toLowerCase() !== "url") {
      return describeValue(blockValue, this.#itemNames);
    }

    const urls = await Promise.all(linksIn(blockValue).map((link) => this.#linkUrls.url(link)));

    return urls.filter((url) => url).join(", ");
  }
}

/**
 * UFM component: `{dufmFirstBlockValue: BlocksAlias, ValueAlias}` or
 * `{dufmFirstBlockValue: BlocksAlias, ValueAlias, Url}`
 */
export class UfmFirstBlockValueComponent extends UmbUfmComponentBase {
  render(token: UfmToken): string | undefined {
    if (!token.text) return undefined;

    const [blocksAlias, valueAlias, outputType] = token.text.split(",").map((argument) => argument.trim());

    return `<ufm-first-block-value blocks-alias="${escapeAttribute(blocksAlias)}" value-alias="${escapeAttribute(valueAlias ?? "")}" output-type="${escapeAttribute(outputType ?? "")}"></ufm-first-block-value>`;
  }
}

function escapeAttribute(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

export { UfmFirstBlockValueComponent as api };

declare global {
  interface HTMLElementTagNameMap {
    "ufm-first-block-value": UfmFirstBlockValueElement;
  }
}
