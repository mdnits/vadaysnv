import { createRootRoute, HeadContent, Scripts, createFileRoute, lazyRouteComponent, createRouter } from "@tanstack/react-router";
import { jsxs, jsx } from "react/jsx-runtime";
const Route$3 = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8"
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      },
      {
        title: "For You — a quiet listening"
      }
    ]
  }),
  shellComponent: RootDocument
});
function RootDocument({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
const $$splitComponentImporter$2 = () => import("./issue-002-DFSckVtZ.js");
const Route$2 = createFileRoute("/issue-002")({
  head: () => ({
    meta: [{
      title: "002 — happy girlfriend's day"
    }, {
      name: "description",
      content: " Everything I noticed."
    }, {
      property: "og:title",
      content: "Everything I Noticed"
    }, {
      property: "og:description",
      content: "happy gf day, Neva."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary_large_image"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./issue-001-htjL_dAv.js");
const Route$1 = createFileRoute("/issue-001")({
  head: () => ({
    meta: [{
      title: "Halo halo halo"
    }, {
      name: "description",
      content: "let's see where this going."
    }, {
      property: "og:title",
      content: "halo navy^^"
    }, {
      property: "og:description",
      content: "neva navy vadays coba buka inih."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary_large_image"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./index-B5AFlimw.js");
const Route = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "md & nv archives"
    }, {
      name: "description",
      content: "karena kita berdua pelupa jadi aku bikin ini biar selalu inget^^."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const Issue002Route = Route$2.update({
  id: "/issue-002",
  path: "/issue-002",
  getParentRoute: () => Route$3
});
const Issue001Route = Route$1.update({
  id: "/issue-001",
  path: "/issue-001",
  getParentRoute: () => Route$3
});
const IndexRoute = Route.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$3
});
const rootRouteChildren = {
  IndexRoute,
  Issue001Route,
  Issue002Route
};
const routeTree = Route$3._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router;
};
export {
  getRouter
};
