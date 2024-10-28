const metadata = reactive({})

// stores data
export default function structureStorage() {

    const setMetadata = (field, data) => {
        //console.log('setMetadata', field, data)
        metadata[field] = data
    }

    const getMetadata = () => {
        return metadata
    }

    return {
        setMetadata,
        getMetadata
    }

}