const metadata = reactive({})
const fData = reactive([])

// stores data
export default function structureStorage() {

    const storeFData = (data) => {
      fData.splice(0, fData.length, ...data)
    }

    const getFData = () => {
      return fData
    }

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

    const cleanMetadata = () => {
      Object.keys(metadata).forEach(key => delete metadata[key])
    }

    const getMetadata = () => {
        return metadata
    }

    const getMetadataField = (field) => {
        //console.log(metadata)
        return metadata[field]
    }

    const checkIfNull = (value) => {
      if(value === null || value === '' || (Array.isArray(value) && value.length === 0) || (Array.isArray(value) && value.length === 1 && value[0] === null)) {
        return true
      }
    }

    const getObjectFieldIds = (form) => {
      const ids = []
      form.forEach(section => {
          section.fields.forEach(field => {
          if (field.object && !checkIfNull(metadata[field.id])) ids.push(field.id)
        })
      })
      return ids
    }

    const getNullExceptions = (form) => {
      const exceptions = []
      form.forEach(section => {
        section.fields.forEach(field => {
          if (field.force_null) exceptions.push(field.id)
        })
      })
      return exceptions
    }

    const cleanObjectFields = (obj, exceptions = []) => {
      for (const key in obj) {
        if (obj.hasOwnProperty(key) && !exceptions.includes(key)) {
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

    const nullifyFields = (obj) => {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = obj[key]
          if (Array.isArray(value) && value.length === 1 && value[0] === null) obj[key] = null
        }
      }
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = obj[key]
          if (Array.isArray(value) && value.length === 1 && typeof value[0] === 'object') {
            const allNull = Object.values(value[0]).every(val => val === null);
            if (allNull) obj[key] = null;
          }
        }
      }
      return obj
    }

    const getDependingItems = (dependencies) => {
      switch(Object.keys(dependencies).length){
        case 1: break;
        case 2: const v = metadata[dependencies.field].map((obj => obj[dependencies.input]))
                return v
      }
    }

    return {
        storeFData,
        getFData,
        setMetadata,
        setMultiMultiMetadata,
        cleanMetadata,
        getMetadata,
        getMetadataField,
        getNullExceptions,
        getObjectFieldIds,
        cleanObjectFields,
        nullifyFields,
        getDependingItems
    }

}