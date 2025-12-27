import { SchemaField } from "src/app/component/SchemaFields";

export const docConfigSchema: SchemaField[] = [
  {
    name: ["doc", "appId"],
    type: "Input",
    label: "App ID",
    props: {},
  },
  {
    name: ["doc", "appSecret"],
    type: "Input",
    label: "App Secret",
    props: {},
  },
  {
    name: ["doc", "folderToken"],
    type: "Input",
    label: "Folder Token",
    props: {},
  },
];
