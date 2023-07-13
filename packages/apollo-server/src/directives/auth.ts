import { GraphQLSchema } from "graphql";

import { mapSchema, getDirective, MapperKind } from "@graphql-tools/utils";

export function deprecatedDirective(directiveName: string) {
  return {
    deprecatedDirectiveTypeDefs: `directive @${directiveName}(reason: String) on FIELD_DEFINITION | ENUM_VALUE | QUERY`,
    deprecatedDirectiveTransformer: (schema: GraphQLSchema) =>
      mapSchema(schema, {
        [MapperKind.OBJECT_FIELD](objectFieldConfig) {
          const directives = getDirective(
            schema,
            objectFieldConfig,
            directiveName
          );
          const deprecatedDirective = directives?.[0];

          console.log(
            MapperKind.OBJECT_FIELD,
            "deprecatedDirective",
            deprecatedDirective
          );
          if (deprecatedDirective) {
            objectFieldConfig.resolve = async () => {
              return "pong from apollo-server (overwritten)";
            };
          }
          return objectFieldConfig;
        },
        [MapperKind.ENUM_VALUE](enumValueConfig) {
          const deprecatedDirective = getDirective(
            schema,
            enumValueConfig,
            directiveName
          )?.[0];
          if (deprecatedDirective) {
            enumValueConfig.deprecationReason = deprecatedDirective["reason"];
            return enumValueConfig;
          }
        },
        [MapperKind.QUERY](queryConfig) {
          console.log("run QUERY");
          const deprecatedDirective = getDirective(
            schema,
            queryConfig,
            directiveName
          )?.[0];
          console.log("queryConfig.getFields()", queryConfig.getFields());
          if (queryConfig.getFields()[0]) {
            queryConfig.getFields()[0].resolve = async () => {
              return "pong from apollo-server (overwritten)";
            };
          }
          // なぜここで呼ばれないのか ?
          if (deprecatedDirective) {
          }
          return queryConfig;
        },
      }),
  };
}
