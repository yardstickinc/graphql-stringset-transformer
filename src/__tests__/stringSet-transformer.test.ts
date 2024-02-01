import { GraphQLTransform } from "graphql-transformer-core";
import { DynamoDBModelTransformer } from "graphql-dynamodb-transformer";
import { ModelResourceIDs } from "graphql-transformer-common";
import StringSetTransformer from "../index";

// @ts-ignore
import { AppSyncTransformer } from "graphql-appsync-transformer";

const transformer = new GraphQLTransform({
  transformers: [
    new AppSyncTransformer(),
    new DynamoDBModelTransformer(),
    new StringSetTransformer(),
  ],
});

describe("StringSetTransformer", () => {
  test("Transform string to stringSet", () => {
    const schema = `
    type MagicLinkSecret
    @model
    {
        userNameHash: String! @stringSet
    }
  `;
    const properties = getPropertiesOfSchemaTable(schema, "MagicLinkSecret");
    const stringSetAttribute = properties.AttributeDefinitions.find((attr: any) => attr.AttributeName === "userNameHash");
    expect(stringSetAttribute.AttributeType).toEqual("SS");
  });

  const getPropertiesOfSchemaTable = (schema: string, schemaTypeName: string) => {
    const tableName = ModelResourceIDs.ModelTableResourceID(schemaTypeName);
    const resources = transformer.transform(schema).stacks[schemaTypeName]
        .Resources;
    if (!resources) {
      throw new Error("Expected to have resources in the stack");
    }
    const table = resources[tableName];
    if (!table) {
      throw new Error(
          `Expected to have a table resource called ${tableName} in the stack`
      );
    }
    const properties = table.Properties;
    if (!properties) {
      throw new Error(`Expected to have a properties in table ${tableName}`);
    }
    return properties;
  };

});
