import { UmbDocumentItemRepository as a, UMB_DOCUMENT_ENTITY_TYPE as c } from "@umbraco-cms/backoffice/document";
import { UMB_MEDIA_ENTITY_TYPE as m, UmbMediaItemRepository as p } from "@umbraco-cms/backoffice/media";
import { UmbId as f } from "@umbraco-cms/backoffice/id";
import { w as u, p as y, a as d } from "./link-value.function-D3PQjIif.js";
class P {
  #t;
  #r;
  #e;
  constructor(r) {
    this.#t = r;
  }
  /**
   * Returns the names of the given items, comma-separated, or undefined when none can be found.
   */
  async names(r, e) {
    if (!e.length) return;
    const i = this.#n(r), { data: n } = await i.requestItems(e).catch(() => ({ data: void 0 }));
    if (!(!Array.isArray(n) || n.length === 0))
      return n.map((s) => s.variants?.[0]?.name ?? s.name).filter((s) => s).join(", ");
  }
  #n(r) {
    switch (r) {
      case m:
        return this.#e ??= new p(this.#t), this.#e;
      case c:
      default:
        return this.#r ??= new a(this.#t), this.#r;
    }
  }
}
const h = /<\/?[a-z][^>]*>/i;
async function g(t, r) {
  return (t?.unique ? await r.names(t.type, [t.unique]) : void 0) || t?.name || u(t, t?.url) || "";
}
async function j(t, r) {
  const e = I(t);
  if (e.length)
    return (await Promise.all(e.map((s) => g(s, r)))).filter((s) => s).join(", ");
  const i = b(t);
  if (i.length)
    return r.names(
      i[0].type,
      i.map((n) => n.unique)
    );
  if (t && typeof t == "object" && "markup" in t)
    return o(String(t.markup ?? ""));
  if (typeof t == "string")
    return h.test(t) ? o(t) : t.trim();
  if (Array.isArray(t))
    return t.filter((n) => typeof n == "string" && n.trim() !== "").join(", ");
  if (typeof t == "number" && t !== 0)
    return String(t);
}
function I(t) {
  if (!t || typeof t != "object") return [];
  const r = y(t);
  return r.length && r.every((e) => e.name || e.url || e.queryString) ? r : [];
}
function b(t) {
  const e = (typeof t == "string" ? t.split(",") : Array.isArray(t) ? t : []).map(w);
  return e.length && e.every((i) => i) ? e : [];
}
function w(t) {
  if (typeof t == "string") {
    const n = t.trim();
    return f.validate(n) ? { unique: n } : d(n);
  }
  if (!t || typeof t != "object") return;
  const { mediaKey: r, unique: e, type: i } = t;
  if (r) return { type: m, unique: r };
  if (e) return { type: i, unique: e };
}
function o(t) {
  return (new DOMParser().parseFromString(t, "text/html").body.textContent ?? "").trim();
}
export {
  P as U,
  j as a,
  g as d,
  I as l
};
//# sourceMappingURL=describe-value-D_vm_1vY.js.map
