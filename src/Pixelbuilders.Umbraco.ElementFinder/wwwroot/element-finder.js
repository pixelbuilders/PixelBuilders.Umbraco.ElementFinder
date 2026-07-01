var Q = (e) => {
  throw TypeError(e);
};
var Y = (e, t, r) => t.has(e) || Q("Cannot " + r);
var B = (e, t, r) => (Y(e, t, "read from private field"), r ? r.call(e) : t.get(e)), Z = (e, t, r) => t.has(e) ? Q("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), ee = (e, t, r, i) => (Y(e, t, "write to private field"), i ? i.call(e, r) : t.set(e, r), r);
import "@umbraco-cms/backoffice/extension-api";
import { UMB_AUTH_CONTEXT as Pe } from "@umbraco-cms/backoffice/auth";
import { LitElement as ne, html as m, css as se, state as v, customElement as oe } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as le } from "@umbraco-cms/backoffice/element-api";
import { UMB_WORKSPACE_CONTEXT as Ee, UMB_WORKSPACE_MODAL as ce } from "@umbraco-cms/backoffice/workspace";
import { UMB_DOCUMENT_ENTITY_TYPE as N, UMB_EDIT_DOCUMENT_WORKSPACE_PATH_PATTERN as de } from "@umbraco-cms/backoffice/document";
import { UmbControllerBase as Te } from "@umbraco-cms/backoffice/class-api";
import "@umbraco-cms/backoffice/controller-api";
import { UmbContextToken as Fe } from "@umbraco-cms/backoffice/context-api";
import { UmbModalRouteRegistrationController as ue } from "@umbraco-cms/backoffice/router";
import "@umbraco-cms/backoffice/extension-registry";
const Ae = {
  bodySerializer: (e) => JSON.stringify(
    e,
    (t, r) => typeof r == "bigint" ? r.toString() : r
  )
}, Ce = ({
  onRequest: e,
  onSseError: t,
  onSseEvent: r,
  responseTransformer: i,
  responseValidator: a,
  sseDefaultRetryDelay: c,
  sseMaxRetryAttempts: s,
  sseMaxRetryDelay: o,
  sseSleepFn: l,
  url: u,
  ...n
}) => {
  let h;
  const C = l ?? ((d) => new Promise((p) => setTimeout(p, d)));
  return { stream: async function* () {
    let d = c ?? 3e3, p = 0;
    const w = n.signal ?? new AbortController().signal;
    for (; !w.aborted; ) {
      p++;
      const S = n.headers instanceof Headers ? n.headers : new Headers(n.headers);
      h !== void 0 && S.set("Last-Event-ID", h);
      try {
        const x = {
          redirect: "follow",
          ...n,
          body: n.serializedBody,
          headers: S,
          signal: w
        };
        let b = new Request(u, x);
        e && (b = await e(u, x));
        const g = await (n.fetch ?? globalThis.fetch)(b);
        if (!g.ok)
          throw new Error(
            `SSE failed: ${g.status} ${g.statusText}`
          );
        if (!g.body) throw new Error("No body in SSE response");
        const _ = g.body.pipeThrough(new TextDecoderStream()).getReader();
        let q = "";
        const V = () => {
          try {
            _.cancel();
          } catch {
          }
        };
        w.addEventListener("abort", V);
        try {
          for (; ; ) {
            const { done: ze, value: $e } = await _.read();
            if (ze) break;
            q += $e;
            const G = q.split(`

`);
            q = G.pop() ?? "";
            for (const we of G) {
              const xe = we.split(`
`), k = [];
              let J;
              for (const y of xe)
                if (y.startsWith("data:"))
                  k.push(y.replace(/^data:\s*/, ""));
                else if (y.startsWith("event:"))
                  J = y.replace(/^event:\s*/, "");
                else if (y.startsWith("id:"))
                  h = y.replace(/^id:\s*/, "");
                else if (y.startsWith("retry:")) {
                  const X = Number.parseInt(
                    y.replace(/^retry:\s*/, ""),
                    10
                  );
                  Number.isNaN(X) || (d = X);
                }
              let P, K = !1;
              if (k.length) {
                const y = k.join(`
`);
                try {
                  P = JSON.parse(y), K = !0;
                } catch {
                  P = y;
                }
              }
              K && (a && await a(P), i && (P = await i(P))), r == null || r({
                data: P,
                event: J,
                id: h,
                retry: d
              }), k.length && (yield P);
            }
          }
        } finally {
          w.removeEventListener("abort", V), _.releaseLock();
        }
        break;
      } catch (x) {
        if (t == null || t(x), s !== void 0 && p >= s)
          break;
        const b = Math.min(
          d * 2 ** (p - 1),
          o ?? 3e4
        );
        await C(b);
      }
    }
  }() };
}, Se = (e) => {
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
}, Oe = (e) => {
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
}, Ue = (e) => {
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
}, he = ({
  allowReserved: e,
  explode: t,
  name: r,
  style: i,
  value: a
}) => {
  if (!t) {
    const o = (e ? a : a.map((l) => encodeURIComponent(l))).join(Oe(i));
    switch (i) {
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
  const c = Se(i), s = a.map((o) => i === "label" || i === "simple" ? e ? o : encodeURIComponent(o) : D({
    allowReserved: e,
    name: r,
    value: o
  })).join(c);
  return i === "label" || i === "matrix" ? c + s : s;
}, D = ({
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
}, me = ({
  allowReserved: e,
  explode: t,
  name: r,
  style: i,
  value: a,
  valueOnly: c
}) => {
  if (a instanceof Date)
    return c ? a.toISOString() : `${r}=${a.toISOString()}`;
  if (i !== "deepObject" && !t) {
    let l = [];
    Object.entries(a).forEach(([n, h]) => {
      l = [
        ...l,
        n,
        e ? h : encodeURIComponent(h)
      ];
    });
    const u = l.join(",");
    switch (i) {
      case "form":
        return `${r}=${u}`;
      case "label":
        return `.${u}`;
      case "matrix":
        return `;${r}=${u}`;
      default:
        return u;
    }
  }
  const s = Ue(i), o = Object.entries(a).map(
    ([l, u]) => D({
      allowReserved: e,
      name: i === "deepObject" ? `${r}[${l}]` : l,
      value: u
    })
  ).join(s);
  return i === "label" || i === "matrix" ? s + o : o;
}, je = /\{[^{}]+\}/g, ke = ({ path: e, url: t }) => {
  let r = t;
  const i = t.match(je);
  if (i)
    for (const a of i) {
      let c = !1, s = a.substring(1, a.length - 1), o = "simple";
      s.endsWith("*") && (c = !0, s = s.substring(0, s.length - 1)), s.startsWith(".") ? (s = s.substring(1), o = "label") : s.startsWith(";") && (s = s.substring(1), o = "matrix");
      const l = e[s];
      if (l == null)
        continue;
      if (Array.isArray(l)) {
        r = r.replace(
          a,
          he({ explode: c, name: s, style: o, value: l })
        );
        continue;
      }
      if (typeof l == "object") {
        r = r.replace(
          a,
          me({
            explode: c,
            name: s,
            style: o,
            value: l,
            valueOnly: !0
          })
        );
        continue;
      }
      if (o === "matrix") {
        r = r.replace(
          a,
          `;${D({
            name: s,
            value: l
          })}`
        );
        continue;
      }
      const u = encodeURIComponent(
        o === "label" ? `.${l}` : l
      );
      r = r.replace(a, u);
    }
  return r;
}, Ie = ({
  baseUrl: e,
  path: t,
  query: r,
  querySerializer: i,
  url: a
}) => {
  const c = a.startsWith("/") ? a : `/${a}`;
  let s = (e ?? "") + c;
  t && (s = ke({ path: t, url: s }));
  let o = r ? i(r) : "";
  return o.startsWith("?") && (o = o.substring(1)), o && (s += `?${o}`), s;
};
function Ne(e) {
  const t = e.body !== void 0;
  if (t && e.bodySerializer)
    return "serializedBody" in e ? e.serializedBody !== void 0 && e.serializedBody !== "" ? e.serializedBody : null : e.body !== "" ? e.body : null;
  if (t)
    return e.body;
}
const De = async (e, t) => {
  const r = typeof t == "function" ? await t(e) : t;
  if (r)
    return e.scheme === "bearer" ? `Bearer ${r}` : e.scheme === "basic" ? `Basic ${btoa(r)}` : r;
}, fe = ({
  allowReserved: e,
  array: t,
  object: r
} = {}) => (a) => {
  const c = [];
  if (a && typeof a == "object")
    for (const s in a) {
      const o = a[s];
      if (o != null)
        if (Array.isArray(o)) {
          const l = he({
            allowReserved: e,
            explode: !0,
            name: s,
            style: "form",
            value: o,
            ...t
          });
          l && c.push(l);
        } else if (typeof o == "object") {
          const l = me({
            allowReserved: e,
            explode: !0,
            name: s,
            style: "deepObject",
            value: o,
            ...r
          });
          l && c.push(l);
        } else {
          const l = D({
            allowReserved: e,
            name: s,
            value: o
          });
          l && c.push(l);
        }
    }
  return c.join("&");
}, Le = (e) => {
  var r;
  if (!e)
    return "stream";
  const t = (r = e.split(";")[0]) == null ? void 0 : r.trim();
  if (t) {
    if (t.startsWith("application/json") || t.endsWith("+json"))
      return "json";
    if (t === "multipart/form-data")
      return "formData";
    if (["application/", "audio/", "image/", "video/"].some(
      (i) => t.startsWith(i)
    ))
      return "blob";
    if (t.startsWith("text/"))
      return "text";
  }
}, qe = (e, t) => {
  var r, i;
  return t ? !!(e.headers.has(t) || (r = e.query) != null && r[t] || (i = e.headers.get("Cookie")) != null && i.includes(`${t}=`)) : !1;
}, Be = async ({
  security: e,
  ...t
}) => {
  for (const r of e) {
    if (qe(t, r.name))
      continue;
    const i = await De(r, t.auth);
    if (!i)
      continue;
    const a = r.name ?? "Authorization";
    switch (r.in) {
      case "query":
        t.query || (t.query = {}), t.query[a] = i;
        break;
      case "cookie":
        t.headers.append("Cookie", `${a}=${i}`);
        break;
      case "header":
      default:
        t.headers.set(a, i);
        break;
    }
  }
}, te = (e) => Ie({
  baseUrl: e.baseUrl,
  path: e.path,
  query: e.query,
  querySerializer: typeof e.querySerializer == "function" ? e.querySerializer : fe(e.querySerializer),
  url: e.url
}), re = (e, t) => {
  var i;
  const r = { ...e, ...t };
  return (i = r.baseUrl) != null && i.endsWith("/") && (r.baseUrl = r.baseUrl.substring(0, r.baseUrl.length - 1)), r.headers = pe(e.headers, t.headers), r;
}, Me = (e) => {
  const t = [];
  return e.forEach((r, i) => {
    t.push([i, r]);
  }), t;
}, pe = (...e) => {
  const t = new Headers();
  for (const r of e) {
    if (!r)
      continue;
    const i = r instanceof Headers ? Me(r) : Object.entries(r);
    for (const [a, c] of i)
      if (c === null)
        t.delete(a);
      else if (Array.isArray(c))
        for (const s of c)
          t.append(a, s);
      else c !== void 0 && t.set(
        a,
        typeof c == "object" ? JSON.stringify(c) : c
      );
  }
  return t;
};
class M {
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
    const i = this.getInterceptorIndex(t);
    return this.fns[i] ? (this.fns[i] = r, t) : !1;
  }
  use(t) {
    return this.fns.push(t), this.fns.length - 1;
  }
}
const Re = () => ({
  error: new M(),
  request: new M(),
  response: new M()
}), We = fe({
  allowReserved: !1,
  array: {
    explode: !0,
    style: "form"
  },
  object: {
    explode: !0,
    style: "deepObject"
  }
}), He = {
  "Content-Type": "application/json"
}, ge = (e = {}) => ({
  ...Ae,
  headers: He,
  parseAs: "auto",
  querySerializer: We,
  ...e
}), Ve = (e = {}) => {
  let t = re(ge(), e);
  const r = () => ({ ...t }), i = (u) => (t = re(t, u), r()), a = Re(), c = async (u) => {
    const n = {
      ...t,
      ...u,
      fetch: u.fetch ?? t.fetch ?? globalThis.fetch,
      headers: pe(t.headers, u.headers),
      serializedBody: void 0
    };
    n.security && await Be({
      ...n,
      security: n.security
    }), n.requestValidator && await n.requestValidator(n), n.body !== void 0 && n.bodySerializer && (n.serializedBody = n.bodySerializer(n.body)), (n.body === void 0 || n.serializedBody === "") && n.headers.delete("Content-Type");
    const h = te(n);
    return { opts: n, url: h };
  }, s = async (u) => {
    const { opts: n, url: h } = await c(u), C = {
      redirect: "follow",
      ...n,
      body: Ne(n)
    };
    let z = new Request(h, C);
    for (const f of a.request.fns)
      f && (z = await f(z, n));
    const j = n.fetch;
    let d = await j(z);
    for (const f of a.response.fns)
      f && (d = await f(d, z, n));
    const p = {
      request: z,
      response: d
    };
    if (d.ok) {
      const f = (n.parseAs === "auto" ? Le(d.headers.get("Content-Type")) : n.parseAs) ?? "json";
      if (d.status === 204 || d.headers.get("Content-Length") === "0") {
        let _;
        switch (f) {
          case "arrayBuffer":
          case "blob":
          case "text":
            _ = await d[f]();
            break;
          case "formData":
            _ = new FormData();
            break;
          case "stream":
            _ = d.body;
            break;
          case "json":
          default:
            _ = {};
            break;
        }
        return n.responseStyle === "data" ? _ : {
          data: _,
          ...p
        };
      }
      let g;
      switch (f) {
        case "arrayBuffer":
        case "blob":
        case "formData":
        case "json":
        case "text":
          g = await d[f]();
          break;
        case "stream":
          return n.responseStyle === "data" ? d.body : {
            data: d.body,
            ...p
          };
      }
      return f === "json" && (n.responseValidator && await n.responseValidator(g), n.responseTransformer && (g = await n.responseTransformer(g))), n.responseStyle === "data" ? g : {
        data: g,
        ...p
      };
    }
    const w = await d.text();
    let S;
    try {
      S = JSON.parse(w);
    } catch {
    }
    const x = S ?? w;
    let b = x;
    for (const f of a.error.fns)
      f && (b = await f(x, d, z, n));
    if (b = b || {}, n.throwOnError)
      throw b;
    return n.responseStyle === "data" ? void 0 : {
      error: b,
      ...p
    };
  }, o = (u) => (n) => s({ ...n, method: u }), l = (u) => async (n) => {
    const { opts: h, url: C } = await c(n);
    return Ce({
      ...h,
      body: h.body,
      headers: h.headers,
      method: u,
      onRequest: async (z, j) => {
        let d = new Request(z, j);
        for (const p of a.request.fns)
          p && (d = await p(d, h));
        return d;
      },
      url: C
    });
  };
  return {
    buildUrl: te,
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
    request: s,
    setConfig: i,
    sse: {
      connect: l("CONNECT"),
      delete: l("DELETE"),
      get: l("GET"),
      head: l("HEAD"),
      options: l("OPTIONS"),
      patch: l("PATCH"),
      post: l("POST"),
      put: l("PUT"),
      trace: l("TRACE")
    },
    trace: o("TRACE")
  };
}, H = Ve(ge()), Ge = (e) => ((e == null ? void 0 : e.client) ?? H).get({
  security: [
    {
      scheme: "bearer",
      type: "http"
    }
  ],
  url: "/umbraco/element-finder/api/v1/all-types",
  ...e
}), Je = (e) => (e.client ?? H).get({
  security: [
    {
      scheme: "bearer",
      type: "http"
    }
  ],
  url: "/umbraco/element-finder/api/v1/usage/{alias}",
  ...e
});
class Ke {
  async getElementInfo(t) {
    try {
      return (await Je({
        path: {
          alias: t
        }
      })).data ?? null;
    } catch {
      return null;
    }
  }
  async getAllDocumentTypes() {
    try {
      return (await Ge()).data ?? [];
    } catch (t) {
      return console.error("Failed to fetch document types:", t), [];
    }
  }
}
var A;
class ie extends Te {
  constructor(r) {
    super(r);
    Z(this, A);
    ee(this, A, new Ke()), this.provideContext(L, this);
  }
  async getInfoFromAlias(r) {
    return B(this, A).getElementInfo(r);
  }
  async getAllElementTypes() {
    return B(this, A).getAllDocumentTypes();
  }
}
A = new WeakMap();
const L = new Fe("GetInfoContext"), Xe = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET_INFO_CONTEXT_TOKEN: L,
  GetInfoContext: ie,
  default: ie
}, Symbol.toStringTag, { value: "Module" }));
var Qe = Object.defineProperty, Ye = Object.getOwnPropertyDescriptor, ye = (e) => {
  throw TypeError(e);
}, U = (e, t, r, i) => {
  for (var a = i > 1 ? void 0 : i ? Ye(t, r) : t, c = e.length - 1, s; c >= 0; c--)
    (s = e[c]) && (a = (i ? s(t, r, a) : s(a)) || a);
  return i && a && Qe(t, r, a), a;
}, be = (e, t, r) => t.has(e) || ye("Cannot " + r), ae = (e, t, r) => (be(e, t, "read from private field"), r ? r.call(e) : t.get(e)), Ze = (e, t, r) => t.has(e) ? ye("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), et = (e, t, r, i) => (be(e, t, "write to private field"), t.set(e, r), r), O;
const R = 10;
let T = class extends le(ne) {
  constructor() {
    super(), this._nodes = [], this._loading = !1, this._error = null, this._currentPage = 1, Ze(this, O), this.consumeContext(L, (e) => {
      e && et(this, O, e);
    }), this.consumeContext(Ee, (e) => {
      e && this.observe(e.data, async (t) => {
        var r;
        if (!(!(t != null && t.alias) || !ae(this, O))) {
          this._loading = !0, this._error = null;
          try {
            const i = await ae(this, O).getInfoFromAlias(t.alias);
            (r = i == null ? void 0 : i.usages) != null && r.length ? (this._nodes = i.usages, this._currentPage = 1) : this._nodes = [];
          } catch (i) {
            console.error(i), this._error = this.localize.term("elementFinder_errorFetchingUsage"), this._nodes = [];
          } finally {
            this._loading = !1;
          }
        }
      });
    }), this._modalRegistration = new ue(
      this,
      ce
    ).addAdditionalPath(N).onSetup(() => ({
      data: { entityType: N },
      modal: { size: "large" }
    }));
  }
  get pagedNodes() {
    const e = (this._currentPage - 1) * R;
    return this._nodes.slice(e, e + R);
  }
  totalPages() {
    return Math.ceil(this._nodes.length / R);
  }
  nextPage() {
    this._currentPage < this.totalPages() && this._currentPage++;
  }
  prevPage() {
    this._currentPage > 1 && this._currentPage--;
  }
  _openEditModal(e) {
    const t = de.generateLocal({
      unique: e
    });
    this._modalRegistration.open({}, t);
  }
  render() {
    return this._loading ? m`<uui-loader></uui-loader>` : m`
      <uui-box headline=${this.localize.term("elementFinder_contentUsageHeadline")}>
        <div slot="header">
          ${this.localize.term("elementFinder_foundUsageOfType", this._nodes.length)}
        </div>

        ${this._error ? m`<uui-tag look="danger">${this._error}</uui-tag>` : ""}
        ${this._nodes.length > 0 ? m`
              <div class="usage-list">
                ${this.pagedNodes.map(
      (e, t) => m`
                    <div class="usage-item">
                      <span class="page-name">${e.pageName}</span>
                      <div class="actions">
                        <uui-button
                          look="secondary"
                          label=${this.localize.term("elementFinder_edit")}
                          @click=${() => this._openEditModal(e.id)}
                        >${this.localize.term("elementFinder_edit")}</uui-button>
                        <uui-button
                          look="secondary"
                          label=${this.localize.term("elementFinder_view")}
                          @click=${() => window.open(e.url, "_blank")}
                        >${this.localize.term("elementFinder_view")}</uui-button>
                      </div>
                    </div>
                    ${t < this.pagedNodes.length - 1 ? m`<hr class="divider" />` : null}
                  `
    )}
              </div>

              <!-- Pagination -->
              ${this.totalPages() > 1 ? m`
                    <div class="pagination">
                      <uui-button
                        label=${this.localize.term("elementFinder_previous")}
                        ?disabled=${this._currentPage === 1}
                        @click=${this.prevPage}
                      >${this.localize.term("elementFinder_previous")}</uui-button>
                      <span
                        >${this.localize.term("elementFinder_pageOf", this._currentPage, this.totalPages())}</span
                      >
                      <uui-button
                        label=${this.localize.term("elementFinder_next")}
                        ?disabled=${this._currentPage === this.totalPages()}
                        @click=${this.nextPage}
                      >${this.localize.term("elementFinder_next")}</uui-button>
                    </div>
                  ` : null}
            ` : m`
              <uui-state-message>
                ${this.localize.term("elementFinder_noContentNodesUsingDocumentType")}
              </uui-state-message>
            `}
      </uui-box>
    `;
  }
};
O = /* @__PURE__ */ new WeakMap();
T.styles = se`
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
U([
  v()
], T.prototype, "_nodes", 2);
U([
  v()
], T.prototype, "_loading", 2);
U([
  v()
], T.prototype, "_error", 2);
U([
  v()
], T.prototype, "_currentPage", 2);
T = U([
  oe("element-finder")
], T);
var tt = Object.defineProperty, rt = Object.getOwnPropertyDescriptor, _e = (e) => {
  throw TypeError(e);
}, F = (e, t, r, i) => {
  for (var a = i > 1 ? void 0 : i ? rt(t, r) : t, c = e.length - 1, s; c >= 0; c--)
    (s = e[c]) && (a = (i ? s(t, r, a) : s(a)) || a);
  return i && a && tt(t, r, a), a;
}, ve = (e, t, r) => t.has(e) || _e("Cannot " + r), I = (e, t, r) => (ve(e, t, "read from private field"), t.get(e)), it = (e, t, r) => t.has(e) ? _e("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), at = (e, t, r, i) => (ve(e, t, "write to private field"), t.set(e, r), r), E;
const W = 10;
let $ = class extends le(
  ne
) {
  constructor() {
    super(), this._nodes = [], this._loading = !1, this._error = null, this._currentPage = 1, this._selectedAlias = "", this._docTypes = [], it(this, E), this.consumeContext(L, (e) => {
      at(this, E, e), this._loadDocTypes();
    }), this._modalRegistration = new ue(
      this,
      ce
    ).addAdditionalPath(N).onSetup(() => ({
      data: { entityType: N },
      modal: { size: "large" }
    }));
  }
  async _loadDocTypes() {
    I(this, E) && (this._docTypes = await I(this, E).getAllElementTypes());
  }
  async _handleSearch() {
    if (!(!this._selectedAlias || !I(this, E))) {
      this._loading = !0, this._error = null;
      try {
        const e = await I(this, E).getInfoFromAlias(
          this._selectedAlias
        );
        this._nodes = (e == null ? void 0 : e.usages) ?? [], this._currentPage = 1;
      } catch (e) {
        console.error(e), this._error = this.localize.term("elementFinder_errorFetchingUsage"), this._nodes = [];
      } finally {
        this._loading = !1;
      }
    }
  }
  _onSelectChange(e) {
    this._selectedAlias = e.target.value;
  }
  get pagedNodes() {
    const e = (this._currentPage - 1) * W;
    return this._nodes.slice(e, e + W);
  }
  totalPages() {
    return Math.ceil(this._nodes.length / W);
  }
  nextPage() {
    this._currentPage < this.totalPages() && this._currentPage++;
  }
  prevPage() {
    this._currentPage > 1 && this._currentPage--;
  }
  _openEditModal(e) {
    const t = de.generateLocal({
      unique: e
    });
    this._modalRegistration.open({}, t);
  }
  render() {
    return m`
      <uui-box headline=${this.localize.term("elementFinder_dashboardHeadline")}>
        <div class="search-container">
          <uui-select
            .options=${this._docTypes.map((e) => ({
      name: e.name,
      value: e.alias,
      selected: this._selectedAlias === e.alias
    }))}
            @change=${this._onSelectChange}
            placeholder=${this.localize.term("elementFinder_selectDocumentType")}
          >
          </uui-select>
          <uui-button
            look="primary"
            label=${this.localize.term("elementFinder_findUsage")}
            .disabled=${!this._selectedAlias || this._loading}
            @click=${this._handleSearch}
          >
            ${this.localize.term("elementFinder_findUsage")}
          </uui-button>
        </div>

        ${this._loading ? m`<uui-loader></uui-loader>` : this._renderResults()}
      </uui-box>
    `;
  }
  _renderResults() {
    return this._error ? m`<uui-tag look="danger">${this._error}</uui-tag>` : this._nodes.length === 0 ? m`<uui-state-message
        >${this.localize.term("elementFinder_selectTypeAndSearch")}</uui-state-message
      >` : m`
      <div class="results-header">
        ${this.localize.term("elementFinder_foundInstances", this._nodes.length)}
      </div>
      <div class="usage-list">
        ${this.pagedNodes.map(
      (e, t) => m`
            <div class="usage-item">
              <span class="page-name">${e.pageName}</span>
              <div class="actions">
                <uui-button
                  look="secondary"
                  label=${this.localize.term("elementFinder_edit")}
                  @click=${() => this._openEditModal(e.id)}
                >${this.localize.term("elementFinder_edit")}</uui-button>
                <uui-button
                  look="secondary"
                  label=${this.localize.term("elementFinder_view")}
                  @click=${() => window.open(e.url, "_blank")}
                >${this.localize.term("elementFinder_view")}</uui-button>
              </div>
            </div>
            ${t < this.pagedNodes.length - 1 ? m`<hr class="divider" />` : ""}
          `
    )}
      </div>
      ${this._renderPagination()}
    `;
  }
  _renderPagination() {
    return this.totalPages() <= 1 ? null : m`
      <div class="pagination">
        <uui-button
          label=${this.localize.term("elementFinder_previous")}
          ?disabled=${this._currentPage === 1}
          @click=${this.prevPage}
          >${this.localize.term("elementFinder_previous")}</uui-button
        >
        <span>${this.localize.term("elementFinder_pageOf", this._currentPage, this.totalPages())}</span>
        <uui-button
          label=${this.localize.term("elementFinder_next")}
          ?disabled=${this._currentPage === this.totalPages()}
          @click=${this.nextPage}
          >${this.localize.term("elementFinder_next")}</uui-button
        >
      </div>
    `;
  }
};
E = /* @__PURE__ */ new WeakMap();
$.styles = se`
    :host {
      display: block;
      padding: 24px;
    }
    uui-box {
      max-width: 800px;
      margin: 0 auto;
    }
    .search-container {
      display: flex;
      gap: 10px;
      margin-bottom: 24px;
    }
    uui-select {
      flex-grow: 1;
    }
    .usage-list {
      display: flex;
      flex-direction: column;
    }
    .usage-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
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
      margin-top: 20px;
    }
    .results-header {
      font-weight: bold;
      margin-bottom: 10px;
    }
  `;
F([
  v()
], $.prototype, "_nodes", 2);
F([
  v()
], $.prototype, "_loading", 2);
F([
  v()
], $.prototype, "_error", 2);
F([
  v()
], $.prototype, "_currentPage", 2);
F([
  v()
], $.prototype, "_selectedAlias", 2);
F([
  v()
], $.prototype, "_docTypes", 2);
$ = F([
  oe("element-finder-dashboard")
], $);
const nt = [
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
      label: "#elementFinder_usageLabel",
      icon: "icon-search",
      pathname: "element-finder"
    }
  }
], st = [...nt], ot = [
  {
    type: "globalContext",
    alias: "getInfo.context",
    name: "Get Info context",
    js: () => Promise.resolve().then(() => Xe)
  }
], lt = [...ot], ct = [
  {
    type: "dashboard",
    name: "Element Finder",
    alias: "element-finder-dashboard",
    elementName: "element-finder-dashboard",
    weight: -1,
    meta: {
      label: "#elementFinder_dashboardLabel",
      pathname: "element-finder-dashboard"
    },
    conditions: [
      {
        alias: "Umb.Condition.SectionAlias",
        match: "Umb.Section.Content"
      }
    ]
  }
], dt = [...ct], ut = [
  {
    type: "localization",
    alias: "Pixelbuilders.Umbraco.ElementFinder.Localization.en",
    name: "Element Finder Localization (en)",
    meta: { culture: "en" },
    js: () => import("./en.localization-82brpbj-.js")
  },
  {
    type: "localization",
    alias: "Pixelbuilders.Umbraco.ElementFinder.Localization.en-gb",
    name: "Element Finder Localization (en-gb)",
    meta: { culture: "en-gb" },
    js: () => import("./en-gb.localization-82brpbj-.js")
  },
  {
    type: "localization",
    alias: "Pixelbuilders.Umbraco.ElementFinder.Localization.en-us",
    name: "Element Finder Localization (en-us)",
    meta: { culture: "en-us" },
    js: () => import("./en-us.localization-82brpbj-.js")
  },
  {
    type: "localization",
    alias: "Pixelbuilders.Umbraco.ElementFinder.Localization.da",
    name: "Element Finder Localization (da)",
    meta: { culture: "da" },
    js: () => import("./da.localization-CysgnrA4.js")
  },
  {
    type: "localization",
    alias: "Pixelbuilders.Umbraco.ElementFinder.Localization.fr",
    name: "Element Finder Localization (fr)",
    meta: { culture: "fr" },
    js: () => import("./fr.localization-Daj6RSYY.js")
  },
  {
    type: "localization",
    alias: "Pixelbuilders.Umbraco.ElementFinder.Localization.de",
    name: "Element Finder Localization (de)",
    meta: { culture: "de" },
    js: () => import("./de.localization-BM-AMZ25.js")
  },
  {
    type: "localization",
    alias: "Pixelbuilders.Umbraco.ElementFinder.Localization.nl",
    name: "Element Finder Localization (nl)",
    meta: { culture: "nl" },
    js: () => import("./nl.localization-B4d3myBr.js")
  },
  {
    type: "localization",
    alias: "Pixelbuilders.Umbraco.ElementFinder.Localization.sv",
    name: "Element Finder Localization (sv)",
    meta: { culture: "sv" },
    js: () => import("./sv.localization-0LvdZKh4.js")
  },
  {
    type: "localization",
    alias: "Pixelbuilders.Umbraco.ElementFinder.Localization.es",
    name: "Element Finder Localization (es)",
    meta: { culture: "es" },
    js: () => import("./es.localization-ClgeY1UY.js")
  }
], ht = [
  ...st,
  ...lt,
  ...dt,
  ...ut
], Pt = (e, t) => {
  e.consumeContext(Pe, async (r) => {
    const i = r == null ? void 0 : r.getOpenApiConfiguration();
    H.setConfig({
      auth: (i == null ? void 0 : i.token) ?? void 0,
      baseUrl: (i == null ? void 0 : i.base) ?? "",
      credentials: (i == null ? void 0 : i.credentials) ?? "same-origin"
    });
  }), t.registerMany(ht);
};
export {
  Pt as onInit
};
//# sourceMappingURL=element-finder.js.map
