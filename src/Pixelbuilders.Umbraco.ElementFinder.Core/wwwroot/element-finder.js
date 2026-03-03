var H = (e) => {
  throw TypeError(e);
};
var V = (e, t, r) => t.has(e) || H("Cannot " + r);
var F = (e, t, r) => (V(e, t, "read from private field"), r ? r.call(e) : t.get(e)), L = (e, t, r) => t.has(e) ? H("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), G = (e, t, r, s) => (V(e, t, "write to private field"), s ? s.call(e, r) : t.set(e, r), r);
import "@umbraco-cms/backoffice/extension-api";
import { UMB_AUTH_CONTEXT as fe } from "@umbraco-cms/backoffice/auth";
import { LitElement as he, html as _, css as pe, state as I, customElement as me } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as ye } from "@umbraco-cms/backoffice/element-api";
import { UMB_WORKSPACE_CONTEXT as ge, UMB_WORKSPACE_MODAL as be } from "@umbraco-cms/backoffice/workspace";
import { UMB_DOCUMENT_ENTITY_TYPE as J, UMB_EDIT_DOCUMENT_WORKSPACE_PATH_PATTERN as we } from "@umbraco-cms/backoffice/document";
import { UmbControllerBase as _e } from "@umbraco-cms/backoffice/class-api";
import "@umbraco-cms/backoffice/controller-api";
import { UmbContextToken as ve } from "@umbraco-cms/backoffice/context-api";
import { UmbModalRouteRegistrationController as xe } from "@umbraco-cms/backoffice/router";
import "@umbraco-cms/backoffice/extension-registry";
const Ee = {
  bodySerializer: (e) => JSON.stringify(e, (t, r) => typeof r == "bigint" ? r.toString() : r)
}, Pe = ({
  onRequest: e,
  onSseError: t,
  onSseEvent: r,
  responseTransformer: s,
  responseValidator: a,
  sseDefaultRetryDelay: l,
  sseMaxRetryAttempts: i,
  sseMaxRetryDelay: o,
  sseSleepFn: c,
  url: d,
  ...n
}) => {
  let p;
  const T = c ?? ((u) => new Promise((y) => setTimeout(y, u)));
  return { stream: async function* () {
    let u = l ?? 3e3, y = 0;
    const v = n.signal ?? new AbortController().signal;
    for (; !v.aborted; ) {
      y++;
      const S = n.headers instanceof Headers ? n.headers : new Headers(n.headers);
      p !== void 0 && S.set("Last-Event-ID", p);
      try {
        const x = {
          redirect: "follow",
          ...n,
          body: n.serializedBody,
          headers: S,
          signal: v
        };
        let w = new Request(d, x);
        e && (w = await e(d, x));
        const f = await (n.fetch ?? globalThis.fetch)(w);
        if (!f.ok) throw new Error(`SSE failed: ${f.status} ${f.statusText}`);
        if (!f.body) throw new Error("No body in SSE response");
        const m = f.body.pipeThrough(new TextDecoderStream()).getReader();
        let C = "";
        const B = () => {
          try {
            m.cancel();
          } catch {
          }
        };
        v.addEventListener("abort", B);
        try {
          for (; ; ) {
            const { done: ce, value: le } = await m.read();
            if (ce) break;
            C += le, C = C.replace(/\r\n/g, `
`).replace(/\r/g, `
`);
            const R = C.split(`

`);
            C = R.pop() ?? "";
            for (const ue of R) {
              const de = ue.split(`
`), j = [];
              let D;
              for (const b of de)
                if (b.startsWith("data:"))
                  j.push(b.replace(/^data:\s*/, ""));
                else if (b.startsWith("event:"))
                  D = b.replace(/^event:\s*/, "");
                else if (b.startsWith("id:"))
                  p = b.replace(/^id:\s*/, "");
                else if (b.startsWith("retry:")) {
                  const M = Number.parseInt(b.replace(/^retry:\s*/, ""), 10);
                  Number.isNaN(M) || (u = M);
                }
              let E, W = !1;
              if (j.length) {
                const b = j.join(`
`);
                try {
                  E = JSON.parse(b), W = !0;
                } catch {
                  E = b;
                }
              }
              W && (a && await a(E), s && (E = await s(E))), r == null || r({
                data: E,
                event: D,
                id: p,
                retry: u
              }), j.length && (yield E);
            }
          }
        } finally {
          v.removeEventListener("abort", B), m.releaseLock();
        }
        break;
      } catch (x) {
        if (t == null || t(x), i !== void 0 && y >= i)
          break;
        const w = Math.min(u * 2 ** (y - 1), o ?? 3e4);
        await T(w);
      }
    }
  }() };
}, Te = (e) => {
  switch (e) {
    case "label":
      return ".";
    case "matrix":
      return ";";
    case "simple":
      return ",";
    default:
      return "&";
  }
}, Se = (e) => {
  switch (e) {
    case "form":
      return ",";
    case "pipeDelimited":
      return "|";
    case "spaceDelimited":
      return "%20";
    default:
      return ",";
  }
}, Ce = (e) => {
  switch (e) {
    case "label":
      return ".";
    case "matrix":
      return ";";
    case "simple":
      return ",";
    default:
      return "&";
  }
}, ee = ({
  allowReserved: e,
  explode: t,
  name: r,
  style: s,
  value: a
}) => {
  if (!t) {
    const o = (e ? a : a.map((c) => encodeURIComponent(c))).join(Se(s));
    switch (s) {
      case "label":
        return `.${o}`;
      case "matrix":
        return `;${r}=${o}`;
      case "simple":
        return o;
      default:
        return `${r}=${o}`;
    }
  }
  const l = Te(s), i = a.map((o) => s === "label" || s === "simple" ? e ? o : encodeURIComponent(o) : k({
    allowReserved: e,
    name: r,
    value: o
  })).join(l);
  return s === "label" || s === "matrix" ? l + i : i;
}, k = ({
  allowReserved: e,
  name: t,
  value: r
}) => {
  if (r == null)
    return "";
  if (typeof r == "object")
    throw new Error(
      "Deeply-nested arrays/objects aren’t supported. Provide your own `querySerializer()` to handle these."
    );
  return `${t}=${e ? r : encodeURIComponent(r)}`;
}, te = ({
  allowReserved: e,
  explode: t,
  name: r,
  style: s,
  value: a,
  valueOnly: l
}) => {
  if (a instanceof Date)
    return l ? a.toISOString() : `${r}=${a.toISOString()}`;
  if (s !== "deepObject" && !t) {
    let c = [];
    Object.entries(a).forEach(([n, p]) => {
      c = [...c, n, e ? p : encodeURIComponent(p)];
    });
    const d = c.join(",");
    switch (s) {
      case "form":
        return `${r}=${d}`;
      case "label":
        return `.${d}`;
      case "matrix":
        return `;${r}=${d}`;
      default:
        return d;
    }
  }
  const i = Ce(s), o = Object.entries(a).map(
    ([c, d]) => k({
      allowReserved: e,
      name: s === "deepObject" ? `${r}[${c}]` : c,
      value: d
    })
  ).join(i);
  return s === "label" || s === "matrix" ? i + o : o;
}, Oe = /\{[^{}]+\}/g, $e = ({ path: e, url: t }) => {
  let r = t;
  const s = t.match(Oe);
  if (s)
    for (const a of s) {
      let l = !1, i = a.substring(1, a.length - 1), o = "simple";
      i.endsWith("*") && (l = !0, i = i.substring(0, i.length - 1)), i.startsWith(".") ? (i = i.substring(1), o = "label") : i.startsWith(";") && (i = i.substring(1), o = "matrix");
      const c = e[i];
      if (c == null)
        continue;
      if (Array.isArray(c)) {
        r = r.replace(a, ee({ explode: l, name: i, style: o, value: c }));
        continue;
      }
      if (typeof c == "object") {
        r = r.replace(
          a,
          te({
            explode: l,
            name: i,
            style: o,
            value: c,
            valueOnly: !0
          })
        );
        continue;
      }
      if (o === "matrix") {
        r = r.replace(
          a,
          `;${k({
            name: i,
            value: c
          })}`
        );
        continue;
      }
      const d = encodeURIComponent(
        o === "label" ? `.${c}` : c
      );
      r = r.replace(a, d);
    }
  return r;
}, Ae = ({
  baseUrl: e,
  path: t,
  query: r,
  querySerializer: s,
  url: a
}) => {
  const l = a.startsWith("/") ? a : `/${a}`;
  let i = (e ?? "") + l;
  t && (i = $e({ path: t, url: i }));
  let o = r ? s(r) : "";
  return o.startsWith("?") && (o = o.substring(1)), o && (i += `?${o}`), i;
};
function K(e) {
  const t = e.body !== void 0;
  if (t && e.bodySerializer)
    return "serializedBody" in e ? e.serializedBody !== void 0 && e.serializedBody !== "" ? e.serializedBody : null : e.body !== "" ? e.body : null;
  if (t)
    return e.body;
}
const ze = async (e, t) => {
  const r = typeof t == "function" ? await t(e) : t;
  if (r)
    return e.scheme === "bearer" ? `Bearer ${r}` : e.scheme === "basic" ? `Basic ${btoa(r)}` : r;
}, re = ({
  parameters: e = {},
  ...t
} = {}) => (s) => {
  const a = [];
  if (s && typeof s == "object")
    for (const l in s) {
      const i = s[l];
      if (i == null)
        continue;
      const o = e[l] || t;
      if (Array.isArray(i)) {
        const c = ee({
          allowReserved: o.allowReserved,
          explode: !0,
          name: l,
          style: "form",
          value: i,
          ...o.array
        });
        c && a.push(c);
      } else if (typeof i == "object") {
        const c = te({
          allowReserved: o.allowReserved,
          explode: !0,
          name: l,
          style: "deepObject",
          value: i,
          ...o.object
        });
        c && a.push(c);
      } else {
        const c = k({
          allowReserved: o.allowReserved,
          name: l,
          value: i
        });
        c && a.push(c);
      }
    }
  return a.join("&");
}, je = (e) => {
  var r;
  if (!e)
    return "stream";
  const t = (r = e.split(";")[0]) == null ? void 0 : r.trim();
  if (t) {
    if (t.startsWith("application/json") || t.endsWith("+json"))
      return "json";
    if (t === "multipart/form-data")
      return "formData";
    if (["application/", "audio/", "image/", "video/"].some((s) => t.startsWith(s)))
      return "blob";
    if (t.startsWith("text/"))
      return "text";
  }
}, Ie = (e, t) => {
  var r, s;
  return t ? !!(e.headers.has(t) || (r = e.query) != null && r[t] || (s = e.headers.get("Cookie")) != null && s.includes(`${t}=`)) : !1;
}, ke = async ({
  security: e,
  ...t
}) => {
  for (const r of e) {
    if (Ie(t, r.name))
      continue;
    const s = await ze(r, t.auth);
    if (!s)
      continue;
    const a = r.name ?? "Authorization";
    switch (r.in) {
      case "query":
        t.query || (t.query = {}), t.query[a] = s;
        break;
      case "cookie":
        t.headers.append("Cookie", `${a}=${s}`);
        break;
      case "header":
      default:
        t.headers.set(a, s);
        break;
    }
  }
}, X = (e) => Ae({
  baseUrl: e.baseUrl,
  path: e.path,
  query: e.query,
  querySerializer: typeof e.querySerializer == "function" ? e.querySerializer : re(e.querySerializer),
  url: e.url
}), Q = (e, t) => {
  var s;
  const r = { ...e, ...t };
  return (s = r.baseUrl) != null && s.endsWith("/") && (r.baseUrl = r.baseUrl.substring(0, r.baseUrl.length - 1)), r.headers = se(e.headers, t.headers), r;
}, Ue = (e) => {
  const t = [];
  return e.forEach((r, s) => {
    t.push([s, r]);
  }), t;
}, se = (...e) => {
  const t = new Headers();
  for (const r of e) {
    if (!r)
      continue;
    const s = r instanceof Headers ? Ue(r) : Object.entries(r);
    for (const [a, l] of s)
      if (l === null)
        t.delete(a);
      else if (Array.isArray(l))
        for (const i of l)
          t.append(a, i);
      else l !== void 0 && t.set(
        a,
        typeof l == "object" ? JSON.stringify(l) : l
      );
  }
  return t;
};
class U {
  constructor() {
    this.fns = [];
  }
  clear() {
    this.fns = [];
  }
  eject(t) {
    const r = this.getInterceptorIndex(t);
    this.fns[r] && (this.fns[r] = null);
  }
  exists(t) {
    const r = this.getInterceptorIndex(t);
    return !!this.fns[r];
  }
  getInterceptorIndex(t) {
    return typeof t == "number" ? this.fns[t] ? t : -1 : this.fns.indexOf(t);
  }
  update(t, r) {
    const s = this.getInterceptorIndex(t);
    return this.fns[s] ? (this.fns[s] = r, t) : !1;
  }
  use(t) {
    return this.fns.push(t), this.fns.length - 1;
  }
}
const Ne = () => ({
  error: new U(),
  request: new U(),
  response: new U()
}), qe = re({
  allowReserved: !1,
  array: {
    explode: !0,
    style: "form"
  },
  object: {
    explode: !0,
    style: "deepObject"
  }
}), Be = {
  "Content-Type": "application/json"
}, ae = (e = {}) => ({
  ...Ee,
  headers: Be,
  parseAs: "auto",
  querySerializer: qe,
  ...e
}), Re = (e = {}) => {
  let t = Q(ae(), e);
  const r = () => ({ ...t }), s = (d) => (t = Q(t, d), r()), a = Ne(), l = async (d) => {
    const n = {
      ...t,
      ...d,
      fetch: d.fetch ?? t.fetch ?? globalThis.fetch,
      headers: se(t.headers, d.headers),
      serializedBody: void 0
    };
    n.security && await ke({
      ...n,
      security: n.security
    }), n.requestValidator && await n.requestValidator(n), n.body !== void 0 && n.bodySerializer && (n.serializedBody = n.bodySerializer(n.body)), (n.body === void 0 || n.serializedBody === "") && n.headers.delete("Content-Type");
    const p = X(n);
    return { opts: n, url: p };
  }, i = async (d) => {
    const { opts: n, url: p } = await l(d), T = {
      redirect: "follow",
      ...n,
      body: K(n)
    };
    let g = new Request(p, T);
    for (const h of a.request.fns)
      h && (g = await h(g, n));
    const z = n.fetch;
    let u;
    try {
      u = await z(g);
    } catch (h) {
      let f = h;
      for (const m of a.error.fns)
        m && (f = await m(h, void 0, g, n));
      if (f = f || {}, n.throwOnError)
        throw f;
      return n.responseStyle === "data" ? void 0 : {
        error: f,
        request: g,
        response: void 0
      };
    }
    for (const h of a.response.fns)
      h && (u = await h(u, g, n));
    const y = {
      request: g,
      response: u
    };
    if (u.ok) {
      const h = (n.parseAs === "auto" ? je(u.headers.get("Content-Type")) : n.parseAs) ?? "json";
      if (u.status === 204 || u.headers.get("Content-Length") === "0") {
        let m;
        switch (h) {
          case "arrayBuffer":
          case "blob":
          case "text":
            m = await u[h]();
            break;
          case "formData":
            m = new FormData();
            break;
          case "stream":
            m = u.body;
            break;
          case "json":
          default:
            m = {};
            break;
        }
        return n.responseStyle === "data" ? m : {
          data: m,
          ...y
        };
      }
      let f;
      switch (h) {
        case "arrayBuffer":
        case "blob":
        case "formData":
        case "text":
          f = await u[h]();
          break;
        case "json": {
          const m = await u.text();
          f = m ? JSON.parse(m) : {};
          break;
        }
        case "stream":
          return n.responseStyle === "data" ? u.body : {
            data: u.body,
            ...y
          };
      }
      return h === "json" && (n.responseValidator && await n.responseValidator(f), n.responseTransformer && (f = await n.responseTransformer(f))), n.responseStyle === "data" ? f : {
        data: f,
        ...y
      };
    }
    const v = await u.text();
    let S;
    try {
      S = JSON.parse(v);
    } catch {
    }
    const x = S ?? v;
    let w = x;
    for (const h of a.error.fns)
      h && (w = await h(x, u, g, n));
    if (w = w || {}, n.throwOnError)
      throw w;
    return n.responseStyle === "data" ? void 0 : {
      error: w,
      ...y
    };
  }, o = (d) => (n) => i({ ...n, method: d }), c = (d) => async (n) => {
    const { opts: p, url: T } = await l(n);
    return Pe({
      ...p,
      body: p.body,
      headers: p.headers,
      method: d,
      onRequest: async (g, z) => {
        let u = new Request(g, z);
        for (const y of a.request.fns)
          y && (u = await y(u, p));
        return u;
      },
      serializedBody: K(p),
      url: T
    });
  };
  return {
    buildUrl: X,
    connect: o("CONNECT"),
    delete: o("DELETE"),
    get: o("GET"),
    getConfig: r,
    head: o("HEAD"),
    interceptors: a,
    options: o("OPTIONS"),
    patch: o("PATCH"),
    post: o("POST"),
    put: o("PUT"),
    request: i,
    setConfig: s,
    sse: {
      connect: c("CONNECT"),
      delete: c("DELETE"),
      get: c("GET"),
      head: c("HEAD"),
      options: c("OPTIONS"),
      patch: c("PATCH"),
      post: c("POST"),
      put: c("PUT"),
      trace: c("TRACE")
    },
    trace: o("TRACE")
  };
}, ne = Re(ae()), De = (e) => (e.client ?? ne).get({
  security: [{ scheme: "bearer", type: "http" }],
  url: "/umbraco/element-finder/api/v1/usage/{alias}",
  ...e
});
class We {
  async getElementInfo(t) {
    try {
      return (await De({
        path: {
          alias: t
        }
      })).data ?? null;
    } catch {
      return null;
    }
  }
}
var $;
class Y extends _e {
  constructor(r) {
    super(r);
    L(this, $);
    G(this, $, new We()), this.provideContext(q, this);
  }
  async getInfoFromAlias(r) {
    return F(this, $).getElementInfo(r);
  }
}
$ = new WeakMap();
const q = new ve("GetInfoContext"), Me = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET_INFO_CONTEXT_TOKEN: q,
  GetInfoContext: Y,
  default: Y
}, Symbol.toStringTag, { value: "Module" }));
var He = Object.defineProperty, Ve = Object.getOwnPropertyDescriptor, ie = (e) => {
  throw TypeError(e);
}, A = (e, t, r, s) => {
  for (var a = s > 1 ? void 0 : s ? Ve(t, r) : t, l = e.length - 1, i; l >= 0; l--)
    (i = e[l]) && (a = (s ? i(t, r, a) : i(a)) || a);
  return s && a && He(t, r, a), a;
}, oe = (e, t, r) => t.has(e) || ie("Cannot " + r), Z = (e, t, r) => (oe(e, t, "read from private field"), r ? r.call(e) : t.get(e)), Fe = (e, t, r) => t.has(e) ? ie("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), Le = (e, t, r, s) => (oe(e, t, "write to private field"), t.set(e, r), r), O;
const N = 10;
let P = class extends ye(he) {
  constructor() {
    super(), this._nodes = [], this._loading = !1, this._error = null, this._currentPage = 1, Fe(this, O), this.consumeContext(q, (e) => {
      e && Le(this, O, e);
    }), this.consumeContext(ge, (e) => {
      e && this.observe(e.data, async (t) => {
        var r;
        if (!(!(t != null && t.alias) || !Z(this, O))) {
          this._loading = !0, this._error = null;
          try {
            const s = await Z(this, O).getInfoFromAlias(t.alias);
            (r = s == null ? void 0 : s.usages) != null && r.length ? (this._nodes = s.usages, this._currentPage = 1) : this._nodes = [];
          } catch (s) {
            console.error(s), this._error = "Error fetching usage", this._nodes = [];
          } finally {
            this._loading = !1;
          }
        }
      });
    }), this._modalRegistration = new xe(
      this,
      be
    ).addAdditionalPath(J).onSetup(() => ({
      data: { entityType: J },
      modal: { size: "large" }
    }));
  }
  get pagedNodes() {
    const e = (this._currentPage - 1) * N;
    return this._nodes.slice(e, e + N);
  }
  totalPages() {
    return Math.ceil(this._nodes.length / N);
  }
  nextPage() {
    this._currentPage < this.totalPages() && this._currentPage++;
  }
  prevPage() {
    this._currentPage > 1 && this._currentPage--;
  }
  _openEditModal(e) {
    const t = we.generateLocal({
      unique: e
    });
    this._modalRegistration.open({}, t);
  }
  render() {
    return this._loading ? _`<uui-loader></uui-loader>` : _`
      <uui-box headline="Content Usage">
        <div slot="header">
          Found ${this._nodes.length} instance(s) of this type.
        </div>

        ${this._error ? _`<uui-tag look="danger">${this._error}</uui-tag>` : ""}
        ${this._nodes.length > 0 ? _`
              <div class="usage-list">
                ${this.pagedNodes.map(
      (e, t) => _`
                    <div class="usage-item">
                      <span class="page-name">${e.pageName}</span>
                      <div class="actions">
                        <uui-button
                          look="secondary"
                          label="Edit"
                          @click=${() => this._openEditModal(e.id)}
                        ></uui-button>
                        <uui-button
                          look="secondary"
                          label="View"
                          @click=${() => window.open(e.url, "_blank")}
                        ></uui-button>
                      </div>
                    </div>
                    ${t < this.pagedNodes.length - 1 ? _`<hr class="divider" />` : null}
                  `
    )}
              </div>

              <!-- Pagination -->
              ${this.totalPages() > 1 ? _`
                    <div class="pagination">
                      <uui-button
                        label="Previous"
                        ?disabled=${this._currentPage === 1}
                        @click=${this.prevPage}
                      ></uui-button>
                      <span
                        >Page ${this._currentPage} of ${this.totalPages()}</span
                      >
                      <uui-button
                        label="Next"
                        ?disabled=${this._currentPage === this.totalPages()}
                        @click=${this.nextPage}
                      ></uui-button>
                    </div>
                  ` : null}
            ` : _`
              <uui-state-message>
                No content nodes are currently using this Document Type.
              </uui-state-message>
            `}
      </uui-box>
    `;
  }
};
O = /* @__PURE__ */ new WeakMap();
P.styles = pe`
    :host {
      display: block;
      padding: var(--uui-size-layout-1);
    }

    uui-box {
      max-width: 800px;
      margin: 0 auto;
    }

    .usage-list {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-1);
    }

    .usage-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--uui-size-2) 0;
    }

    .page-name {
      font-weight: 500;
    }

    .divider {
      border: none;
      border-bottom: 1px solid var(--uui-color-border);
      margin: 0;
    }

    .pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: var(--uui-size-2);
    }
  `;
A([
  I()
], P.prototype, "_nodes", 2);
A([
  I()
], P.prototype, "_loading", 2);
A([
  I()
], P.prototype, "_error", 2);
A([
  I()
], P.prototype, "_currentPage", 2);
P = A([
  me("element-finder")
], P);
const Ge = [
  {
    type: "workspaceView",
    name: "Element Finder",
    alias: "element-finder",
    elementName: "element-finder",
    weight: -1,
    conditions: [
      {
        alias: "Umb.Condition.WorkspaceAlias",
        match: "Umb.Workspace.DocumentType"
      }
    ],
    meta: {
      label: "Usage",
      icon: "icon-search",
      pathname: "element-finder"
    }
  }
], Je = [...Ge], Ke = [
  {
    type: "globalContext",
    alias: "getInfo.context",
    name: "Get Info context",
    js: () => Promise.resolve().then(() => Me)
  }
], Xe = [...Ke], Qe = [
  ...Je,
  ...Xe
], ut = (e, t) => {
  e.consumeContext(fe, async (r) => {
    const s = r == null ? void 0 : r.getOpenApiConfiguration();
    ne.setConfig({
      auth: (s == null ? void 0 : s.token) ?? void 0,
      baseUrl: (s == null ? void 0 : s.base) ?? "",
      credentials: (s == null ? void 0 : s.credentials) ?? "same-origin"
    });
  }), t.registerMany(Qe);
};
export {
  ut as onInit
};
//# sourceMappingURL=element-finder.js.map
