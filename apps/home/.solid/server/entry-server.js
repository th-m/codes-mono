import { isServer, createComponent, spread, escape, delegateEvents, ssrElement, mergeProps as mergeProps$1, ssr, ssrHydrationKey, useAssets, ssrAttribute, HydrationScript, NoHydration, renderToStringAsync } from 'solid-js/web';
import { createContext, sharedConfig, createUniqueId, useContext, createRenderEffect, onCleanup, createSignal, getOwner, runWithOwner, createMemo, createComponent as createComponent$1, untrack, on, startTransition, resetErrorBoundaries, children, createRoot, Show, mergeProps, splitProps, createEffect, batch, ErrorBoundary as ErrorBoundary$1, onMount, Suspense } from 'solid-js';
import invariant$1 from 'tiny-invariant';
import { createClient } from '@supabase/supabase-js';

const FETCH_EVENT = "$FETCH";

function getRouteMatches$1(routes, path, method) {
  const segments = path.split("/").filter(Boolean);
  routeLoop:
    for (const route of routes) {
      const matchSegments = route.matchSegments;
      if (segments.length < matchSegments.length || !route.wildcard && segments.length > matchSegments.length) {
        continue;
      }
      for (let index = 0; index < matchSegments.length; index++) {
        const match = matchSegments[index];
        if (!match) {
          continue;
        }
        if (segments[index] !== match) {
          continue routeLoop;
        }
      }
      const handler = route[method];
      if (handler === "skip" || handler === void 0) {
        return;
      }
      const params = {};
      for (const { type, name, index } of route.params) {
        if (type === ":") {
          params[name] = segments[index];
        } else {
          params[name] = segments.slice(index).join("/");
        }
      }
      return { handler, params };
    }
}

let apiRoutes$1;
const registerApiRoutes = (routes) => {
  apiRoutes$1 = routes;
};
async function internalFetch(route, init, env = {}, locals = {}) {
  if (route.startsWith("http")) {
    return await fetch(route, init);
  }
  let url = new URL(route, "http://internal");
  const request = new Request(url.href, init);
  const handler = getRouteMatches$1(apiRoutes$1, url.pathname, request.method.toUpperCase());
  if (!handler) {
    throw new Error(`No handler found for ${request.method} ${request.url}`);
  }
  let apiEvent = Object.freeze({
    request,
    params: handler.params,
    clientAddress: "127.0.0.1",
    env,
    locals,
    $type: FETCH_EVENT,
    fetch: internalFetch
  });
  const response = await handler.handler(apiEvent);
  return response;
}

const MetaContext = createContext();
const cascadingTags = ["title", "meta"];
const getTagType = tag => tag.tag + (tag.name ? `.${tag.name}"` : "");
const MetaProvider = props => {
  if (!isServer && !sharedConfig.context) {
    const ssrTags = document.head.querySelectorAll(`[data-sm]`);
    // `forEach` on `NodeList` is not supported in Googlebot, so use a workaround
    Array.prototype.forEach.call(ssrTags, ssrTag => ssrTag.parentNode.removeChild(ssrTag));
  }
  const cascadedTagInstances = new Map();
  // TODO: use one element for all tags of the same type, just swap out
  // where the props get applied
  function getElement(tag) {
    if (tag.ref) {
      return tag.ref;
    }
    let el = document.querySelector(`[data-sm="${tag.id}"]`);
    if (el) {
      if (el.tagName.toLowerCase() !== tag.tag) {
        if (el.parentNode) {
          // remove the old tag
          el.parentNode.removeChild(el);
        }
        // add the new tag
        el = document.createElement(tag.tag);
      }
      // use the old tag
      el.removeAttribute("data-sm");
    } else {
      // create a new tag
      el = document.createElement(tag.tag);
    }
    return el;
  }
  const actions = {
    addClientTag: tag => {
      let tagType = getTagType(tag);
      if (cascadingTags.indexOf(tag.tag) !== -1) {
        //  only cascading tags need to be kept as singletons
        if (!cascadedTagInstances.has(tagType)) {
          cascadedTagInstances.set(tagType, []);
        }
        let instances = cascadedTagInstances.get(tagType);
        let index = instances.length;
        instances = [...instances, tag];
        // track indices synchronously
        cascadedTagInstances.set(tagType, instances);
        if (!isServer) {
          let element = getElement(tag);
          tag.ref = element;
          spread(element, tag.props);
          let lastVisited = null;
          for (var i = index - 1; i >= 0; i--) {
            if (instances[i] != null) {
              lastVisited = instances[i];
              break;
            }
          }
          if (element.parentNode != document.head) {
            document.head.appendChild(element);
          }
          if (lastVisited && lastVisited.ref) {
            document.head.removeChild(lastVisited.ref);
          }
        }
        return index;
      }
      if (!isServer) {
        let element = getElement(tag);
        tag.ref = element;
        spread(element, tag.props);
        if (element.parentNode != document.head) {
          document.head.appendChild(element);
        }
      }
      return -1;
    },
    removeClientTag: (tag, index) => {
      const tagName = getTagType(tag);
      if (tag.ref) {
        const t = cascadedTagInstances.get(tagName);
        if (t) {
          if (tag.ref.parentNode) {
            tag.ref.parentNode.removeChild(tag.ref);
            for (let i = index - 1; i >= 0; i--) {
              if (t[i] != null) {
                document.head.appendChild(t[i].ref);
              }
            }
          }
          t[index] = null;
          cascadedTagInstances.set(tagName, t);
        } else {
          if (tag.ref.parentNode) {
            tag.ref.parentNode.removeChild(tag.ref);
          }
        }
      }
    }
  };
  if (isServer) {
    actions.addServerTag = tagDesc => {
      const {
        tags = []
      } = props;
      // tweak only cascading tags
      if (cascadingTags.indexOf(tagDesc.tag) !== -1) {
        const index = tags.findIndex(prev => {
          const prevName = prev.props.name || prev.props.property;
          const nextName = tagDesc.props.name || tagDesc.props.property;
          return prev.tag === tagDesc.tag && prevName === nextName;
        });
        if (index !== -1) {
          tags.splice(index, 1);
        }
      }
      tags.push(tagDesc);
    };
    if (Array.isArray(props.tags) === false) {
      throw Error("tags array should be passed to <MetaProvider /> in node");
    }
  }
  return createComponent(MetaContext.Provider, {
    value: actions,
    get children() {
      return props.children;
    }
  });
};
const MetaTag = (tag, props, setting) => {
  const id = createUniqueId();
  const c = useContext(MetaContext);
  if (!c) throw new Error("<MetaProvider /> should be in the tree");
  useHead({
    tag,
    props,
    setting,
    id,
    get name() {
      return props.name || props.property;
    }
  });
  return null;
};
function useHead(tagDesc) {
  const {
    addClientTag,
    removeClientTag,
    addServerTag
  } = useContext(MetaContext);
  createRenderEffect(() => {
    if (!isServer) {
      let index = addClientTag(tagDesc);
      onCleanup(() => removeClientTag(tagDesc, index));
    }
  });
  if (isServer) {
    addServerTag(tagDesc);
    return null;
  }
}
function renderTags(tags) {
  return tags.map(tag => {
    const keys = Object.keys(tag.props);
    // @ts-expect-error
    const props = keys.map(k => k === "children" ? "" : ` ${k}="${escape(tag.props[k], true)}"`).join("");
    if (tag.props.children) {
      // Tags might contain multiple text children:
      //   <Title>example - {myCompany}</Title>
      const children = Array.isArray(tag.props.children) ? tag.props.children.join("") : tag.props.children;
      if (tag.setting?.escape && typeof children === "string") {
        return `<${tag.tag} data-sm="${tag.id}"${props}>${escape(children)}</${tag.tag}>`;
      }
      return `<${tag.tag} data-sm="${tag.id}"${props}>${children}</${tag.tag}>`;
    }
    return `<${tag.tag} data-sm="${tag.id}"${props}/>`;
  }).join("");
}
const Title = props => MetaTag("title", props, {
  escape: true
});
const Meta$1 = props => MetaTag("meta", props, {
  escape: true
});

function bindEvent(target, type, handler) {
    target.addEventListener(type, handler);
    return () => target.removeEventListener(type, handler);
}
function intercept([value, setValue], get, set) {
    return [get ? () => get(value()) : value, set ? (v) => setValue(set(v)) : setValue];
}
function querySelector(selector) {
    // Guard against selector being an invalid CSS selector
    try {
        return document.querySelector(selector);
    }
    catch (e) {
        return null;
    }
}
function scrollToHash(hash, fallbackTop) {
    const el = querySelector(`#${hash}`);
    if (el) {
        el.scrollIntoView();
    }
    else if (fallbackTop) {
        window.scrollTo(0, 0);
    }
}
function createIntegration(get, set, init, utils) {
    let ignore = false;
    const wrap = (value) => (typeof value === "string" ? { value } : value);
    const signal = intercept(createSignal(wrap(get()), { equals: (a, b) => a.value === b.value }), undefined, next => {
        !ignore && set(next);
        return next;
    });
    init &&
        onCleanup(init((value = get()) => {
            ignore = true;
            signal[1](wrap(value));
            ignore = false;
        }));
    return {
        signal,
        utils
    };
}
function normalizeIntegration(integration) {
    if (!integration) {
        return {
            signal: createSignal({ value: "" })
        };
    }
    else if (Array.isArray(integration)) {
        return {
            signal: integration
        };
    }
    return integration;
}
function staticIntegration(obj) {
    return {
        signal: [() => obj, next => Object.assign(obj, next)]
    };
}
function pathIntegration() {
    return createIntegration(() => ({
        value: window.location.pathname + window.location.search + window.location.hash,
        state: history.state
    }), ({ value, replace, scroll, state }) => {
        if (replace) {
            window.history.replaceState(state, "", value);
        }
        else {
            window.history.pushState(state, "", value);
        }
        scrollToHash(window.location.hash.slice(1), scroll);
    }, notify => bindEvent(window, "popstate", () => notify()), {
        go: delta => window.history.go(delta)
    });
}

function createBeforeLeave() {
    let listeners = new Set();
    function subscribe(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
    }
    let ignore = false;
    function confirm(to, options) {
        if (ignore)
            return !(ignore = false);
        const e = {
            to,
            options,
            defaultPrevented: false,
            preventDefault: () => (e.defaultPrevented = true)
        };
        for (const l of listeners)
            l.listener({
                ...e,
                from: l.location,
                retry: (force) => {
                    force && (ignore = true);
                    l.navigate(to, options);
                }
            });
        return !e.defaultPrevented;
    }
    return {
        subscribe,
        confirm
    };
}

