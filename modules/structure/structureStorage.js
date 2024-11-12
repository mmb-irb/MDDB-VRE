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
    };

    return {
        setMetadata,
        setMultiMultiMetadata,
        getMetadata,
        getMetadataField,
        getObjectFieldIds
    }

}