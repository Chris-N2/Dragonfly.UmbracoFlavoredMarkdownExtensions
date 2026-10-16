import type { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";
import { UMB_DOCUMENT_ENTITY_TYPE, UmbDocumentUrlRepository } from "@umbraco-cms/backoffice/document";
import { UMB_MEDIA_ENTITY_TYPE, UmbMediaUrlRepository } from "@umbraco-cms/backoffice/media";
import type { UfmLinkValue } from "./link-value.function.js";

/**
 * Looks up the URL of a link picker value. Document and media links store only a key, so their URLs
 * are looked up; external links carry their URL in the value itself.
 */
export class UfmLinkUrlResolver {
  #host: UmbControllerHost;
  #documentUrlRepository?: UmbDocumentUrlRepository;
  #mediaUrlRepository?: UmbMediaUrlRepository;

  constructor(host: UmbControllerHost) {
    this.#host = host;
  }

  async url(link: UfmLinkValue): Promise<string | undefined> {
    return (await this.#lookupUrl(link)) || link?.url;
  }

  async #lookupUrl(link: UfmLinkValue): Promise<string | undefined> {
    if (!link?.unique) return undefined;

    if (link.type === UMB_MEDIA_ENTITY_TYPE) {
      this.#mediaUrlRepository ??= new UmbMediaUrlRepository(this.#host);

      const { data } = await this.#mediaUrlRepository.requestItems([link.unique]).catch(() => ({ data: undefined }));
      return Array.isArray(data) ? data[0]?.url : undefined;
    }

    if (link.type === UMB_DOCUMENT_ENTITY_TYPE) {
      this.#documentUrlRepository ??= new UmbDocumentUrlRepository(this.#host);

      const { data } = await this.#documentUrlRepository.requestUrls([link.unique]).catch(() => ({ data: undefined }));
      return Array.isArray(data) ? data[0]?.urls?.[0]?.url : undefined;
    }

    return undefined;
  }
}