const hasSchemeRegex = /^(?:[a-z0-9]+:)?\/\//i;
const trimPathRegex = /^\/+|(\/)\/+$/g;
function normalizePath(path, omitSlash = false) {
    const s = path.replace(trimPathRegex, "$1");
    return s ? (omitSlash || /^[?#]/.test(s) ? s : "/" + s) : "";
}
function resolvePath(base, path, from) {
    if (hasSchemeRegex.test(path)) {
        return undefined;
    }
    const basePath = normalizePath(base);
    const fromPath = from && normalizePath(from);
    let result = "";
    if (!fromPath || path.startsWith("/")) {
        result = basePath;
    }
    else if (fromPath.toLowerCase().indexOf(basePath.toLowerCase()) !== 0) {
        result = basePath + fromPath;
    }
    else {
        result = fromPath;
    }
    return (result || "/") + normalizePath(path, !result);
}
function invariant(value, message) {
    if (value == null) {
        throw new Error(message);
    }
    return value;
}
function joinPaths(from, to) {
    return normalizePath(from).replace(/\/*(\*.*)?$/g, "") + normalizePath(to);
}
function extractSearchParams(url) {
    const params = {};
    url.searchParams.forEach((value, key) => {
        params[key] = value;
    });
    return params;
}
function createMatcher(path, partial, matchFilters) {
    const [pattern, splat] = path.split("/*", 2);
    const segments = pattern.split("/").filter(Boolean);
    const len = segments.length;
    return (location) => {
        const locSegments = location.split("/").filter(Boolean);
        const lenDiff = locSegments.length - len;
        if (lenDiff < 0 || (lenDiff > 0 && splat === undefined && !partial)) {
            return null;
        }
        const match = {
            path: len ? "" : "/",
            params: {}
        };
        const matchFilter = (s) => matchFilters === undefined ? undefined : matchFilters[s];
        for (let i = 0; i < len; i++) {
            const segment = segments[i];
            const locSegment = locSegments[i];
            const dynamic = segment[0] === ":";
            const key = dynamic ? segment.slice(1) : segment;
            if (dynamic && matchSegment(locSegment, matchFilter(key))) {
                match.params[key] = locSegment;
            }
            else if (dynamic || !matchSegment(locSegment, segment)) {
                return null;
            }
            match.path += `/${locSegment}`;
        }
        if (splat) {
            const remainder = lenDiff ? locSegments.slice(-lenDiff).join("/") : "";
            if (matchSegment(remainder, matchFilter(splat))) {
                match.params[splat] = remainder;
            }
            else {
                return null;
            }
        }
        return match;
    };
}
function matchSegment(input, filter) {
    const isEqual = (s) => s.localeCompare(input, undefined, { sensitivity: "base" }) === 0;
    if (filter === undefined) {
        return true;
    }
    else if (typeof filter === "string") {
        return isEqual(filter);
    }
    else if (typeof filter === "function") {
        return filter(input);
    }
    else if (Array.isArray(filter)) {
        return filter.some(isEqual);
    }
    else if (filter instanceof RegExp) {
        return filter.test(input);
    }
    return false;
}
function scoreRoute(route) {
    const [pattern, splat] = route.pattern.split("/*", 2);
    const segments = pattern.split("/").filter(Boolean);
    return segments.reduce((score, segment) => score + (segment.startsWith(":") ? 2 : 3), segments.length - (splat === undefined ? 0 : 1));
}
function createMemoObject(fn) {
    const map = new Map();
    const owner = getOwner();
    return new Proxy({}, {
        get(_, property) {
            if (!map.has(property)) {
                runWithOwner(owner, () => map.set(property, createMemo(() => fn()[property])));
            }
            return map.get(property)();
        },
        getOwnPropertyDescriptor() {
            return {
                enumerable: true,
                configurable: true
            };
        },
        ownKeys() {
            return Reflect.ownKeys(fn());
        }
    });
}
function mergeSearchString(search, params) {
    const merged = new URLSearchParams(search);
    Object.entries(params).forEach(([key, value]) => {
        if (value == null || value === "") {
            merged.delete(key);
        }
        else {
            merged.set(key, String(value));
        }
    });
    const s = merged.toString();
    return s ? `?${s}` : "";
}
function expandOptionals$1(pattern) {
    let match = /(\/?\:[^\/]+)\?/.exec(pattern);
    if (!match)
        return [pattern];
    let prefix = pattern.slice(0, match.index);
    let suffix = pattern.slice(match.index + match[0].length);
    const prefixes = [prefix, (prefix += match[1])];
    // This section handles adjacent optional params. We don't actually want all permuations since
    // that will lead to equivalent routes which have the same number of params. For example
    // `/:a?/:b?/:c`? only has the unique expansion: `/`, `/:a`, `/:a/:b`, `/:a/:b/:c` and we can
    // discard `/:b`, `/:c`, `/:b/:c` by building them up in order and not recursing. This also helps
    // ensure predictability where earlier params have precidence.
    while ((match = /^(\/\:[^\/]+)\?/.exec(suffix))) {
        prefixes.push((prefix += match[1]));
        suffix = suffix.slice(match[0].length);
    }
    return expandOptionals$1(suffix).reduce((results, expansion) => [...results, ...prefixes.map(p => p + expansion)], []);
}

const MAX_REDIRECTS = 100;
const RouterContextObj = createContext();
const RouteContextObj = createContext();
const useRouter = () => invariant(useContext(RouterContextObj), "Make sure your app is wrapped in a <Router />");
let TempRoute;
const useRoute = () => TempRoute || useContext(RouteContextObj) || useRouter().base;
const useResolvedPath = (path) => {
    const route = useRoute();
    return createMemo(() => route.resolvePath(path()));
};
const useHref = (to) => {
    const router = useRouter();
    return createMemo(() => {
        const to_ = to();
        return to_ !== undefined ? router.renderPath(to_) : to_;
    });
};
const useNavigate = () => useRouter().navigatorFactory();
const useLocation$1 = () => useRouter().location;
const useSearchParams = () => {
    const location = useLocation$1();
    const navigate = useNavigate();
    const setSearchParams = (params, options) => {
        const searchString = untrack(() => mergeSearchString(location.search, params));
        navigate(location.pathname + searchString + location.hash, {
            scroll: false,
            resolve: false,
            ...options
        });
    };
    return [location.query, setSearchParams];
};
function createRoutes(routeDef, base = "", fallback) {
    const { component, data, children } = routeDef;
    const isLeaf = !children || (Array.isArray(children) && !children.length);
    const shared = {
        key: routeDef,
        element: component
            ? () => createComponent$1(component, {})
            : () => {
                const { element } = routeDef;
                return element === undefined && fallback
                    ? createComponent$1(fallback, {})
                    : element;
            },
        preload: routeDef.component
            ? component.preload
            : routeDef.preload,
        data
    };
    return asArray(routeDef.path).reduce((acc, path) => {
        for (const originalPath of expandOptionals$1(path)) {
            const path = joinPaths(base, originalPath);
            const pattern = isLeaf ? path : path.split("/*", 1)[0];
            acc.push({
                ...shared,
                originalPath,
                pattern,
                matcher: createMatcher(pattern, !isLeaf, routeDef.matchFilters)
            });
        }
        return acc;
    }, []);
}
function createBranch(routes, index = 0) {
    return {
        routes,
        score: scoreRoute(routes[routes.length - 1]) * 10000 - index,
        matcher(location) {
            const matches = [];
            for (let i = routes.length - 1; i >= 0; i--) {
                const route = routes[i];
                const match = route.matcher(location);
                if (!match) {
                    return null;
                }
                matches.unshift({
                    ...match,
                    route
                });
            }
            return matches;
        }
    };
}
function asArray(value) {
    return Array.isArray(value) ? value : [value];
}
function createBranches(routeDef, base = "", fallback, stack = [], branches = []) {
    const routeDefs = asArray(routeDef);
    for (let i = 0, len = routeDefs.length; i < len; i++) {
        const def = routeDefs[i];
        if (def && typeof def === "object" && def.hasOwnProperty("path")) {
            const routes = createRoutes(def, base, fallback);
            for (const route of routes) {
                stack.push(route);
                const isEmptyArray = Array.isArray(def.children) && def.children.length === 0;
                if (def.children && !isEmptyArray) {
                    createBranches(def.children, route.pattern, fallback, stack, branches);
                }
                else {
                    const branch = createBranch([...stack], branches.length);
                    branches.push(branch);
                }
                stack.pop();
            }
        }
    }
    // Stack will be empty on final return
    return stack.length ? branches : branches.sort((a, b) => b.score - a.score);
}
function getRouteMatches(branches, location) {
    for (let i = 0, len = branches.length; i < len; i++) {
        const match = branches[i].matcher(location);
        if (match) {
            return match;
        }
    }
    return [];
}
function createLocation(path, state) {
    const origin = new URL("http://sar");
    const url = createMemo(prev => {
        const path_ = path();
        try {
            return new URL(path_, origin);
        }
        catch (err) {
            console.error(`Invalid path ${path_}`);
            return prev;
        }
    }, origin, {
        equals: (a, b) => a.href === b.href
    });
    const pathname = createMemo(() => url().pathname);
    const search = createMemo(() => url().search, true);
    const hash = createMemo(() => url().hash);
    const key = createMemo(() => "");
    return {
        get pathname() {
            return pathname();
        },
        get search() {
            return search();
        },
        get hash() {
            return hash();
        },
        get state() {
            return state();
        },
        get key() {
            return key();
        },
        query: createMemoObject(on(search, () => extractSearchParams(url())))
    };
}
function createRouterContext(integration, base = "", data, out) {
    const { signal: [source, setSource], utils = {} } = normalizeIntegration(integration);
    const parsePath = utils.parsePath || (p => p);
    const renderPath = utils.renderPath || (p => p);
    const beforeLeave = utils.beforeLeave || createBeforeLeave();
    const basePath = resolvePath("", base);
    const output = isServer && out
        ? Object.assign(out, {
            matches: [],
            url: undefined
        })
        : undefined;
    if (basePath === undefined) {
        throw new Error(`${basePath} is not a valid base path`);
    }
    else if (basePath && !source().value) {
        setSource({ value: basePath, replace: true, scroll: false });
    }
    const [isRouting, setIsRouting] = createSignal(false);
    const start = async (callback) => {
        setIsRouting(true);
        try {
            await startTransition(callback);
        }
        finally {
            setIsRouting(false);
        }
    };
    const [reference, setReference] = createSignal(source().value);
    const [state, setState] = createSignal(source().state);
    const location = createLocation(reference, state);
    const referrers = [];
    const baseRoute = {
        pattern: basePath,
        params: {},
        path: () => basePath,
        outlet: () => null,
        resolvePath(to) {
            return resolvePath(basePath, to);
        }
    };
    if (data) {
        try {
            TempRoute = baseRoute;
            baseRoute.data = data({
                data: undefined,
                params: {},
                location,
                navigate: navigatorFactory(baseRoute)
            });
        }
        finally {
            TempRoute = undefined;
        }
    }
    function navigateFromRoute(route, to, options) {
        // Untrack in case someone navigates in an effect - don't want to track `reference` or route paths
        untrack(() => {
            if (typeof to === "number") {
                if (!to) ;
                else if (utils.go) {
                    beforeLeave.confirm(to, options) && utils.go(to);
                }
                else {
                    console.warn("Router integration does not support relative routing");
                }
                return;
            }
            const { replace, resolve, scroll, state: nextState } = {
                replace: false,
                resolve: true,
                scroll: true,
                ...options
            };
            const resolvedTo = resolve ? route.resolvePath(to) : resolvePath("", to);
            if (resolvedTo === undefined) {
                throw new Error(`Path '${to}' is not a routable path`);
            }
            else if (referrers.length >= MAX_REDIRECTS) {
                throw new Error("Too many redirects");
            }
            const current = reference();
            if (resolvedTo !== current || nextState !== state()) {
                if (isServer) {
                    if (output) {
                        output.url = resolvedTo;
                    }
                    setSource({ value: resolvedTo, replace, scroll, state: nextState });
                }
                else if (beforeLeave.confirm(resolvedTo, options)) {
                    const len = referrers.push({ value: current, replace, scroll, state: state() });
                    start(() => {
                        setReference(resolvedTo);
                        setState(nextState);
                        resetErrorBoundaries();
                    }).then(() => {
                        if (referrers.length === len) {
                            navigateEnd({
                                value: resolvedTo,
                                state: nextState
                            });
                        }
                    });
                }
            }
        });
    }
    function navigatorFactory(route) {
        // Workaround for vite issue (https://github.com/vitejs/vite/issues/3803)
        route = route || useContext(RouteContextObj) || baseRoute;
        return (to, options) => navigateFromRoute(route, to, options);
    }
    function navigateEnd(next) {
        const first = referrers[0];
        if (first) {
            if (next.value !== first.value || next.state !== first.state) {
                setSource({
                    ...next,
                    replace: first.replace,
                    scroll: first.scroll
                });
            }
            referrers.length = 0;
        }
    }
    createRenderEffect(() => {
        const { value, state } = source();
        // Untrack this whole block so `start` doesn't cause Solid's Listener to be preserved
        untrack(() => {
            if (value !== reference()) {
                start(() => {
                    setReference(value);
                    setState(state);
                });
            }
        });
    });
    if (!isServer) {
        function handleAnchorClick(evt) {
            if (evt.defaultPrevented ||
                evt.button !== 0 ||
                evt.metaKey ||
                evt.altKey ||
                evt.ctrlKey ||
                evt.shiftKey)
                return;
            const a = evt
                .composedPath()
                .find(el => el instanceof Node && el.nodeName.toUpperCase() === "A");
            if (!a || !a.hasAttribute("link"))
                return;
            const href = a.href;
            if (a.target || (!href && !a.hasAttribute("state")))
                return;
            const rel = (a.getAttribute("rel") || "").split(/\s+/);
            if (a.hasAttribute("download") || (rel && rel.includes("external")))
                return;
            const url = new URL(href);
            if (url.origin !== window.location.origin ||
                (basePath && url.pathname && !url.pathname.toLowerCase().startsWith(basePath.toLowerCase())))
                return;
            const to = parsePath(url.pathname + url.search + url.hash);
            const state = a.getAttribute("state");
            evt.preventDefault();
            navigateFromRoute(baseRoute, to, {
                resolve: false,
                replace: a.hasAttribute("replace"),
                scroll: !a.hasAttribute("noscroll"),
                state: state && JSON.parse(state)
            });
        }
        // ensure delegated events run first
        delegateEvents(["click"]);
        document.addEventListener("click", handleAnchorClick);
        onCleanup(() => document.removeEventListener("click", handleAnchorClick));
    }
    return {
        base: baseRoute,
        out: output,
        location,
        isRouting,
        renderPath,
        parsePath,
        navigatorFactory,
        beforeLeave
    };
}
function createRouteContext(router, parent, child, match, params) {
    const { base, location, navigatorFactory } = router;
    const { pattern, element: outlet, preload, data } = match().route;
    const path = createMemo(() => match().path);
    preload && preload();
    const route = {
        parent,
        pattern,
        get child() {
            return child();
        },
        path,
        params,
        data: parent.data,
        outlet,
        resolvePath(to) {
            return resolvePath(base.path(), to, path());
        }
    };
    if (data) {
        try {
            TempRoute = route;
            route.data = data({ data: parent.data, params, location, navigate: navigatorFactory(route) });
        }
        finally {
            TempRoute = undefined;
        }
    }
    return route;
}

const Router = props => {
  const {
    source,
    url,
    base,
    data,
    out
  } = props;
  const integration = source || (isServer ? staticIntegration({
    value: url || ""
  }) : pathIntegration());
  const routerState = createRouterContext(integration, base, data, out);
  return createComponent(RouterContextObj.Provider, {
    value: routerState,
    get children() {
      return props.children;
    }
  });
};
const Routes$1 = props => {
  const router = useRouter();
  const parentRoute = useRoute();
  const routeDefs = children(() => props.children);
  const branches = createMemo(() => createBranches(routeDefs(), joinPaths(parentRoute.pattern, props.base || ""), Outlet));
  const matches = createMemo(() => getRouteMatches(branches(), router.location.pathname));
  const params = createMemoObject(() => {
    const m = matches();
    const params = {};
    for (let i = 0; i < m.length; i++) {
      Object.assign(params, m[i].params);
    }
    return params;
  });
  if (router.out) {
    router.out.matches.push(matches().map(({
      route,
      path,
      params
    }) => ({
      originalPath: route.originalPath,
      pattern: route.pattern,
      path,
      params
    })));
  }
  const disposers = [];
  let root;
  const routeStates = createMemo(on(matches, (nextMatches, prevMatches, prev) => {
    let equal = prevMatches && nextMatches.length === prevMatches.length;
    const next = [];
    for (let i = 0, len = nextMatches.length; i < len; i++) {
      const prevMatch = prevMatches && prevMatches[i];
      const nextMatch = nextMatches[i];
      if (prev && prevMatch && nextMatch.route.key === prevMatch.route.key) {
        next[i] = prev[i];
      } else {
        equal = false;
        if (disposers[i]) {
          disposers[i]();
        }
        createRoot(dispose => {
          disposers[i] = dispose;
          next[i] = createRouteContext(router, next[i - 1] || parentRoute, () => routeStates()[i + 1], () => matches()[i], params);
        });
      }
    }
    disposers.splice(nextMatches.length).forEach(dispose => dispose());
    if (prev && equal) {
      return prev;
    }
    root = next[0];
    return next;
  }));
  return createComponent(Show, {
    get when() {
      return routeStates() && root;
    },
    keyed: true,
    children: route => createComponent(RouteContextObj.Provider, {
      value: route,
      get children() {
        return route.outlet();
      }
    })
  });
};
const Outlet = () => {
  const route = useRoute();
  return createComponent(Show, {
    get when() {
      return route.child;
    },
    keyed: true,
    children: child => createComponent(RouteContextObj.Provider, {
      value: child,
      get children() {
        return child.outlet();
      }
    })
  });
};
function A$1(props) {
  props = mergeProps({
    inactiveClass: "inactive",
    activeClass: "active"
  }, props);
  const [, rest] = splitProps(props, ["href", "state", "class", "activeClass", "inactiveClass", "end"]);
  const to = useResolvedPath(() => props.href);
  const href = useHref(to);
  const location = useLocation$1();
  const isActive = createMemo(() => {
    const to_ = to();
    if (to_ === undefined) return false;
    const path = normalizePath(to_.split(/[?#]/, 1)[0]).toLowerCase();
    const loc = normalizePath(location.pathname).toLowerCase();
    return props.end ? path === loc : loc.startsWith(path);
  });
  return ssrElement("a", mergeProps$1({
    link: true
  }, rest, {
    get href() {
      return href() || props.href;
    },
    get state() {
      return JSON.stringify(props.state);
    },
    get classList() {
      return {
        ...(props.class && {
          [props.class]: true
        }),
        [props.inactiveClass]: !isActive(),
        [props.activeClass]: isActive(),
        ...rest.classList
      };
    },
    get ["aria-current"]() {
      return isActive() ? "page" : undefined;
    }
  }), undefined, true);
}

class ServerError extends Error {
  constructor(message, {
    status,
    stack
  } = {}) {
    super(message);
    this.name = "ServerError";
    this.status = status || 400;
    if (stack) {
      this.stack = stack;
    }
  }
}
class FormError extends ServerError {
  constructor(message, {
    fieldErrors = {},
    form,
    fields,
    stack
  } = {}) {
    super(message, {
      stack
    });
    this.formError = message;
    this.name = "FormError";
    this.fields = fields || Object.fromEntries(typeof form !== "undefined" ? form.entries() : []) || {};
    this.fieldErrors = fieldErrors;
  }
}

/**
 * Submits a HTML `<form>` to the server without reloading the page.
 */

/**
 * A Remix-aware `<form>`. It behaves like a normal form except that the
 * interaction with the server is with `fetch` instead of new document
 * requests, allowing components to add nicer UX to the page as the form is
 * submitted and returns with data.
 */
// export let Form = React.forwardRef<HTMLFormElement, FormProps>((props, ref) => {
//   return <FormImpl {...props} ref={ref} />;
// });
let FormImpl = _props => {
  let [props, rest] = splitProps(mergeProps({
    reloadDocument: false,
    replace: false,
    method: "post",
    action: "/",
    encType: "application/x-www-form-urlencoded"
  }, _props), ["reloadDocument", "replace", "method", "action", "encType", "onSubmission", "onSubmit", "children", "ref"]);
  let formMethod = props.method.toLowerCase() === "get" ? "get" : "post";
  createEffect(() => {
    return;
  }, []);
  return ssrElement("form", mergeProps$1({
    method: formMethod,
    get action() {
      return _props.action;
    },
    get enctype() {
      return props.encType;
    }
  }, rest), () => escape(props.children), true);
};

const XSolidStartLocationHeader = "x-solidstart-location";
const LocationHeader = "Location";
const ContentTypeHeader = "content-type";
const XSolidStartResponseTypeHeader = "x-solidstart-response-type";
const XSolidStartContentTypeHeader = "x-solidstart-content-type";
const XSolidStartOrigin = "x-solidstart-origin";
const JSONResponseType = "application/json";
function json(data, init = {}) {
  let responseInit = init;
  if (typeof init === "number") {
    responseInit = { status: init };
  }
  let headers = new Headers(responseInit.headers);
  if (!headers.has(ContentTypeHeader)) {
    headers.set(ContentTypeHeader, "application/json; charset=utf-8");
  }
  const response = new Response(JSON.stringify(data), {
    ...responseInit,
    headers
  });
  return response;
}
function redirect(url, init = 302) {
  let responseInit = init;
  if (typeof responseInit === "number") {
    responseInit = { status: responseInit };
  } else if (typeof responseInit.status === "undefined") {
    responseInit.status = 302;
  }
  if (url === "") {
    url = "/";
  }
  let headers = new Headers(responseInit.headers);
  headers.set(LocationHeader, url);
  const response = new Response(null, {
    ...responseInit,
    headers
  });
  return response;
}
const redirectStatusCodes = /* @__PURE__ */ new Set([204, 301, 302, 303, 307, 308]);
function isRedirectResponse(response) {
  return response && response instanceof Response && redirectStatusCodes.has(response.status);
}
class ResponseError extends Error {
  status;
  headers;
  name = "ResponseError";
  ok;
  statusText;
  redirected;
  url;
  constructor(response) {
    let message = JSON.stringify({
      $type: "response",
      status: response.status,
      message: response.statusText,
      headers: [...response.headers.entries()]
    });
    super(message);
    this.status = response.status;
    this.headers = new Map([...response.headers.entries()]);
    this.url = response.url;
    this.ok = response.ok;
    this.statusText = response.statusText;
    this.redirected = response.redirected;
    this.bodyUsed = false;
    this.type = response.type;
    this.response = () => response;
  }
  response;
  type;
  clone() {
    return this.response();
  }
  get body() {
    return this.response().body;
  }
  bodyUsed;
  async arrayBuffer() {
    return await this.response().arrayBuffer();
  }
  async blob() {
    return await this.response().blob();
  }
  async formData() {
    return await this.response().formData();
  }
  async text() {
    return await this.response().text();
  }
  async json() {
    return await this.response().json();
  }
}

const ServerContext = createContext({});
const useRequest = () => {
  return useContext(ServerContext);
};

createContext();
createContext();

const A = A$1;
const Routes = Routes$1;
Outlet;
const useLocation = useLocation$1;
useNavigate;

const resources = new Set();
function refetchRouteData(key) {
  if (isServer) throw new Error("Cannot refetch route data on the server.");
  return startTransition(() => {
    for (let refetch of resources) refetch(key);
  });
}

function createRouteAction(fn, options = {}) {
  let init = checkFlash(fn);
  const [input, setInput] = createSignal(init.input);
  const [result, setResult] = createSignal(init.result);
  const navigate = useNavigate();
  const event = useRequest();
  let count = 0;
  function submit(variables) {
    const p = fn(variables, event);
    const reqId = ++count;
    batch(() => {
      setResult(undefined);
      setInput(() => variables);
    });
    return p.then(async data => {
      if (reqId === count) {
        if (data instanceof Response) {
          await handleResponse(data, navigate, options);
        } else await handleRefetch(data, options);
        if (!data || isRedirectResponse(data)) setInput(undefined);else setResult({
          data
        });
      }
      return data;
    }).catch(async e => {
      if (reqId === count) {
        if (e instanceof Response) {
          await handleResponse(e, navigate, options);
        }
        if (!isRedirectResponse(e)) {
          setResult({
            error: e
          });
        } else setInput(undefined);
      }
      return undefined;
    });
  }
  submit.url = fn.url;
  submit.Form = props => {
    let url = fn.url;
    return createComponent(FormImpl, mergeProps$1(props, {
      action: url,
      onSubmission: submission => {
        submit(submission.formData);
      },
      get children() {
        return props.children;
      }
    }));
  };
  return [{
    get pending() {
      return !!input() && !result();
    },
    get input() {
      return input();
    },
    get result() {
      return result()?.data;
    },
    get error() {
      return result()?.error;
    },
    clear() {
      batch(() => {
        setInput(undefined);
        setResult(undefined);
      });
    },
    retry() {
      const variables = input();
      if (!variables) throw new Error("No submission to retry");
      submit(variables);
    }
  }, submit];
}
function handleRefetch(response, options = {}) {
  return refetchRouteData(typeof options.invalidate === "function" ? options.invalidate(response) : options.invalidate);
}
function handleResponse(response, navigate, options) {
  if (response instanceof Response && isRedirectResponse(response)) {
    const locationUrl = response.headers.get("Location") || "/";
    if (locationUrl.startsWith("http")) {
      window.location.href = locationUrl;
    } else {
      navigate(locationUrl);
    }
  }
  return handleRefetch(response, options);
}
function checkFlash(fn) {
  const [params] = useSearchParams();
  let param = params.form ? JSON.parse(params.form) : null;
  if (!param || param.url !== fn.url) {
    return {};
  }
  const input = new Map(param.entries);
  return {
    result: {
      error: param.error ? new FormError(param.error.message, {
        fieldErrors: param.error.fieldErrors,
        stack: param.error.stack,
        form: param.error.form,
        fields: param.error.fields
      }) : undefined
    },
    input: input
  };
}

const _tmpl$$e = ["<div", " style=\"", "\"><div style=\"", "\"><p style=\"", "\" id=\"error-message\">", "</p><button id=\"reset-errors\" style=\"", "\">Clear errors and retry</button><pre style=\"", "\">", "</pre></div></div>"];
function ErrorBoundary(props) {
  return createComponent(ErrorBoundary$1, {
    fallback: (e, reset) => {
      return createComponent(Show, {
        get when() {
          return !props.fallback;
        },
        get fallback() {
          return props.fallback && props.fallback(e, reset);
        },
        get children() {
          return createComponent(ErrorMessage, {
            error: e
          });
        }
      });
    },
    get children() {
      return props.children;
    }
  });
}
function ErrorMessage(props) {
  createEffect(() => console.error(props.error));
  return ssr(_tmpl$$e, ssrHydrationKey(), "padding:" + "16px", "background-color:" + "rgba(252, 165, 165)" + (";color:" + "rgb(153, 27, 27)") + (";border-radius:" + "5px") + (";overflow:" + "scroll") + (";padding:" + "16px") + (";margin-bottom:" + "8px"), "font-weight:" + "bold", escape(props.error.message), "color:" + "rgba(252, 165, 165)" + (";background-color:" + "rgb(153, 27, 27)") + (";border-radius:" + "5px") + (";padding:" + "4px 8px"), "margin-top:" + "8px" + (";width:" + "100%"), escape(props.error.stack));
}

const routeLayouts = {
  "/*404": {
    "id": "/*404",
    "layouts": []
  },
  "/about": {
    "id": "/about",
    "layouts": []
  },
  "/": {
    "id": "/",
    "layouts": []
  },
  "/login": {
    "id": "/(auth)/login",
    "layouts": []
  },
  "/logout": {
    "id": "/(auth)/logout",
    "layouts": []
  },
  "/sign-up": {
    "id": "/(auth)/sign-up",
    "layouts": []
  },
  "/apps/hubspot": {
    "id": "/apps/hubspot",
    "layouts": []
  },
  "/apps/": {
    "id": "/apps/",
    "layouts": []
  },
  "/apps/shopify": {
    "id": "/apps/shopify",
    "layouts": []
  },
  "/apps/slack": {
    "id": "/apps/slack",
    "layouts": []
  }
};

const _tmpl$$d = ["<link", " rel=\"stylesheet\"", ">"],
  _tmpl$2$4 = ["<link", " rel=\"modulepreload\"", ">"];
function flattenIslands(match, manifest) {
  let result = [...match];
  match.forEach(m => {
    if (m.type !== "island") return;
    const islandManifest = manifest[m.href];
    if (islandManifest) {
      const res = flattenIslands(islandManifest.assets, manifest);
      result.push(...res);
    }
  });
  return result;
}
function getAssetsFromManifest(manifest, routerContext) {
  let match = routerContext.matches ? routerContext.matches.reduce((memo, m) => {
    if (m.length) {
      const fullPath = m.reduce((previous, match) => previous + match.originalPath, "");
      const route = routeLayouts[fullPath];
      if (route) {
        memo.push(...(manifest[route.id] || []));
        const layoutsManifestEntries = route.layouts.flatMap(manifestKey => manifest[manifestKey] || []);
        memo.push(...layoutsManifestEntries);
      }
    }
    return memo;
  }, []) : [];
  match.push(...(manifest["entry-client"] || []));
  match = manifest ? flattenIslands(match, manifest) : [];
  const links = match.reduce((r, src) => {
    r[src.href] = src.type === "style" ? ssr(_tmpl$$d, ssrHydrationKey(), ssrAttribute("href", escape(src.href, true), false)) : src.type === "script" ? ssr(_tmpl$2$4, ssrHydrationKey(), ssrAttribute("href", escape(src.href, true), false)) : undefined;
    return r;
  }, {});
  return Object.values(links);
}

/**
 * Links are used to load assets for the server rendered HTML
 * @returns {JSXElement}
 */
function Links() {
  const context = useContext(ServerContext);
  useAssets(() => getAssetsFromManifest(context.env.manifest, context.routerContext));
  return null;
}

function Meta() {
  const context = useContext(ServerContext);
  // @ts-expect-error The ssr() types do not match the Assets child types
  useAssets(() => ssr(renderTags(context.tags)));
  return null;
}

const _tmpl$4$2 = ["<script", " type=\"module\" async", "></script>"];
const isDev = "production" === "development";
const isIslands = false;
function Scripts() {
  const context = useContext(ServerContext);
  return [createComponent(HydrationScript, {}), isIslands , createComponent(NoHydration, {
    get children() {
      return isServer && (      ssr(_tmpl$4$2, ssrHydrationKey(), ssrAttribute("src", escape(context.env.manifest["entry-client"][0].href, true), false)) );
    }
  }), isDev ];
}

function Html(props) {
  {
    return ssrElement("html", props, undefined, false);
  }
}
function Head(props) {
  {
    return ssrElement("head", props, () => [escape(props.children), createComponent(Meta, {}), createComponent(Links, {})], false);
  }
}
function Body(props) {
  {
    return ssrElement("body", props, () => escape(props.children) , false);
  }
}

/*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */
var decode = decodeURIComponent;
var encode = encodeURIComponent;
var fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
function parseCookie(str, options) {
  if (typeof str !== "string") {
    throw new TypeError("argument str must be a string");
  }
  var obj = {};
  var opt = options || {};
  var pairs = str.split(";");
  var dec = opt.decode || decode;
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i];
    var index = pair.indexOf("=");
    if (index < 0) {
      continue;
    }
    var key = pair.substring(0, index).trim();
    if (void 0 == obj[key]) {
      var val = pair.substring(index + 1, pair.length).trim();
      if (val[0] === '"') {
        val = val.slice(1, -1);
      }
      obj[key] = tryDecode(val, dec);
    }
  }
  return obj;
}
function serializeCookie(name, val, options) {
  var opt = options || {};
  var enc = opt.encode || encode;
  if (typeof enc !== "function") {
    throw new TypeError("option encode is invalid");
  }
  if (!fieldContentRegExp.test(name)) {
    throw new TypeError("argument name is invalid");
  }
  var value = enc(val);
  if (value && !fieldContentRegExp.test(value)) {
    throw new TypeError("argument val is invalid");
  }
  var str = name + "=" + value;
  if (null != opt.maxAge) {
    var maxAge = opt.maxAge - 0;
    if (isNaN(maxAge) || !isFinite(maxAge)) {
      throw new TypeError("option maxAge is invalid");
    }
    str += "; Max-Age=" + Math.floor(maxAge);
  }
  if (opt.domain) {
    if (!fieldContentRegExp.test(opt.domain)) {
      throw new TypeError("option domain is invalid");
    }
    str += "; Domain=" + opt.domain;
  }
  if (opt.path) {
    if (!fieldContentRegExp.test(opt.path)) {
      throw new TypeError("option path is invalid");
    }
    str += "; Path=" + opt.path;
  }
  if (opt.expires) {
    if (typeof opt.expires.toUTCString !== "function") {
      throw new TypeError("option expires is invalid");
    }
    str += "; Expires=" + opt.expires.toUTCString();
  }
  if (opt.httpOnly) {
    str += "; HttpOnly";
  }
  if (opt.secure) {
    str += "; Secure";
  }
  if (opt.sameSite) {
    var sameSite = typeof opt.sameSite === "string" ? opt.sameSite.toLowerCase() : opt.sameSite;
    switch (sameSite) {
      case true:
        str += "; SameSite=Strict";
        break;
      case "lax":
        str += "; SameSite=Lax";
        break;
      case "strict":
        str += "; SameSite=Strict";
        break;
      case "none":
        str += "; SameSite=None";
        break;
      default:
        throw new TypeError("option sameSite is invalid");
    }
  }
  return str;
}
function tryDecode(str, decode2) {
  try {
    return decode2(str);
  } catch (e) {
    return str;
  }
}

/*!
 * Original code by Remix Sofware Inc
 * MIT Licensed, Copyright(c) 2021 Remix software Inc, see LICENSE.remix.md for details
 * 
 * Credits to the Remix team:
 * https://github.com/remix-run/remix/blob/main/packages/remix-server-runtime/cookies.ts
 */
const createCookieFactory = ({ sign, unsign }) => (name, cookieOptions = {}) => {
  let { secrets, ...options } = {
    secrets: [],
    path: "/",
    ...cookieOptions
  };
  return {
    get name() {
      return name;
    },
    get isSigned() {
      return secrets.length > 0;
    },
    get expires() {
      return typeof options.maxAge !== "undefined" ? new Date(Date.now() + options.maxAge * 1e3) : options.expires;
    },
    async parse(cookieHeader, parseOptions) {
      if (!cookieHeader)
        return null;
      let cookies = parseCookie(cookieHeader, { ...options, ...parseOptions });
      return name in cookies ? cookies[name] === "" ? "" : await decodeCookieValue(unsign, cookies[name], secrets) : null;
    },
    async serialize(value, serializeOptions) {
      return serializeCookie(
        name,
        value === "" ? "" : await encodeCookieValue(sign, value, secrets),
        {
          ...options,
          ...serializeOptions
        }
      );
    }
  };
};
const isCookie = (object) => {
  return object != null && typeof object.name === "string" && typeof object.isSigned === "boolean" && typeof object.parse === "function" && typeof object.serialize === "function";
};
async function encodeCookieValue(sign, value, secrets) {
  let encoded = encodeData(value);
  if (secrets.length > 0) {
    encoded = await sign(encoded, secrets[0]);
  }
  return encoded;
}
async function decodeCookieValue(unsign, value, secrets) {
  if (secrets.length > 0) {
    for (let secret of secrets) {
      let unsignedValue = await unsign(value, secret);
      if (unsignedValue !== false) {
        return decodeData(unsignedValue);
      }
    }
    return null;
  }
  return decodeData(value);
}
function encodeData(value) {
  return btoa(JSON.stringify(value));
}
function decodeData(value) {
  try {
    return JSON.parse(atob(value));
  } catch (error) {
    return {};
  }
}

/*!
 * Original code by Remix Sofware Inc
 * MIT Licensed, Copyright(c) 2021 Remix software Inc, see LICENSE.remix.md for details
 * 
 * Credits to the Remix team:
 * https://github.com/remix-run/remix/blob/main/packages/remix-server-runtime/cookieSigning.ts
 */
const encoder = /* @__PURE__ */ new TextEncoder();
const sign = async (value, secret) => {
  let key = await createKey(secret, ["sign"]);
  let data = encoder.encode(value);
  let signature = await crypto.subtle.sign("HMAC", key, data);
  let hash = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/=+$/, "");
  return value + "." + hash;
};
const unsign = async (signed, secret) => {
  let index = signed.lastIndexOf(".");
  let value = signed.slice(0, index);
  let hash = signed.slice(index + 1);
  let key = await createKey(secret, ["verify"]);
  let data = encoder.encode(value);
  let signature = byteStringToUint8Array(atob(hash));
  let valid = await crypto.subtle.verify("HMAC", key, signature, data);
  return valid ? value : false;
};
async function createKey(secret, usages) {
  let key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    usages
  );
  return key;
}
function byteStringToUint8Array(byteString) {
  let array = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    array[i] = byteString.charCodeAt(i);
  }
  return array;
}

