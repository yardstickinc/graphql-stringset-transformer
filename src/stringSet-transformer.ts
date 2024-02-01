import {
  Transformer,
  gql,
  TransformerContext,
} from "graphql-transformer-core";
import {
  DirectiveNode,
  ObjectTypeDefinitionNode,
  InterfaceTypeDefinitionNode,
  FieldDefinitionNode,
} from "graphql";
import {  ModelResourceIDs } from "graphql-transformer-common";

export class StringSetTransformer extends Transformer {
  constructor() {
    super(
      "StringSetTransformer",
      gql`
        directive @stringSet on FIELD_DEFINITION
      `
    );
  }

  public field = (
    parent: ObjectTypeDefinitionNode | InterfaceTypeDefinitionNode,
    definition: FieldDefinitionNode,
    directive: DirectiveNode,
    acc: TransformerContext
  ) => {
    // if (!["String"].includes(getBaseType(definition.type))) {
    //   throw new InvalidDirectiveError(
    //     'Directive "stringSet" must be used only on String type fields.'
    //   );
    // }

    const tableName = ModelResourceIDs.ModelTableResourceID(parent.name.value);
    const table = acc.getResource(tableName);
    const fieldName = definition.name.value;
    const AttributeDefinitions = table?.Properties?.AttributeDefinitions;
    let found = false;
    const newAttributeDefinitions = AttributeDefinitions.map((attr: any) => {
      if (attr.AttributeName === fieldName) {
        found = true;
        attr.AttributeType = "SS";
      }
      return attr;
    });
    if(!found){
        newAttributeDefinitions.push({
            AttributeName: fieldName,
            AttributeType: "SS",
        });
    }
    table.Properties = {
      ...table.Properties,
      AttributeDefinitions: newAttributeDefinitions,
    };
  };
}
