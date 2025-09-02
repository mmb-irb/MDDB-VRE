export default defineEventHandler(async (event) => {

  const config = useRuntimeConfig();
  const domain = config.public.domain || 'localhost:3000';

  const endpoint = `https://${domain}/api/rest/v1/projects/summary`;

  try {
    const response = await fetch(endpoint);
    return {
      status: response.status
    };
  } catch (error) {
    return {
      status: 500
    };
  }

})