/*!
 * Original code by Remix Sofware Inc
 * MIT Licensed, Copyright(c) 2021 Remix software Inc, see LICENSE.remix.md for details
 * 
 * Credits to the Remix team:
 * https://github.com/remix-run/remix/blob/main/packages/remix-server-runtime/sessions.ts
 */
const alreadyWarned = {};
function warnOnce(condition, message) {
  if (!condition && !alreadyWarned[message]) {
    alreadyWarned[message] = true;
    console.warn(message);
  }
}
function flash(name) {
  return `__flash_${name}__`;
}
const createSession = (initialData = {}, id = "") => {
  let map = new Map(Object.entries(initialData));
  return {
    get id() {
      return id;
    },
    get data() {
      return Object.fromEntries(map);
    },
    has(name) {
      return map.has(name) || map.has(flash(name));
    },
    get(name) {
      if (map.has(name))
        return map.get(name);
      let flashName = flash(name);
      if (map.has(flashName)) {
        let value = map.get(flashName);
        map.delete(flashName);
        return value;
      }
      return void 0;
    },
    set(name, value) {
      map.set(name, value);
    },
    flash(name, value) {
      map.set(flash(name), value);
    },
    unset(name) {
      map.delete(name);
    }
  };
};
function warnOnceAboutSigningSessionCookie(cookie) {
  warnOnce(
    cookie.isSigned,
    `The "${cookie.name}" cookie is not signed, but session cookies should be signed to prevent tampering on the client before they are sent back to the server. See https://remix.run/api/remix#signing-cookies for more information.`
  );
}

