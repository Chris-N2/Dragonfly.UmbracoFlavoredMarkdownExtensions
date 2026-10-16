import { property as _, customElement as h } from "@umbraco-cms/backoffice/external/lit";
import { UmbUfmComponentBase as d, UmbUfmElementBase as U, UMB_UFM_RENDER_CONTEXT as w } from "@umbraco-cms/backoffice/ufm";
import { U as x, a as y } from "./describe-value-D_vm_1vY.js";
var E = Object.defineProperty, C = Object.getOwnPropertyDescriptor, p = (e) => {
  throw TypeError(e);
}, u = (e, t, r, n) => {
  for (var a = n > 1 ? void 0 : n ? C(t, r) : t, s = e.length - 1, i; s >= 0; s--)
    (i = e[s]) && (a = (n ? i(t, r, a) : i(a)) || a);
  return n && a && E(t, r, a), a;
}, m = (e, t, r) => t.has(e) || p("Cannot " + r), b = (e, t, r) => (m(e, t, "read from private field"), r ? r.call(e) : t.get(e)), f = (e, t, r) => t.has(e) ? p("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), P = (e, t, r) => (m(e, t, "access private method"), r), c, o, v;
const V = /^(\w+)(?:\s*:\s*(\d+))?$/, N = /,\s*(["'])(.*)\1\s*$/;
let l = class extends U {
  constructor() {
    super(), f(this, o), f(this, c, new x(this)), this.consumeContext(w, (e) => {
      this.observe(
        e?.value,
        async (t) => {
          this.value = await P(this, o, v).call(this, t);
        },
        "observeValue"
      );
    });
  }
};
c = /* @__PURE__ */ new WeakMap();
o = /* @__PURE__ */ new WeakSet();
v = async function(e) {
  const { entries: t, fallback: r } = O(this.aliases);
  if (!e || typeof e != "object") return r;
  for (const n of t) {
    const a = await y(e[n.alias], b(this, c));
    if (a) return g(a, n.length);
  }
  return r;
};
u([
  _()
], l.prototype, "aliases", 2);
l = u([
  h("ufm-first-value")
], l);
function O(e) {
  const t = e ?? "", r = N.exec(t);
  return { entries: (r ? t.slice(0, r.index) : t).split(",").map((s) => V.exec(s.trim())).filter((s) => s !== null).map(([, s, i]) => ({ alias: s, length: i ? Number(i) : void 0 })), fallback: r?.[2] ?? "" };
}
function g(e, t) {
  return !t || e.length <= t ? e : `${e.slice(0, t).trim()}…`;
}
class B extends d {
  render(t) {
    return t.text ? `<ufm-first-value aliases="${F(t.text)}"></ufm-first-value>` : void 0;
  }
}
function F(e) {
  return e.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
export {
  B as UfmFirstValueComponent,
  l as UfmFirstValueElement,
  B as api
};
//# sourceMappingURL=first-value.component-DyNMibDa.js.map
