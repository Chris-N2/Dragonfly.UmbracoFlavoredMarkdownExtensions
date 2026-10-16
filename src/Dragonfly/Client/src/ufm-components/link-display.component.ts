import { customElement, property } from "@umbraco-cms/backoffice/external/lit";
import { UmbUfmComponentBase, UmbUfmElementBase, UMB_UFM_RENDER_CONTEXT } from "@umbraco-cms/backoffice/ufm";
import type { UfmToken } from "@umbraco-cms/backoffice/ufm";
import { UfmItemNameResolver } from "./item-name-resolver.js";
import { describeLink } from "./describe-value.js";
import { parseLinkValues } from "./link-value.function.js";

/**
 * Describes a link picker value the way AngularJS labels did: the linked item's name when one is
 * picked, otherwise the link title, otherwise the URL with its query string or anchor.
 */
@customElement("ufm-link-display")
export class UfmLinkDisplayElement extends UmbUfmElementBase {
  @property()
  alias?: string;

  #itemNames = new UfmItemNameResolver(this);

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

          const labels = await Promise.all(links.map((link) => describeLink(link, this.#itemNames)));

          this.value = labels.filter((label) => label).join(", ");
        },
        "observeValue",
      );
    });
  }
}

/**
 * UFM component: `{dufmLinkDisplay: myLink}`
 */
export class UfmLinkDisplayComponent extends UmbUfmComponentBase {
  render(token: UfmToken): string | undefined {
    return token.text ? `<ufm-link-display ${super.getAttributes(token.text)}></ufm-link-display>` : undefined;
  }
}

export { UfmLinkDisplayComponent as api };

declare global {
  interface HTMLElementTagNameMap {
    "ufm-link-display": UfmLinkDisplayElement;
  }
}
