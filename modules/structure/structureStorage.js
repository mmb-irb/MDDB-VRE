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

    return {
        setMetadata,
        setMultiMultiMetadata,
        getMetadata
    }

}