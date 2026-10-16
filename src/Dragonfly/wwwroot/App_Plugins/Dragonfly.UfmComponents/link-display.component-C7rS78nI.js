import { property as f, customElement as c } from "@umbraco-cms/backoffice/external/lit";
import { UmbUfmComponentBase as v, UmbUfmElementBase as _, UMB_UFM_RENDER_CONTEXT as h } from "@umbraco-cms/backoffice/ufm";
import { d as u, U as d } from "./describe-value-D_vm_1vY.js";
import { p as y } from "./link-value.function-D3PQjIif.js";
var U = Object.defineProperty, C = Object.getOwnPropertyDescriptor, l = (t) => {
  throw TypeError(t);
}, m = (t, e, s, r) => {
  for (var a = r > 1 ? void 0 : r ? C(e, s) : e, i = t.length - 1, n; i >= 0; i--)
    (n = t[i]) && (a = (r ? n(e, s, a) : n(a)) || a);
  return r && a && U(e, s, a), a;
}, E = (t, e, s) => e.has(t) || l("Cannot " + s), w = (t, e, s) => (E(t, e, "read from private field"), s ? s.call(t) : e.get(t)), x = (t, e, s) => e.has(t) ? l("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, s), o;
let p = class extends _ {
  constructor() {
    super(), x(this, o, new d(this)), this.consumeContext(h, (t) => {
      this.observe(
        t?.value,
        async (e) => {
          const s = this.alias && typeof e == "object" ? e[this.alias] : e, r = y(s);
          if (!r.length) {
            this.value = "";
            return;
          }
          const a = await Promise.all(r.map((i) => u(i, w(this, o))));
          this.value = a.filter((i) => i).join(", ");
        },
        "observeValue"
      );
    });
  }
};
o = /* @__PURE__ */ new WeakMap();
m([
  f()
], p.prototype, "alias", 2);
p = m([
  c("ufm-link-display")
], p);
class L extends v {
  render(e) {
    return e.text ? `<ufm-link-display ${super.getAttributes(e.text)}></ufm-link-display>` : void 0;
  }
}
export {
  L as UfmLinkDisplayComponent,
  p as UfmLinkDisplayElement,
  L as api
};
//# sourceMappingURL=link-display.component-C7rS78nI.js.map