/*!
 * Original code by Remix Sofware Inc
 * MIT Licensed, Copyright(c) 2021 Remix software Inc, see LICENSE.remix.md for details
 * 
 * Credits to the Remix team:
 * https://github.com/remix-run/remix/blob/main/packages/remix-server-runtime/cookieStorage.ts
 */
const createCookieSessionStorageFactory = (createCookie) => ({ cookie: cookieArg } = {}) => {
  let cookie = isCookie(cookieArg) ? cookieArg : createCookie(cookieArg?.name || "__session", cookieArg);
  warnOnceAboutSigningSessionCookie(cookie);
  return {
    async getSession(cookieHeader, options) {
      return createSession(cookieHeader && await cookie.parse(cookieHeader, options) || {});
    },
    async commitSession(session, options) {
      return cookie.serialize(session.data, options);
    },
    async destroySession(_session, options) {
      return cookie.serialize("", {
        ...options,
        expires: new Date(0)
      });
    }
  };
};

/*!
 * Original code by Remix Sofware Inc
 * MIT Licensed, Copyright(c) 2021 Remix software Inc, see LICENSE.remix.md for details
 *
 * Credits to the Remix team:
 * https://github.com/remix-run/remix/blob/main/packages/remix-server-runtime
 */
const createCookie = createCookieFactory({ sign, unsign });
const createCookieSessionStorage = createCookieSessionStorageFactory(createCookie);

