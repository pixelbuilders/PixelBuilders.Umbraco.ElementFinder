import type { ManifestWorkspaceView } from "@umbraco-cms/backoffice/workspace";

const workspaceViews: Array<ManifestWorkspaceView> = [
  {
    type: "workspaceView",
    name: "Element Finder",
    alias: "element-finder",
    elementName: "element-finder",
    weight: -1,
    conditions: [
      {
        alias: "Umb.Condition.WorkspaceAlias",
        match: "Umb.Workspace.DocumentType",
      },
    ],
    meta: {
      label: "Usage",
      icon: "icon-search",
      pathname: "element-finder",
    },
  },
];

export const manifests = [...workspaceViews];
