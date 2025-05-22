import '@astrojs/internal-helpers/path';
import 'kleur/colors';
import 'html-escaper';
import 'clsx';
import { N as NOOP_MIDDLEWARE_HEADER, g as decodeKey } from './chunks/astro/server_Sda8nrz8.mjs';
import 'cookie';
import 'es-module-lexer';

const NOOP_MIDDLEWARE_FN = async (_ctx, next) => {
  const response = await next();
  response.headers.set(NOOP_MIDDLEWARE_HEADER, "true");
  return response;
};

const codeToStatusMap = {
  // Implemented from tRPC error code table
  // https://trpc.io/docs/server/error-handling#error-codes
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TIMEOUT: 405,
  CONFLICT: 409,
  PRECONDITION_FAILED: 412,
  PAYLOAD_TOO_LARGE: 413,
  UNSUPPORTED_MEDIA_TYPE: 415,
  UNPROCESSABLE_CONTENT: 422,
  TOO_MANY_REQUESTS: 429,
  CLIENT_CLOSED_REQUEST: 499,
  INTERNAL_SERVER_ERROR: 500
};
Object.entries(codeToStatusMap).reduce(
  // reverse the key-value pairs
  (acc, [key, value]) => ({ ...acc, [value]: key }),
  {}
);

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///C:/Users/user/Desktop/astro-static-template/","cacheDir":"file:///C:/Users/user/Desktop/astro-static-template/node_modules/.astro/","outDir":"file:///C:/Users/user/Desktop/astro-static-template/dist/","srcDir":"file:///C:/Users/user/Desktop/astro-static-template/src/","publicDir":"file:///C:/Users/user/Desktop/astro-static-template/public/","buildClientDir":"file:///C:/Users/user/Desktop/astro-static-template/dist/","buildServerDir":"file:///C:/Users/user/Desktop/astro-static-template/.netlify/build/","adapterName":"@astrojs/netlify","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"contact/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/contact","isIndex":true,"type":"page","pattern":"^\\/contact\\/?$","segments":[[{"content":"contact","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/contact/index.astro","pathname":"/contact","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"guide/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/guide","isIndex":true,"type":"page","pattern":"^\\/guide\\/?$","segments":[[{"content":"guide","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/guide/index.astro","pathname":"/guide","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"base":"/","trailingSlash":"ignore","compressHTML":false,"componentMetadata":[["C:/Users/user/Desktop/astro-static-template/src/pages/contact/index.astro",{"propagation":"none","containsHead":true}],["C:/Users/user/Desktop/astro-static-template/src/pages/guide/index.astro",{"propagation":"none","containsHead":true}],["C:/Users/user/Desktop/astro-static-template/src/pages/index.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000noop-middleware":"_noop-middleware.mjs","\u0000noop-actions":"_noop-actions.mjs","\u0000@astro-page:src/pages/contact/index@_@astro":"pages/contact.astro.mjs","\u0000@astro-page:src/pages/guide/index@_@astro":"pages/guide.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_C3rjJthy.mjs","C:/Users/user/Desktop/astro-static-template/node_modules/unstorage/drivers/fs-lite.mjs":"chunks/fs-lite_COtHaKzy.mjs","astro:scripts/before-hydration.js":""},"inlinedScripts":[],"assets":["/favicon.ico","/fonts/PretendardVariable.woff2","/js/highlightInit.js","/js/script.js","/images/logo/logo.svg","/styles/common/font.css","/styles/common/hover.css","/styles/common/reset.css","/styles/components/accordion.css","/styles/components/button.css","/styles/components/form.css","/styles/components/popup.css","/styles/components/tab.css","/styles/components/table.css","/styles/config/utils.css","/styles/guide/guide.css","/styles/layout/layout.css","/styles/lib/lib.css","/styles/mobile/mobile.css","/lib/flatpickr/flatpickr.min.css","/lib/flatpickr/flatpickr.min.js","/lib/highlight/highlight-copy.min.js","/lib/highlight/highlight.min.css","/lib/highlight/highlight.min.js","/lib/jquery/jquery-3.7.1-min.js","/lib/swiper/LICENSE","/lib/swiper/package.json","/lib/swiper/README.md","/lib/swiper/swiper-bundle.css","/lib/swiper/swiper-bundle.js","/lib/swiper/swiper-bundle.min.css","/lib/swiper/swiper-bundle.min.js","/lib/swiper/swiper-bundle.min.js.map","/lib/swiper/swiper-bundle.min.mjs","/lib/swiper/swiper-bundle.min.mjs.map","/lib/swiper/swiper-bundle.mjs","/lib/swiper/swiper-effect-utils.d.ts","/lib/swiper/swiper-effect-utils.min.mjs","/lib/swiper/swiper-effect-utils.min.mjs.map","/lib/swiper/swiper-effect-utils.mjs","/lib/swiper/swiper-element-bundle.js","/lib/swiper/swiper-element-bundle.min.js","/lib/swiper/swiper-element-bundle.min.js.map","/lib/swiper/swiper-element-bundle.min.mjs","/lib/swiper/swiper-element-bundle.min.mjs.map","/lib/swiper/swiper-element-bundle.mjs","/lib/swiper/swiper-element.d.ts","/lib/swiper/swiper-element.js","/lib/swiper/swiper-element.min.js","/lib/swiper/swiper-element.min.js.map","/lib/swiper/swiper-element.min.mjs","/lib/swiper/swiper-element.min.mjs.map","/lib/swiper/swiper-element.mjs","/lib/swiper/swiper-react.d.ts","/lib/swiper/swiper-react.mjs","/lib/swiper/swiper-vars.less","/lib/swiper/swiper-vars.scss","/lib/swiper/swiper-vue.d.ts","/lib/swiper/swiper-vue.mjs","/lib/swiper/swiper.css","/lib/swiper/swiper.d.ts","/lib/swiper/swiper.js","/lib/swiper/swiper.less","/lib/swiper/swiper.min.css","/lib/swiper/swiper.min.js","/lib/swiper/swiper.min.js.map","/lib/swiper/swiper.min.mjs","/lib/swiper/swiper.min.mjs.map","/lib/swiper/swiper.mjs","/lib/swiper/swiper.scss","/lib/swiper/shared/classes-to-selector.min.mjs","/lib/swiper/shared/classes-to-selector.min.mjs.map","/lib/swiper/shared/classes-to-selector.mjs","/lib/swiper/shared/create-element-if-not-defined.min.mjs","/lib/swiper/shared/create-element-if-not-defined.min.mjs.map","/lib/swiper/shared/create-element-if-not-defined.mjs","/lib/swiper/shared/create-shadow.min.mjs","/lib/swiper/shared/create-shadow.min.mjs.map","/lib/swiper/shared/create-shadow.mjs","/lib/swiper/shared/effect-init.min.mjs","/lib/swiper/shared/effect-init.min.mjs.map","/lib/swiper/shared/effect-init.mjs","/lib/swiper/shared/effect-target.min.mjs","/lib/swiper/shared/effect-target.min.mjs.map","/lib/swiper/shared/effect-target.mjs","/lib/swiper/shared/effect-virtual-transition-end.min.mjs","/lib/swiper/shared/effect-virtual-transition-end.min.mjs.map","/lib/swiper/shared/effect-virtual-transition-end.mjs","/lib/swiper/shared/get-element-params.min.mjs","/lib/swiper/shared/get-element-params.min.mjs.map","/lib/swiper/shared/get-element-params.mjs","/lib/swiper/shared/ssr-window.esm.min.mjs","/lib/swiper/shared/ssr-window.esm.min.mjs.map","/lib/swiper/shared/ssr-window.esm.mjs","/lib/swiper/shared/swiper-core.min.mjs","/lib/swiper/shared/swiper-core.min.mjs.map","/lib/swiper/shared/swiper-core.mjs","/lib/swiper/shared/update-on-virtual-data.min.mjs","/lib/swiper/shared/update-on-virtual-data.min.mjs.map","/lib/swiper/shared/update-on-virtual-data.mjs","/lib/swiper/shared/update-swiper.min.mjs","/lib/swiper/shared/update-swiper.min.mjs.map","/lib/swiper/shared/update-swiper.mjs","/lib/swiper/shared/utils.min.mjs","/lib/swiper/shared/utils.min.mjs.map","/lib/swiper/shared/utils.mjs","/lib/swiper/types/index.d.ts","/lib/swiper/types/shared.d.ts","/lib/swiper/types/swiper-class.d.ts","/lib/swiper/types/swiper-events.d.ts","/lib/swiper/types/swiper-options.d.ts","/lib/swiper/modules/a11y-element.css","/lib/swiper/modules/a11y-element.min.css","/lib/swiper/modules/a11y.css","/lib/swiper/modules/a11y.less","/lib/swiper/modules/a11y.min.css","/lib/swiper/modules/a11y.min.mjs","/lib/swiper/modules/a11y.min.mjs.map","/lib/swiper/modules/a11y.mjs","/lib/swiper/modules/a11y.scss","/lib/swiper/modules/autoplay-element.css","/lib/swiper/modules/autoplay-element.min.css","/lib/swiper/modules/autoplay.css","/lib/swiper/modules/autoplay.less","/lib/swiper/modules/autoplay.min.css","/lib/swiper/modules/autoplay.min.mjs","/lib/swiper/modules/autoplay.min.mjs.map","/lib/swiper/modules/autoplay.mjs","/lib/swiper/modules/autoplay.scss","/lib/swiper/modules/controller-element.css","/lib/swiper/modules/controller-element.min.css","/lib/swiper/modules/controller.css","/lib/swiper/modules/controller.less","/lib/swiper/modules/controller.min.css","/lib/swiper/modules/controller.min.mjs","/lib/swiper/modules/controller.min.mjs.map","/lib/swiper/modules/controller.mjs","/lib/swiper/modules/controller.scss","/lib/swiper/modules/effect-cards-element.css","/lib/swiper/modules/effect-cards-element.min.css","/lib/swiper/modules/effect-cards.css","/lib/swiper/modules/effect-cards.less","/lib/swiper/modules/effect-cards.min.css","/lib/swiper/modules/effect-cards.min.mjs","/lib/swiper/modules/effect-cards.min.mjs.map","/lib/swiper/modules/effect-cards.mjs","/lib/swiper/modules/effect-cards.scss","/lib/swiper/modules/effect-coverflow-element.css","/lib/swiper/modules/effect-coverflow-element.min.css","/lib/swiper/modules/effect-coverflow.css","/lib/swiper/modules/effect-coverflow.less","/lib/swiper/modules/effect-coverflow.min.css","/lib/swiper/modules/effect-coverflow.min.mjs","/lib/swiper/modules/effect-coverflow.min.mjs.map","/lib/swiper/modules/effect-coverflow.mjs","/lib/swiper/modules/effect-coverflow.scss","/lib/swiper/modules/effect-creative-element.css","/lib/swiper/modules/effect-creative-element.min.css","/lib/swiper/modules/effect-creative.css","/lib/swiper/modules/effect-creative.less","/lib/swiper/modules/effect-creative.min.css","/lib/swiper/modules/effect-creative.min.mjs","/lib/swiper/modules/effect-creative.min.mjs.map","/lib/swiper/modules/effect-creative.mjs","/lib/swiper/modules/effect-creative.scss","/lib/swiper/modules/effect-cube-element.css","/lib/swiper/modules/effect-cube-element.min.css","/lib/swiper/modules/effect-cube.css","/lib/swiper/modules/effect-cube.less","/lib/swiper/modules/effect-cube.min.css","/lib/swiper/modules/effect-cube.min.mjs","/lib/swiper/modules/effect-cube.min.mjs.map","/lib/swiper/modules/effect-cube.mjs","/lib/swiper/modules/effect-cube.scss","/lib/swiper/modules/effect-fade-element.css","/lib/swiper/modules/effect-fade-element.min.css","/lib/swiper/modules/effect-fade.css","/lib/swiper/modules/effect-fade.less","/lib/swiper/modules/effect-fade.min.css","/lib/swiper/modules/effect-fade.min.mjs","/lib/swiper/modules/effect-fade.min.mjs.map","/lib/swiper/modules/effect-fade.mjs","/lib/swiper/modules/effect-fade.scss","/lib/swiper/modules/effect-flip-element.css","/lib/swiper/modules/effect-flip-element.min.css","/lib/swiper/modules/effect-flip.css","/lib/swiper/modules/effect-flip.less","/lib/swiper/modules/effect-flip.min.css","/lib/swiper/modules/effect-flip.min.mjs","/lib/swiper/modules/effect-flip.min.mjs.map","/lib/swiper/modules/effect-flip.mjs","/lib/swiper/modules/effect-flip.scss","/lib/swiper/modules/free-mode-element.css","/lib/swiper/modules/free-mode-element.min.css","/lib/swiper/modules/free-mode.css","/lib/swiper/modules/free-mode.less","/lib/swiper/modules/free-mode.min.css","/lib/swiper/modules/free-mode.min.mjs","/lib/swiper/modules/free-mode.min.mjs.map","/lib/swiper/modules/free-mode.mjs","/lib/swiper/modules/free-mode.scss","/lib/swiper/modules/grid-element.css","/lib/swiper/modules/grid-element.min.css","/lib/swiper/modules/grid.css","/lib/swiper/modules/grid.less","/lib/swiper/modules/grid.min.css","/lib/swiper/modules/grid.min.mjs","/lib/swiper/modules/grid.min.mjs.map","/lib/swiper/modules/grid.mjs","/lib/swiper/modules/grid.scss","/lib/swiper/modules/hash-navigation-element.css","/lib/swiper/modules/hash-navigation-element.min.css","/lib/swiper/modules/hash-navigation.css","/lib/swiper/modules/hash-navigation.less","/lib/swiper/modules/hash-navigation.min.css","/lib/swiper/modules/hash-navigation.min.mjs","/lib/swiper/modules/hash-navigation.min.mjs.map","/lib/swiper/modules/hash-navigation.mjs","/lib/swiper/modules/hash-navigation.scss","/lib/swiper/modules/history-element.css","/lib/swiper/modules/history-element.min.css","/lib/swiper/modules/history.css","/lib/swiper/modules/history.less","/lib/swiper/modules/history.min.css","/lib/swiper/modules/history.min.mjs","/lib/swiper/modules/history.min.mjs.map","/lib/swiper/modules/history.mjs","/lib/swiper/modules/history.scss","/lib/swiper/modules/index.min.mjs","/lib/swiper/modules/index.min.mjs.map","/lib/swiper/modules/index.mjs","/lib/swiper/modules/keyboard-element.css","/lib/swiper/modules/keyboard-element.min.css","/lib/swiper/modules/keyboard.css","/lib/swiper/modules/keyboard.less","/lib/swiper/modules/keyboard.min.css","/lib/swiper/modules/keyboard.min.mjs","/lib/swiper/modules/keyboard.min.mjs.map","/lib/swiper/modules/keyboard.mjs","/lib/swiper/modules/keyboard.scss","/lib/swiper/modules/manipulation-element.css","/lib/swiper/modules/manipulation-element.min.css","/lib/swiper/modules/manipulation.css","/lib/swiper/modules/manipulation.less","/lib/swiper/modules/manipulation.min.css","/lib/swiper/modules/manipulation.min.mjs","/lib/swiper/modules/manipulation.min.mjs.map","/lib/swiper/modules/manipulation.mjs","/lib/swiper/modules/manipulation.scss","/lib/swiper/modules/mousewheel-element.css","/lib/swiper/modules/mousewheel-element.min.css","/lib/swiper/modules/mousewheel.css","/lib/swiper/modules/mousewheel.less","/lib/swiper/modules/mousewheel.min.css","/lib/swiper/modules/mousewheel.min.mjs","/lib/swiper/modules/mousewheel.min.mjs.map","/lib/swiper/modules/mousewheel.mjs","/lib/swiper/modules/mousewheel.scss","/lib/swiper/modules/navigation-element.css","/lib/swiper/modules/navigation-element.min.css","/lib/swiper/modules/navigation.css","/lib/swiper/modules/navigation.less","/lib/swiper/modules/navigation.min.css","/lib/swiper/modules/navigation.min.mjs","/lib/swiper/modules/navigation.min.mjs.map","/lib/swiper/modules/navigation.mjs","/lib/swiper/modules/navigation.scss","/lib/swiper/modules/pagination-element.css","/lib/swiper/modules/pagination-element.min.css","/lib/swiper/modules/pagination.css","/lib/swiper/modules/pagination.less","/lib/swiper/modules/pagination.min.css","/lib/swiper/modules/pagination.min.mjs","/lib/swiper/modules/pagination.min.mjs.map","/lib/swiper/modules/pagination.mjs","/lib/swiper/modules/pagination.scss","/lib/swiper/modules/parallax-element.css","/lib/swiper/modules/parallax-element.min.css","/lib/swiper/modules/parallax.css","/lib/swiper/modules/parallax.less","/lib/swiper/modules/parallax.min.css","/lib/swiper/modules/parallax.min.mjs","/lib/swiper/modules/parallax.min.mjs.map","/lib/swiper/modules/parallax.mjs","/lib/swiper/modules/parallax.scss","/lib/swiper/modules/scrollbar-element.css","/lib/swiper/modules/scrollbar-element.min.css","/lib/swiper/modules/scrollbar.css","/lib/swiper/modules/scrollbar.less","/lib/swiper/modules/scrollbar.min.css","/lib/swiper/modules/scrollbar.min.mjs","/lib/swiper/modules/scrollbar.min.mjs.map","/lib/swiper/modules/scrollbar.mjs","/lib/swiper/modules/scrollbar.scss","/lib/swiper/modules/thumbs-element.css","/lib/swiper/modules/thumbs-element.min.css","/lib/swiper/modules/thumbs.css","/lib/swiper/modules/thumbs.less","/lib/swiper/modules/thumbs.min.css","/lib/swiper/modules/thumbs.min.mjs","/lib/swiper/modules/thumbs.min.mjs.map","/lib/swiper/modules/thumbs.mjs","/lib/swiper/modules/thumbs.scss","/lib/swiper/modules/virtual-element.css","/lib/swiper/modules/virtual-element.min.css","/lib/swiper/modules/virtual.css","/lib/swiper/modules/virtual.less","/lib/swiper/modules/virtual.min.css","/lib/swiper/modules/virtual.min.mjs","/lib/swiper/modules/virtual.min.mjs.map","/lib/swiper/modules/virtual.mjs","/lib/swiper/modules/virtual.scss","/lib/swiper/modules/zoom-element.css","/lib/swiper/modules/zoom-element.min.css","/lib/swiper/modules/zoom.css","/lib/swiper/modules/zoom.less","/lib/swiper/modules/zoom.min.css","/lib/swiper/modules/zoom.min.mjs","/lib/swiper/modules/zoom.min.mjs.map","/lib/swiper/modules/zoom.mjs","/lib/swiper/modules/zoom.scss","/lib/swiper/types/modules/a11y.d.ts","/lib/swiper/types/modules/autoplay.d.ts","/lib/swiper/types/modules/controller.d.ts","/lib/swiper/types/modules/effect-cards.d.ts","/lib/swiper/types/modules/effect-coverflow.d.ts","/lib/swiper/types/modules/effect-creative.d.ts","/lib/swiper/types/modules/effect-cube.d.ts","/lib/swiper/types/modules/effect-fade.d.ts","/lib/swiper/types/modules/effect-flip.d.ts","/lib/swiper/types/modules/free-mode.d.ts","/lib/swiper/types/modules/grid.d.ts","/lib/swiper/types/modules/hash-navigation.d.ts","/lib/swiper/types/modules/history.d.ts","/lib/swiper/types/modules/index.d.ts","/lib/swiper/types/modules/keyboard.d.ts","/lib/swiper/types/modules/manipulation.d.ts","/lib/swiper/types/modules/mousewheel.d.ts","/lib/swiper/types/modules/navigation.d.ts","/lib/swiper/types/modules/pagination.d.ts","/lib/swiper/types/modules/parallax.d.ts","/lib/swiper/types/modules/public-api.d.ts","/lib/swiper/types/modules/scrollbar.d.ts","/lib/swiper/types/modules/thumbs.d.ts","/lib/swiper/types/modules/virtual.d.ts","/lib/swiper/types/modules/zoom.d.ts","/contact/index.html","/guide/index.html","/index.html"],"buildFormat":"preserve","checkOrigin":true,"serverIslandNameMap":[],"key":"cO5M5gIwSb6WH47r98cONvQ41ss3a4WqJkeRSYY17+I=","sessionConfig":{"driver":"fs-lite","options":{"base":"C:\\Users\\user\\Desktop\\astro-static-template\\node_modules\\.astro\\sessions"}}});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = () => import('./chunks/fs-lite_COtHaKzy.mjs');

export { manifest };
