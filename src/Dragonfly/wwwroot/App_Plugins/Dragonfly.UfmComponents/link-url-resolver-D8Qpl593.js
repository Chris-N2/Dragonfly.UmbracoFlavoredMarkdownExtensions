import { UMB_DOCUMENT_ENTITY_TYPE as i, UmbDocumentUrlRepository as o } from "@umbraco-cms/backoffice/document";
import { UMB_MEDIA_ENTITY_TYPE as s, UmbMediaUrlRepository as e } from "@umbraco-cms/backoffice/media";
class c {
  #r;
  #t;
  #i;
  constructor(r) {
    this.#r = r;
  }
  async url(r) {
    return await this.#o(r) || r?.url;
  }
  async #o(r) {
    if (r?.unique) {
      if (r.type === s) {
        this.#i ??= new e(this.#r);
        const { data: t } = await this.#i.requestItems([r.unique]).catch(() => ({ data: void 0 }));
        return Array.isArray(t) ? t[0]?.url : void 0;
      }
      if (r.type === i) {
        this.#t ??= new o(this.#r);
        const { data: t } = await this.#t.requestUrls([r.unique]).catch(() => ({ data: void 0 }));
        return Array.isArray(t) ? t[0]?.urls?.[0]?.url : void 0;
      }
    }
  }
}
export {
  c as U
};
//# sourceMappingURL=link-url-resolver-D8Qpl593.js.map
