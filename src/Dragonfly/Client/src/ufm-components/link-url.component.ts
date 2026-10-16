import { customElement, property } from "@umbraco-cms/backoffice/external/lit";
import { UmbUfmComponentBase, UmbUfmElementBase, UMB_UFM_RENDER_CONTEXT } from "@umbraco-cms/backoffice/ufm";
import type { UfmToken } from "@umbraco-cms/backoffice/ufm";
import { UfmLinkUrlResolver } from "./link-url-resolver.js";
import { parseLinkValues, withQueryString } from "./link-value.function.js";
import type { UfmLinkValue } from "./link-value.function.js";

/**
 * Renders the URL of a link picker value. Document and media links store only a key, so their URLs
 * are looked up; external links carry their URL in the value itself. The link's query string or
 * anchor is appended only when `append-query-string` is set.
 */
@customElement("ufm-link-url")
export class UfmLinkUrlElement extends UmbUfmElementBase {
  @property()
  alias?: string;

  @property({ type: Boolean, attribute: "append-query-string" })
  appendQueryString = false;

  #linkUrls = new UfmLinkUrlResolver(this);

  constructor() {
    super();

    this.consumeContext(UMB_UFM_RENDER_CONTEXT, (context) => {
      this.observe(
        context?.value,
        async (value) => {
          const propertyValue = this.alias && typeof value === "object" ? (value as never)[this.alias] : value;
          const links = parseLinkValues(propertyValue);
          if (!links.length) {
            this.value = "";
            return;
          }

          const urls = await Promise.all(links.map((link) => this.#url(link)));

          this.value = urls.filter((url) => url).join(", ");
        },
        "observeValue",
      );
    });
  }

  async #url(link: UfmLinkValue): Promise<string> {
    const url = await this.#linkUrls.url(link);

    return (this.appendQueryString ? withQueryString(link, url) : url) || "";
  }
}

/**
 * UFM component: `{dufmLinkUrl: myLink}`
 */
export class UfmLinkUrlComponent extends UmbUfmComponentBase {
  render(token: UfmToken): string | undefined {
    return token.text ? `<ufm-link-url ${super.getAttributes(token.text)}></ufm-link-url>` : undefined;
  }
}

export { UfmLinkUrlComponent as api };

declare global {
  interface HTMLElementTagNameMap {
    "ufm-link-url": UfmLinkUrlElement;
  }
}
