export default defineEventHandler(async (event) => {

  const url = getRequestURL(event);
  const domain = url.hostname;

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