async function GET$2() {
  return new Response("Hello Slack");
}
async function POST$1(e) {
  const data = await e.request.json();
  return json(data);
}
async function PATCH$1() {
}
async function DELETE$1() {
}

async function GET$1() {
  return new Response("Hello Slack");
}
async function POST(e) {
  const data = await e.request.json();
  return json(data);
}
async function PATCH() {
}
async function DELETE() {
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecret = process.env.SUPABASE_SECRET;
invariant$1(
  supabaseUrl,
  "SUPABASE_URL must be set in your environment variables."
);
invariant$1(
  supabaseSecret,
  "SUPABASE_SECRET must be set in your environment variables."
);
const supabase = createClient(supabaseUrl, supabaseSecret);
async function createUser(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });
  const session = data?.session;
  return { session, error };
}
async function getProfileById(id) {
  const { data, error } = await supabase.from("profiles").select("email, id").eq("id", id).single();
  if (error) {
    console.log(error);
    return null;
  }
  if (data)
    return { id: data.id, email: data.email };
}
async function verifyLogin(email, password) {
  const resp = await supabase.auth.signInWithPassword({
    email,
    password
  });
  const error = resp.error;
  if (error)
    return void 0;
  return resp.data.session;
}

const server$ = (_fn) => {
  throw new Error("Should be compiled away");
};
async function parseRequest(event) {
  let request = event.request;
  let contentType = request.headers.get(ContentTypeHeader);
  let name = new URL(request.url).pathname, args = [];
  if (contentType) {
    if (contentType === JSONResponseType) {
      let text = await request.text();
      try {
        args = JSON.parse(text, (key, value) => {
          if (!value) {
            return value;
          }
          if (value.$type === "headers") {
            let headers = new Headers();
            request.headers.forEach((value2, key2) => headers.set(key2, value2));
            value.values.forEach(([key2, value2]) => headers.set(key2, value2));
            return headers;
          }
          if (value.$type === "request") {
            return new Request(value.url, {
              method: value.method,
              headers: value.headers
            });
          }
          return value;
        });
      } catch (e) {
        throw new Error(`Error parsing request body: ${text}`);
      }
    } else if (contentType.includes("form")) {
      let formData = await request.clone().formData();
      args = [formData, event];
    }
  }
  return [name, args];
}
function respondWith(request, data, responseType) {
  if (data instanceof ResponseError) {
    data = data.clone();
  }
  if (data instanceof Response) {
    if (isRedirectResponse(data) && request.headers.get(XSolidStartOrigin) === "client") {
      let headers = new Headers(data.headers);
      headers.set(XSolidStartOrigin, "server");
      headers.set(XSolidStartLocationHeader, data.headers.get(LocationHeader));
      headers.set(XSolidStartResponseTypeHeader, responseType);
      headers.set(XSolidStartContentTypeHeader, "response");
      return new Response(null, {
        status: 204,
        statusText: "Redirected",
        headers
      });
    } else if (data.status === 101) {
      return data;
    } else {
      let headers = new Headers(data.headers);
      headers.set(XSolidStartOrigin, "server");
      headers.set(XSolidStartResponseTypeHeader, responseType);
      headers.set(XSolidStartContentTypeHeader, "response");
      return new Response(data.body, {
        status: data.status,
        statusText: data.statusText,
        headers
      });
    }
  } else if (data instanceof FormError) {
    return new Response(
      JSON.stringify({
        error: {
          message: data.message,
          stack: "",
          formError: data.formError,
          fields: data.fields,
          fieldErrors: data.fieldErrors
        }
      }),
      {
        status: 400,
        headers: {
          [XSolidStartResponseTypeHeader]: responseType,
          [XSolidStartContentTypeHeader]: "form-error"
        }
      }
    );
  } else if (data instanceof ServerError) {
    return new Response(
      JSON.stringify({
        error: {
          message: data.message,
          stack: ""
        }
      }),
      {
        status: data.status,
        headers: {
          [XSolidStartResponseTypeHeader]: responseType,
          [XSolidStartContentTypeHeader]: "server-error"
        }
      }
    );
  } else if (data instanceof Error) {
    console.error(data);
    return new Response(
      JSON.stringify({
        error: {
          message: "Internal Server Error",
          stack: "",
          status: data.status
        }
      }),
      {
        status: data.status || 500,
        headers: {
          [XSolidStartResponseTypeHeader]: responseType,
          [XSolidStartContentTypeHeader]: "error"
        }
      }
    );
  } else if (typeof data === "object" || typeof data === "string" || typeof data === "number" || typeof data === "boolean") {
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        [ContentTypeHeader]: "application/json",
        [XSolidStartResponseTypeHeader]: responseType,
        [XSolidStartContentTypeHeader]: "json"
      }
    });
  }
  return new Response("null", {
    status: 200,
    headers: {
      [ContentTypeHeader]: "application/json",
      [XSolidStartContentTypeHeader]: "json",
      [XSolidStartResponseTypeHeader]: responseType
    }
  });
}
async function handleServerRequest(event) {
  const url = new URL(event.request.url);
  if (server$.hasHandler(url.pathname)) {
    try {
      let [name, args] = await parseRequest(event);
      let handler = server$.getHandler(name);
      if (!handler) {
        throw {
          status: 404,
          message: "Handler Not Found for " + name
        };
      }
      const data = await handler.call(event, ...Array.isArray(args) ? args : [args]);
      return respondWith(event.request, data, "return");
    } catch (error) {
      return respondWith(event.request, error, "throw");
    }
  }
  return null;
}
const handlers = /* @__PURE__ */ new Map();
server$.createHandler = (_fn, hash, serverResource) => {
  let fn = function(...args) {
    let ctx;
    if (typeof this === "object") {
      ctx = this;
    } else if (sharedConfig.context && sharedConfig.context.requestContext) {
      ctx = sharedConfig.context.requestContext;
    } else {
      ctx = {
        request: new URL(hash, "http://localhost:3000").href,
        responseHeaders: new Headers()
      };
    }
    const execute = async () => {
      try {
        return serverResource ? _fn.call(ctx, args[0], ctx) : _fn.call(ctx, ...args);
      } catch (e) {
        if (e instanceof Error && /[A-Za-z]+ is not defined/.test(e.message)) {
          const error = new Error(
            e.message + "\n You probably are using a variable defined in a closure in your server function."
          );
          error.stack = e.stack;
          throw error;
        }
        throw e;
      }
    };
    return execute();
  };
  fn.url = hash;
  fn.action = function(...args) {
    return fn.call(this, ...args);
  };
  return fn;
};
server$.registerHandler = function(route, handler) {
  handlers.set(route, handler);
};
server$.getHandler = function(route) {
  return handlers.get(route);
};
server$.hasHandler = function(route) {
  return handlers.has(route);
};
server$.fetch = internalFetch;

