export default function useREST() {

  const { $axios } = useNuxtApp()

  // Function to find the nested object and extract its keys
  const extractNestedKeys = (data) => {
    for (const key in data) {
      if (data.hasOwnProperty(key) && typeof data[key] === 'object' && !Array.isArray(data[key])) {
        return Object.keys(data[key]).filter(k => k !== 'null');
      }
    }
    return [];
  }

  // Function to get the select options from the metadata
  const getSelectOptions = async (metaURL) => {
    try {
      const response = await $axios.get(metaURL);
      const resp = response.data;
      const options = extractNestedKeys(resp);
      return options;
    } catch (err) {
      console.error(err.message);
      return [];
    }
  }

  return {
    getSelectOptions
  }
}