import { Jsona, JsonPropertiesMapper } from 'jsona'
import { defineRelationGetter } from 'jsona/lib/simplePropertyMappers'
import { IJsonPropertiesMapper, TJsonaRelationships, TJsonaModel, TJsonaRelationshipBuild } from 'jsona/lib/JsonaTypes'

class MyJsonPropertiesMapper extends JsonPropertiesMapper implements IJsonPropertiesMapper {
  setRelationships(model: TJsonaModel, relationships: TJsonaRelationships) {

    Object.keys(relationships).forEach((propName) => {
      if (typeof relationships[propName] === 'function') {
          defineRelationGetter(model, propName, <TJsonaRelationshipBuild> relationships[propName])
      } /* else if (!Array.isArray(relationships[propName])) {
        model[`${propName}Id`] = (<TJsonaModel> relationships[propName]).id
      }  */else {
        model[propName] = relationships[propName]
      }
    })
  }
}

export const dataFormatter = new Jsona({
  jsonPropertiesMapper: new MyJsonPropertiesMapper(),
})
