const metadata = reactive({})

// stores data
export default function structureStorage() {

    const setMetadata = (field, data) => {
        //console.log('setMetadata', field, data)
        metadata[field] = data
    }

    const setMultiMultiMetadata = (id, index, field, data) => {
        //console.log('setMultiMultiMetadata', id, index, field, data)
        if (!metadata[id]) metadata[id] = []
        if (!metadata[id][index]) metadata[id][index] = {}
        metadata[id][index][field] = data
    }

    const getMetadata = () => {
        return metadata
    }

    const getMetadataField = (field) => {
        //console.log(metadata)
        return metadata[field]
    }

    const getObjectFieldIds = (form) => {
        const ids = []
        form.forEach(section => {
            section.fields.forEach(field => {
            if (field.object) {
                ids.push(field.id)
            }
            })
        })
        return ids
    }

    const cleanObjectFields = (obj) => {
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            const value = obj[key];
            if (value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
              delete obj[key];
            } else if (Array.isArray(value)) {
              obj[key] = value.filter(item => {
                if (typeof item === 'string') {
                  return item !== '';
                } else if (typeof item === 'object' && item !== null) {
                  cleanObjectFields(item);
                  return Object.keys(item).length > 0;
                }
                return true;
              });
              if (obj[key].length === 0) {
                delete obj[key];
              }
            } else if (typeof value === 'object' && value !== null) {
              cleanObjectFields(value);
              if (Object.keys(value).length === 0) {
                delete obj[key];
              }
            }
          }
        }
        return obj
      }

    return {
        setMetadata,
        setMultiMultiMetadata,
        getMetadata,
        getMetadataField,
        getObjectFieldIds,
        cleanObjectFields
    }

}