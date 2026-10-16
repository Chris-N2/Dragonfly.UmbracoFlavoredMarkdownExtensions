import { property as f, customElement as d } from "@umbraco-cms/backoffice/external/lit";
import { UmbUfmComponentBase as y, UmbUfmElementBase as U, UMB_UFM_RENDER_CONTEXT as w } from "@umbraco-cms/backoffice/ufm";
import { U as A, a as B, l as C } from "./describe-value-D_vm_1vY.js";
import { U as E } from "./link-url-resolver-D8Qpl593.js";
var V = Object.defineProperty, x = Object.getOwnPropertyDescriptor, _ = (e) => {
  throw TypeError(e);
}, o = (e, t, a, r) => {
  for (var s = r > 1 ? void 0 : r ? x(t, a) : t, l = e.length - 1, n; l >= 0; l--)
    (n = e[l]) && (s = (r ? n(t, a, s) : n(s)) || s);
  return r && s && V(t, a, s), s;
}, k = (e, t, a) => t.has(e) || _("Cannot " + a), h = (e, t, a) => (k(e, t, "read from private field"), a ? a.call(e) : t.get(e)), u = (e, t, a) => t.has(e) ? _("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), O = (e, t, a) => (k(e, t, "access private method"), a), m, v, p, b;
function T(e, t) {
  let a = e;
  if (typeof a == "string")
    try {
      a = JSON.parse(a);
    } catch {
      return;
    }
  return a?.contentData?.[0]?.values?.find((s) => s.alias === t)?.value;
}
let i = class extends U {
  constructor() {
    super(), u(this, p), u(this, m, new A(this)), u(this, v, new E(this)), this.consumeContext(w, (e) => {
      this.observe(
        e?.value,
        async (t) => {
          const a = this.blocksAlias && t && typeof t == "object" ? t[this.blocksAlias] : t, r = this.valueAlias ? T(a, this.valueAlias) : void 0;
          this.value = await O(this, p, b).call(this, r) ?? "";
        },
        "observeValue"
      );
    });
  }
};
m = /* @__PURE__ */ new WeakMap();
v = /* @__PURE__ */ new WeakMap();
p = /* @__PURE__ */ new WeakSet();
b = async function(e) {
  return this.outputType?.toLowerCase() !== "url" ? B(e, h(this, m)) : (await Promise.all(C(e).map((a) => h(this, v).url(a)))).filter((a) => a).join(", ");
};
o([
  f({ attribute: "blocks-alias" })
], i.prototype, "blocksAlias", 2);
o([
  f({ attribute: "value-alias" })
], i.prototype, "valueAlias", 2);
o([
  f({ attribute: "output-type" })
], i.prototype, "outputType", 2);
i = o([
  d("ufm-first-block-value")
], i);
class D extends y {
  render(t) {
    if (!t.text) return;
    const [a, r, s] = t.text.split(",").map((l) => l.trim());
    return `<ufm-first-block-value blocks-alias="${c(a)}" value-alias="${c(r ?? "")}" output-type="${c(s ?? "")}"></ufm-first-block-value>`;
  }
}
function c(e) {
  return e.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
export {
  D as UfmFirstBlockValueComponent,
  i as UfmFirstBlockValueElement,
  D as api
};
//# sourceMappingURL=first-block-value.component-DeWUY5U3.js.map