invariant$1(process.env.SESSION_SECRET, "SESSION_SECRET must be set in your environment variables.");
const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    secure: "production" === "production",
    secrets: [process.env.SESSION_SECRET],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true
  }
});
const USER_SESSION_KEY = "userId";
const USER_SESSION_REFRESH_KEY = "userId_refresh";
async function getSession(request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}
async function getUserId(request) {
  const session = await getSession(request);
  const access_token = session.get(USER_SESSION_KEY);
  const refresh_token = session.get(USER_SESSION_REFRESH_KEY);
  const supaSession = await supabase.auth.setSession({
    access_token,
    refresh_token
  });
  const userId = supaSession.data.user?.id;
  return userId;
}
async function getUser(request) {
  const userId = await getUserId(request);
  if (userId === void 0)
    return null;
  const user = await getProfileById(userId);
  if (user)
    return user;
  throw await logout(request);
}
async function createUserSession({
  request,
  session,
  remember,
  redirectTo
}) {
  const cookieSession = await getSession(request);
  cookieSession.set(USER_SESSION_KEY, session.access_token);
  cookieSession.set(USER_SESSION_REFRESH_KEY, session.refresh_token);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(cookieSession, {
        maxAge: remember ? 60 * 60 * 24 * 7 : void 0
      })
    }
  });
}
async function logout(request) {
  const session = await getSession(request);
  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session)
    }
  });
}

async function GET(e) {
  const d = await getUser(e.request);
  return json(d);
}

const api = [
  {
    GET: "skip",
    path: "/*404"
  },
  {
    GET: "skip",
    path: "/about"
  },
  {
    GET: "skip",
    path: "/"
  },
  {
    GET: "skip",
    path: "/login"
  },
  {
    GET: "skip",
    path: "/logout"
  },
  {
    GET: "skip",
    path: "/sign-up"
  },
  {
    GET: GET$2,
    POST: POST$1,
    DELETE: DELETE$1,
    PATCH: PATCH$1,
    path: "/api/kolla"
  },
  {
    GET: GET$1,
    POST: POST,
    DELETE: DELETE,
    PATCH: PATCH,
    path: "/api/slack"
  },
  {
    GET: GET,
    path: "/api/user"
  },
  {
    GET: "skip",
    path: "/apps/hubspot"
  },
  {
    GET: "skip",
    path: "/apps/"
  },
  {
    GET: "skip",
    path: "/apps/shopify"
  },
  {
    GET: "skip",
    path: "/apps/slack"
  }
];
function expandOptionals(pattern) {
  let match = /(\/?\:[^\/]+)\?/.exec(pattern);
  if (!match)
    return [pattern];
  let prefix = pattern.slice(0, match.index);
  let suffix = pattern.slice(match.index + match[0].length);
  const prefixes = [prefix, prefix += match[1]];
  while (match = /^(\/\:[^\/]+)\?/.exec(suffix)) {
    prefixes.push(prefix += match[1]);
    suffix = suffix.slice(match[0].length);
  }
  return expandOptionals(suffix).reduce(
    (results, expansion) => [...results, ...prefixes.map((p) => p + expansion)],
    []
  );
}
function routeToMatchRoute(route) {
  const segments = route.path.split("/").filter(Boolean);
  const params = [];
  const matchSegments = [];
  let score = 0;
  let wildcard = false;
  for (const [index, segment] of segments.entries()) {
    if (segment[0] === ":") {
      const name = segment.slice(1);
      score += 3;
      params.push({
        type: ":",
        name,
        index
      });
      matchSegments.push(null);
    } else if (segment[0] === "*") {
      score -= 1;
      params.push({
        type: "*",
        name: segment.slice(1),
        index
      });
      wildcard = true;
    } else {
      score += 4;
      matchSegments.push(segment);
    }
  }
  return {
    ...route,
    score,
    params,
    matchSegments,
    wildcard
  };
}
const allRoutes = api.flatMap((route) => {
  const paths = expandOptionals(route.path);
  return paths.map((path) => ({ ...route, path }));
}).map(routeToMatchRoute).sort((a, b) => b.score - a.score);
registerApiRoutes(allRoutes);
function getApiHandler(url, method) {
  return getRouteMatches$1(allRoutes, url.pathname, method.toUpperCase());
}

const apiRoutes = ({ forward }) => {
  return async (event) => {
    let apiHandler = getApiHandler(new URL(event.request.url), event.request.method);
    if (apiHandler) {
      let apiEvent = Object.freeze({
        request: event.request,
        clientAddress: event.clientAddress,
        locals: event.locals,
        params: apiHandler.params,
        env: event.env,
        $type: FETCH_EVENT,
        fetch: internalFetch
      });
      try {
        return await apiHandler.handler(apiEvent);
      } catch (error) {
        if (error instanceof Response) {
          return error;
        }
        return new Response(JSON.stringify(error), {
          status: 500
        });
      }
    }
    return await forward(event);
  };
};

const inlineServerFunctions = ({ forward }) => {
  return async (event) => {
    const url = new URL(event.request.url);
    if (server$.hasHandler(url.pathname)) {
      let contentType = event.request.headers.get(ContentTypeHeader);
      let origin = event.request.headers.get(XSolidStartOrigin);
      let formRequestBody;
      if (contentType != null && contentType.includes("form") && !(origin != null && origin.includes("client"))) {
        let [read1, read2] = event.request.body.tee();
        formRequestBody = new Request(event.request.url, {
          body: read2,
          headers: event.request.headers,
          method: event.request.method,
          duplex: "half"
        });
        event.request = new Request(event.request.url, {
          body: read1,
          headers: event.request.headers,
          method: event.request.method,
          duplex: "half"
        });
      }
      let serverFunctionEvent = Object.freeze({
        request: event.request,
        clientAddress: event.clientAddress,
        locals: event.locals,
        fetch: internalFetch,
        $type: FETCH_EVENT,
        env: event.env
      });
      const serverResponse = await handleServerRequest(serverFunctionEvent);
      let responseContentType = serverResponse.headers.get(XSolidStartContentTypeHeader);
      if (formRequestBody && responseContentType !== null && responseContentType.includes("error")) {
        const formData = await formRequestBody.formData();
        let entries = [...formData.entries()];
        return new Response(null, {
          status: 302,
          headers: {
            Location: new URL(event.request.headers.get("referer") || "").pathname + "?form=" + encodeURIComponent(
              JSON.stringify({
                url: url.pathname,
                entries,
                ...await serverResponse.json()
              })
            )
          }
        });
      }
      return serverResponse;
    }
    const response = await forward(event);
    return response;
  };
};

function renderAsync(fn, options) {
  return () => apiRoutes({
    forward: inlineServerFunctions({
      async forward(event) {
        let pageEvent = createPageEvent(event);
        let markup = await renderToStringAsync(() => fn(pageEvent), options);
        if (pageEvent.routerContext && pageEvent.routerContext.url) {
          return redirect(pageEvent.routerContext.url, {
            headers: pageEvent.responseHeaders
          });
        }
        markup = handleIslandsRouting(pageEvent, markup);
        return new Response(markup, {
          status: pageEvent.getStatusCode(),
          headers: pageEvent.responseHeaders
        });
      }
    })
  });
}
function createPageEvent(event) {
  let responseHeaders = new Headers({
    "Content-Type": "text/html"
  });
  const prevPath = event.request.headers.get("x-solid-referrer");
  let statusCode = 200;
  function setStatusCode(code) {
    statusCode = code;
  }
  function getStatusCode() {
    return statusCode;
  }
  const pageEvent = Object.freeze({
    request: event.request,
    prevUrl: prevPath || "",
    routerContext: {},
    tags: [],
    env: event.env,
    clientAddress: event.clientAddress,
    locals: event.locals,
    $type: FETCH_EVENT,
    responseHeaders,
    setStatusCode,
    getStatusCode,
    fetch: internalFetch
  });
  return pageEvent;
}
function handleIslandsRouting(pageEvent, markup) {
  return markup;
}

