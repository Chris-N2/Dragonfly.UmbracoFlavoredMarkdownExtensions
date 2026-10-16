import { property as m, customElement as _ } from "@umbraco-cms/backoffice/external/lit";
import { UmbUfmComponentBase as d, UmbUfmElementBase as U, UMB_UFM_RENDER_CONTEXT as y } from "@umbraco-cms/backoffice/ufm";
import { U as w } from "./link-url-resolver-D8Qpl593.js";
import { p as E, w as C } from "./link-value.function-D3PQjIif.js";
var g = Object.defineProperty, k = Object.getOwnPropertyDescriptor, c = (t) => {
  throw TypeError(t);
}, p = (t, e, r, s) => {
  for (var a = s > 1 ? void 0 : s ? k(e, r) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (a = (s ? o(e, r, a) : o(a)) || a);
  return s && a && g(e, r, a), a;
}, h = (t, e, r) => e.has(t) || c("Cannot " + r), x = (t, e, r) => (h(t, e, "read from private field"), r ? r.call(t) : e.get(t)), f = (t, e, r) => e.has(t) ? c("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, r), S = (t, e, r) => (h(t, e, "access private method"), r), u, l, v;
let i = class extends U {
  constructor() {
    super(), f(this, l), this.appendQueryString = !1, f(this, u, new w(this)), this.consumeContext(y, (t) => {
      this.observe(
        t?.value,
        async (e) => {
          const r = this.alias && typeof e == "object" ? e[this.alias] : e, s = E(r);
          if (!s.length) {
            this.value = "";
            return;
          }
          const a = await Promise.all(s.map((n) => S(this, l, v).call(this, n)));
          this.value = a.filter((n) => n).join(", ");
        },
        "observeValue"
      );
    });
  }
};
u = /* @__PURE__ */ new WeakMap();
l = /* @__PURE__ */ new WeakSet();
v = async function(t) {
  const e = await x(this, u).url(t);
  return (this.appendQueryString ? C(t, e) : e) || "";
};
p([
  m()
], i.prototype, "alias", 2);
p([
  m({ type: Boolean, attribute: "append-query-string" })
], i.prototype, "appendQueryString", 2);
i = p([
  _("ufm-link-url")
], i);
class M extends d {
  render(e) {
    return e.text ? `<ufm-link-url ${super.getAttributes(e.text)}></ufm-link-url>` : void 0;
  }
}
export {
  M as UfmLinkUrlComponent,
  i as UfmLinkUrlElement,
  M as api
};
//# sourceMappingURL=link-url.component-D3waH2tJ.js.map
