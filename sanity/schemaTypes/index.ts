import type { SchemaTypeDefinition } from "sanity";
import { luxPage } from "./luxPage";
import { siteContent } from "./siteContent";

export const schemaTypes: SchemaTypeDefinition[] = [luxPage, siteContent];

export const schema: { types: SchemaTypeDefinition[] } = {
  types: schemaTypes,
};
