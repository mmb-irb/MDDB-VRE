import Ajv from 'ajv'
import ajvFormats from 'ajv-formats'
import jsYaml from 'js-yaml'
import { schema } from './schema.js'

export default function validateYAML() {

  const validate = (yamlString) => {
    try {
      // Parse the YAML string into a JavaScript object
      const yamlData = jsYaml.load(yamlString);

      // Initialize Ajv and compile the schema
      const ajv = new Ajv();
      ajvFormats(ajv)
      const validate = ajv.compile(schema);

      // Validate the parsed YAML data
      const isValid = validate(yamlData);

      if (!isValid) {
        //console.error('Validation errors:', validate.errors);
        return { isValid: false, errors: validate.errors };
      }

      return { isValid: true, data: yamlData };
    } catch (e) {
      console.error('Error parsing or validating YAML:', e);
      return { isValid: false, errors: [e.message] };
    }
  }

  return {
    validate
  }

}