const _tmpl$$c = ["<main", " class=\"text-center mx-auto text-gray-700 p-4\"><h1 class=\"max-6-xs text-6xl text-sky-700 font-thin uppercase my-16\">Not Found</h1><p class=\"mt-8\">Visit <a href=\"https://solidjs.com\" target=\"_blank\" class=\"text-sky-600 hover:underline\">solidjs.com</a> to learn how to build Solid apps.</p><p class=\"my-4\"><!--#-->", "<!--/--> - <!--#-->", "<!--/--></p></main>"];
function NotFound() {
  return ssr(_tmpl$$c, ssrHydrationKey(), escape(createComponent(A, {
    href: "/",
    "class": "text-sky-600 hover:underline",
    children: "Home"
  })), escape(createComponent(A, {
    href: "/about",
    "class": "text-sky-600 hover:underline",
    children: "About Page"
  })));
}

const _tmpl$$b = ["<button", " class=\"w-[200px] rounded-full bg-gray-100 border-2 border-gray-300 focus:border-gray-400 active:border-gray-400 px-[2rem] py-[1rem]\">Clicks: <!--#-->", "<!--/--></button>"];
function Counter() {
  const [count, setCount] = createSignal(0);
  return ssr(_tmpl$$b, ssrHydrationKey(), escape(count()));
}

const _tmpl$$a = ["<main", " class=\"text-center mx-auto text-gray-700 p-4\"><h1 class=\"max-6-xs text-6xl text-sky-700 font-thin uppercase my-16\">About Page</h1><!--#-->", "<!--/--><p class=\"mt-8\">Visit <a href=\"https://solidjs.com\" target=\"_blank\" class=\"text-sky-600 hover:underline\">solidjs.com</a> to learn how to build Solid apps.</p><p class=\"my-4\"><!--#-->", "<!--/--> - <span>About Page</span></p></main>"];
function About() {
  return ssr(_tmpl$$a, ssrHydrationKey(), escape(createComponent(Counter, {})), escape(createComponent(A, {
    href: "/",
    "class": "text-sky-600 hover:underline",
    children: "Home"
  })));
}

const _tmpl$$9 = ["<main", " class=\"text-center h-full mx-auto text-gray-50 p-4 bg-slate-900\"><h1 class=\"max-6-xs text-6xl font-thin uppercase my-16\">th-m.codes</h1><div class=\"flex flex-row justify-center\"><img src=\"/images/th_m-bald.webp\"></div></main>"];
function Home() {
  return ssr(_tmpl$$9, ssrHydrationKey());
}

const _tmpl$$8 = ["<div", "><label for=\"email\"><div>Email Address</div><!--#-->", "<!--/--></label><input type=\"email\" name=\"email\" id=\"email\"", " aria-describedby=\"email-error\" aria-autocomplete=\"inline\"></div>"],
  _tmpl$2$3 = ["<div", "><label for=\"password\"><div>Password</div><div class=\"small\">Must have at least 6 characters.</div><!--#-->", "<!--/--></label><input id=\"password\" type=\"password\" name=\"password\" aria-autocomplete=\"inline\"", " aria-describedby=\"password-error\"></div>"],
  _tmpl$3$1 = ["<button", " type=\"submit\">Log in</button>"],
  _tmpl$4$1 = ["<input", " type=\"hidden\" name=\"redirectTo\"", ">"],
  _tmpl$5$1 = ["<div", "><div><input id=\"remember\" name=\"remember\" type=\"checkbox\"><label for=\"remember\">Remember me</label></div><div class=\"light\"><span class=\"small\">Already have an account? </span><!--#-->", "<!--/--></div></div>"],
  _tmpl$6$1 = ["<div", "><div>", "</div></div>"],
  _tmpl$7$1 = ["<div", " class=\"error small\" id=\"email-error\">", "</div>"],
  _tmpl$8$1 = ["<div", " class=\"error small\" id=\"password-error\">", "</div>"];
const $$server_module0$3 = server$.createHandler(async function $$serverHandler0(form, {
  request
}) {
  const email = form.get("email");
  const password = form.get("password");
  const remember = form.get("remember");
  const redirectTo = form?.get("redirectTo") ?? "/";
  const errors = {
    email: "",
    password: ""
  };
  if (!password || password.length < 6) {
    errors.password = "Password must be at least 6 characters long";
  }
  if (!email) {
    errors.email = "Email is required";
  }
  if (errors.email || errors.password) {
    return json({
      errors
    }, {
      status: 400
    });
  }
  const session = await verifyLogin(email, password);
  if (!session) {
    errors.email = 'Invalid email or password';
    return json({
      errors
    }, {
      status: 400
    });
  }
  return createUserSession({
    request,
    session,
    remember: remember === 'on' ? true : false,
    redirectTo: redirectTo
  });
}, "/_m/583741b71d/login", true);
server$.registerHandler("/_m/583741b71d/login", $$server_module0$3);
function Login() {
  const [login, {
    Form
  }] = createRouteAction($$server_module0$3);
  const location = useLocation();
  const redirectPath = location.query.redirectTo ?? "/";

  // @ts-ignore
  const errors = login?.result?.errors;
  return ssr(_tmpl$6$1, ssrHydrationKey(), escape(createComponent(Form, {
    method: "post",
    noValidate: true,
    get children() {
      return [ssr(_tmpl$$8, ssrHydrationKey(), errors?.email && ssr(_tmpl$7$1, ssrHydrationKey(), escape(errors?.email)), ssrAttribute("aria-invalid", errors?.email ? escape(true, true) : escape(false, true), false)), ssr(_tmpl$2$3, ssrHydrationKey(), errors?.password && ssr(_tmpl$8$1, ssrHydrationKey(), escape(errors?.password)), ssrAttribute("aria-invalid", errors?.password ? escape(true, true) : escape(false, true), false)), ssr(_tmpl$3$1, ssrHydrationKey()), ssr(_tmpl$4$1, ssrHydrationKey(), ssrAttribute("value", escape(redirectPath, true), false)), ssr(_tmpl$5$1, ssrHydrationKey(), escape(createComponent(A, {
        href: "/sign-up",
        children: "sign up"
      })))];
    }
  })));
}

const _tmpl$$7 = ["<button", " type=\"submit\">Log out</button>"],
  _tmpl$2$2 = ["<div", "><div>", "</div></div>"];
const $$server_module0$2 = server$.createHandler(async function $$serverHandler0(form, {
  request
}) {
  const resp = await logout(request);
  return resp;
}, "/_m/b52a626e40/login", true);
server$.registerHandler("/_m/b52a626e40/login", $$server_module0$2);
function Logout() {
  const [login, {
    Form
  }] = createRouteAction($$server_module0$2);
  return ssr(_tmpl$2$2, ssrHydrationKey(), escape(createComponent(Form, {
    method: "post",
    noValidate: true,
    get children() {
      return ssr(_tmpl$$7, ssrHydrationKey());
    }
  })));
}

const _tmpl$$6 = ["<div", "><label for=\"email\"><div>Email Address</div><!--#-->", "<!--/--></label><input type=\"email\" name=\"email\" id=\"email\"", " aria-describedby=\"email-error\" aria-autocomplete=\"inline\"></div>"],
  _tmpl$2$1 = ["<div", "><label for=\"password\"><div>Password</div><div class=\"small\">Must have at least 6 characters.</div><!--#-->", "<!--/--></label><input id=\"password\" type=\"password\" name=\"password\" aria-autocomplete=\"inline\"", " aria-describedby=\"password-error\"></div>"],
  _tmpl$3 = ["<button", " type=\"submit\">Sign up</button>"],
  _tmpl$4 = ["<input", " type=\"hidden\" name=\"redirectTo\"", ">"],
  _tmpl$5 = ["<div", "><div><input id=\"remember\" name=\"remember\" type=\"checkbox\"><label for=\"remember\">Remember me</label></div><div class=\"light\"><span class=\"small\">Already have an account? </span><!--#-->", "<!--/--></div></div>"],
  _tmpl$6 = ["<div", "><div>", "</div></div>"],
  _tmpl$7 = ["<div", " class=\"error small\" id=\"email-error\">", "</div>"],
  _tmpl$8 = ["<div", " class=\"error small\" id=\"password-error\">", "</div>"];
const $$server_module0$1 = server$.createHandler(async function $$serverHandler0(form, {
  request
}) {
  const email = form.get("email");
  const password = form.get("password");
  const remember = form.get("remember");
  const redirectTo = form?.get("redirectTo") ?? "/";
  const errors = {
    email: "",
    password: ""
  };
  if (!password || password.length < 6) {
    errors.password = "Password must be at least 6 characters long";
  }
  if (!email) {
    errors.email = "Email is required";
  }
  if (errors.email || errors.password) {
    return {
      errors
    };
  }
  const {
    session,
    error
  } = await createUser(email, password);
  if (error) {
    return json({
      errors: error
    }, {
      status: 400
    });
  }
  if (!session) {
    return json({
      errors: {
        email: 'Invalid email or password'
      }
    }, {
      status: 400
    });
  }
  if (errors.email || errors.password) {
    return json({
      errors
    }, {
      status: 400
    });
  }
  return createUserSession({
    request,
    session,
    remember: remember === 'on' ? true : false,
    redirectTo: redirectTo
  });
}, "/_m/6e6f664191/signup", true);
server$.registerHandler("/_m/6e6f664191/signup", $$server_module0$1);
function SignUp() {
  const location = useLocation();
  const [signup, {
    Form
  }] = createRouteAction($$server_module0$1);
  const redirectPath = location.query.redirectTo ?? "/";

  // @ts-ignore
  const errors = signup?.result?.errors;
  return ssr(_tmpl$6, ssrHydrationKey(), escape(createComponent(Form, {
    method: "post",
    noValidate: true,
    get children() {
      return [ssr(_tmpl$$6, ssrHydrationKey(), errors?.email && ssr(_tmpl$7, ssrHydrationKey(), escape(errors?.email)), ssrAttribute("aria-invalid", errors?.email ? escape(true, true) : escape(false, true), false)), ssr(_tmpl$2$1, ssrHydrationKey(), errors?.password && ssr(_tmpl$8, ssrHydrationKey(), escape(errors?.password)), ssrAttribute("aria-invalid", errors?.password ? escape(true, true) : escape(false, true), false)), ssr(_tmpl$3, ssrHydrationKey()), ssr(_tmpl$4, ssrHydrationKey(), ssrAttribute("value", escape(redirectPath, true), false)), ssr(_tmpl$5, ssrHydrationKey(), escape(createComponent(A, {
        href: "/login",
        children: "Login"
      })))];
    }
  })));
}

