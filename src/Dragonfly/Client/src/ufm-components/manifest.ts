export const manifests: Array<UmbExtensionManifest> = [
  {
    name: "Block Content Type Name UFM Component",
    alias: "Dragonfly.UfmComponent.BlockContentTypeName",
    type: "ufmComponent",
    api: () => import("./block-content-type-name.component.js"),
    meta: {
      alias: "dufmBlockContentTypeName",
    },
  },
  {
    name: "Link Display UFM Component",
    alias: "Dragonfly.UfmComponent.LinkDisplay",
    type: "ufmComponent",
    api: () => import("./link-display.component.js"),
    meta: {
      alias: "dufmLinkDisplay",
    },
  },
  {
    name: "Link URL UFM Component",
    alias: "Dragonfly.UfmComponent.LinkUrl",
    type: "ufmComponent",
    api: () => import("./link-url.component.js"),
    meta: {
      alias: "dufmLinkUrl",
    },
  },
  {
    name: "Link URL With Anchor UFM Component",
    alias: "Dragonfly.UfmComponent.LinkUrlWithAnchor",
    type: "ufmComponent",
    api: () => import("./link-url-with-anchor.component.js"),
    meta: {
      alias: "dufmLinkUrlWithAnchor",
    },
  },
  {
    name: "First Block Value UFM Component",
    alias: "Dragonfly.UfmComponent.FirstBlockValue",
    type: "ufmComponent",
    api: () => import("./first-block-value.component.js"),
    meta: {
      alias: "dufmFirstBlockValue",
    },
  },
  {
    name: "First Value UFM Component",
    alias: "Dragonfly.UfmComponent.FirstValue",
    type: "ufmComponent",
    api: () => import("./first-value.component.js"),
    meta: {
      alias: "dufmFirstValue",
    },
  },
];
