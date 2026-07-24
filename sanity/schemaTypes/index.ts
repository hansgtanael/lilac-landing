import type { SchemaTypeDefinition } from "sanity";
import { siteContent } from "./siteContent";

export const schemaTypes: SchemaTypeDefinition[] = [siteContent];

export const schema: { types: SchemaTypeDefinition[] } = {
  types: schemaTypes,
};