const _tmpl$$5 = ["<div", "><h1 class=\"max-6-xs text-6xl text-sky-700 font-thin uppercase my-16\">", "</h1><button class=\"w-[200px] rounded-full bg-gray-100 border-2 border-gray-300 focus:border-gray-400 active:border-gray-400 px-[2rem] py-[1rem]\">Install this app</button></div>"];
function AppInstall({
  app
}) {
  return ssr(_tmpl$$5, ssrHydrationKey(), escape(app));
}

const _tmpl$$4 = ["<main", " class=\"text-center mx-auto text-gray-700 p-4\">", "</main>"];
function Slack$2() {
  return ssr(_tmpl$$4, ssrHydrationKey(), escape(createComponent(AppInstall, {
    app: "hubspot"
  })));
}

invariant$1(
  process.env.TH_M_CODES_KOLLA_KEY,
  "SESSION_SECRET must be set in your environment variables."
);
const getConsumerToken = async (data) => {
  const resp = await fetch(
    "https://api.getkolla.com/connect/v1/consumers:consumerToken",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${process.env.TH_M_CODES_KOLLA_KEY}`
      },
      body: JSON.stringify(data)
    }
  );
  const json = await resp.json();
  return json;
};

const fetchUser = async () => {
  const user = await fetch("/api/user", { "credentials": "same-origin" });
  const data = await user.json();
  return data;
};

const _tmpl$$3 = ["<main", " class=\"text-center mx-auto text-gray-700 p-4\"><h1 class=\"max-6-xs text-6xl text-sky-700 font-thin uppercase my-16\">Apps</h1><script src=\"https://cdn.getkolla.com/sdk/v2/index.js\" defer></script></main>"];
const $$server_module0 = server$.createHandler(async function $$serverHandler0(form, {
  request
}) {
  const id = form.get("id");
  const email = form?.get("email") ?? "";
  if (!id) return;
  const tokenData = await getConsumerToken({
    consumer_id: id,
    metadata: {
      email: email
    }
  });
  return tokenData;
}, "/_m/b269b8455a/tokenResponse", true);
server$.registerHandler("/_m/b269b8455a/tokenResponse", $$server_module0);
function ThirdParty() {
  const [user, setUser] = createSignal(null);
  const [token, setToken] = createSignal("");
  const [initialized, setInitialized] = createSignal(false);
  const [tokenResponse, getConsumerTokenAct] = createRouteAction($$server_module0);
  onMount(() => {
    const timer = setInterval(() => {
      if (window && window.kolla && window.kolla.initialized) {
        setInitialized(true);
        clearInterval(timer);
      }
    }, 100);
  });
  createEffect(async () => {
    const data = await fetchUser();
    setUser(data);
  });
  createEffect(async () => {
    const userData = user();
    const isInitialized = initialized();
    if (!userData || !isInitialized) return;
    const formData = new FormData();
    formData.append("id", userData.id);
    formData.append("email", userData.email);
    getConsumerTokenAct(formData);
  });
  createEffect(async () => {
    if (!tokenResponse.result) return;
    setToken(tokenResponse.result.token);
  });
  createEffect(async () => {
    const consumerToken = token();
    if (!consumerToken) return;
    if (!window?.kolla) return;
    window.kolla.authenticate(consumerToken);
    window.kolla.openMarketplace();
  });
  return ssr(_tmpl$$3, ssrHydrationKey());
}

const _tmpl$$2 = ["<main", " class=\"text-center mx-auto text-gray-700 p-4\">", "</main>"];
function Slack$1() {
  return ssr(_tmpl$$2, ssrHydrationKey(), escape(createComponent(AppInstall, {
    app: "shopify"
  })));
}

const _tmpl$$1 = ["<main", " class=\"text-center mx-auto text-gray-700 p-4\">", "</main>"];
function Slack() {
  return ssr(_tmpl$$1, ssrHydrationKey(), escape(createComponent(AppInstall, {
    app: "slack"
  })));
}

/// <reference path="../server/types.tsx" />
const fileRoutes = [{
  component: NotFound,
  path: "/*404"
}, {
  component: About,
  path: "/about"
}, {
  component: Home,
  path: "/"
}, {
  component: Login,
  path: "/login"
}, {
  component: Logout,
  path: "/logout"
}, {
  component: SignUp,
  path: "/sign-up"
}, {
  component: Slack$2,
  path: "/apps/hubspot"
}, {
  component: ThirdParty,
  path: "/apps/"
}, {
  component: Slack$1,
  path: "/apps/shopify"
}, {
  component: Slack,
  path: "/apps/slack"
}];

/**
 * Routes are the file system based routes, used by Solid App Router to show the current page according to the URL.
 */

const FileRoutes = () => {
  return fileRoutes;
};

const root = '';

function LoginButton() {
  //   const event = useServerContext();
  //   const cookie = () =>
  //     parseCookie(
  //       isServer ? event.request.headers.get("cookie") ?? "" : document.cookie
  //     );
  //   const myValue = createMemo(() => {
  //     const v = cookie();
  //     console.log(v);
  //     return v;
  //   });

  // const fullName = createMemo(() => {
  //     const user = auth?.user()
  //     console.log(user);
  //     return `${user}`
  // })
  // console.log(fullName)
  // if(auth?.isAuthenticated()){
  //     return (
  //         <p>
  //             you are in
  //         </p>
  //     )
  // }
  return createComponent(A, {
    href: "/login",
    children: "Login"
  }) // <button onClick={() => auth?.loginWithRedirect()} type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Login</button>
  // <button type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Login</button>
  ;
}

const _tmpl$ = ["<div", "><nav class=\"bg-slate-900 relative\"><ul class=\"container flex items-center p-3 text-gray-200\"><li class=\"", "\">", "</li><li class=\"", "\">", "</li><li class=\"", "\">", "</li><li class=\"", "\">", "</li><!--#-->", "<!--/--></ul></nav><div id=\"dropdown\" class=\"", "\"><ul class=\"py-2 text-sm text-gray-700 dark:text-gray-200\" aria-labelledby=\"dropdownDefaultButton\"><li>", "</li><li>", "</li><li>", "</li></ul></div></div>"],
  _tmpl$2 = ["<li", " class=\"", "\">", "</li>"];
function NavBar() {
  const [user, setUser] = createSignal(null);
  const [dropdown, setDropdown] = createSignal(false);
  const location = useLocation();
  const active = path => {
    if (path.includes("/apps") && location.pathname.includes("/apps")) {
      return location.pathname == path ? "border-sky-600" : "border-transparent hover:border-sky-600";
    }
    return path == location.pathname ? "border-sky-600" : "border-transparent hover:border-sky-600";
  };
  createEffect(async () => {
    console.log("Route Change", location.pathname);
    const data = await fetchUser();
    setUser(data);
  });
  return ssr(_tmpl$, ssrHydrationKey(), `border-b-2 ${escape(active("/"), true)} mx-1.5 sm:mx-6`, escape(createComponent(A, {
    href: "/",
    children: "Home"
  })), `border-b-2 ${escape(active("/shop"), true)} mx-1.5 sm:mx-6`, escape(createComponent(A, {
    href: "https://shop.th-m.codes/",
    children: "Shop"
  })), `border-b-2 ${escape(active("/Blog"), true)} mx-1.5 sm:mx-6`, escape(createComponent(A, {
    href: "https://Blog.th-m.codes/",
    children: "Blog"
  })), `border-b-2 ${escape(active("/apps"), true)} mx-1.5 sm:mx-6`, escape(createComponent(A, {
    href: "/apps",
    children: "Apps"
  })), !user() ? ssr(_tmpl$2, ssrHydrationKey(), `border-b-2 ${escape(active("/login"), true)} mx-1.5 sm:mx-6 justify-end justify-self-end`, escape(createComponent(LoginButton, {}))) : ssr(_tmpl$2, ssrHydrationKey(), `border-b-2 ${escape(active("/logout"), true)} mx-1.5 sm:mx-6`, escape(createComponent(A, {
    href: "/logout",
    children: "Logout"
  }))), `z-10 absolute left-14 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 ${!dropdown() ? "hidden" : ""}`, escape(createComponent(A, {
    onClick: () => setDropdown(!dropdown()),
    "class": "block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white",
    href: "/apps/hubspot",
    children: "Hubspot"
  })), escape(createComponent(A, {
    onClick: () => setDropdown(!dropdown()),
    "class": "block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white",
    href: "/apps/shopify",
    children: "Shopify"
  })), escape(createComponent(A, {
    onClick: () => setDropdown(!dropdown()),
    "class": "block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white",
    href: "/apps/slack",
    children: "Slack"
  })));
}

function Root() {
  return createComponent(Html, {
    lang: "en",
    "class": "m-0 h-full",
    get children() {
      return [createComponent(Head, {
        get children() {
          return [createComponent(Title, {
            children: "SolidStart - With TailwindCSS"
          }), createComponent(Meta$1, {
            charset: "utf-8"
          }), createComponent(Meta$1, {
            name: "viewport",
            content: "width=device-width, initial-scale=1"
          })];
        }
      }), createComponent(Body, {
        "class": "m-0 h-full",
        get children() {
          return [createComponent(Suspense, {
            get children() {
              return createComponent(ErrorBoundary, {
                get children() {
                  return [createComponent(NavBar, {}), createComponent(Routes, {
                    get children() {
                      return createComponent(FileRoutes, {});
                    }
                  })];
                }
              });
            }
          }), createComponent(Scripts, {})];
        }
      })];
    }
  });
}

const rootData = Object.values(/* #__PURE__ */ Object.assign({

}))[0];
const dataFn = rootData ? rootData.default : undefined;

/** Function responsible for listening for streamed [operations]{@link Operation}. */

/** Input parameters for to an Exchange factory function. */

/** Function responsible for receiving an observable [operation]{@link Operation} and returning a [result]{@link OperationResult}. */

/** This composes an array of Exchanges into a single ExchangeIO function */
const composeMiddleware = exchanges => ({
  forward
}) => exchanges.reduceRight((forward, exchange) => exchange({
  forward
}), forward);
function createHandler(...exchanges) {
  const exchange = composeMiddleware(exchanges);
  return async event => {
    return await exchange({
      forward: async op => {
        return new Response(null, {
          status: 404
        });
      }
    })(event);
  };
}
function StartRouter(props) {
  return createComponent(Router, props);
}
const docType = ssr("<!DOCTYPE html>");
function StartServer({
  event
}) {
  const parsed = new URL(event.request.url);
  const path = parsed.pathname + parsed.search;

  // @ts-ignore
  sharedConfig.context.requestContext = event;
  return createComponent(ServerContext.Provider, {
    value: event,
    get children() {
      return createComponent(MetaProvider, {
        get tags() {
          return event.tags;
        },
        get children() {
          return createComponent(StartRouter, {
            url: path,
            get out() {
              return event.routerContext;
            },
            location: path,
            get prevLocation() {
              return event.prevUrl;
            },
            data: dataFn,
            routes: fileRoutes,
            get children() {
              return [docType, createComponent(Root, {})];
            }
          });
        }
      });
    }
  });
}

const entryServer = createHandler(renderAsync(event => createComponent(StartServer, {
  event: event
})));

export { entryServer as default };
