// this middleware will be executed for every request to the server
export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()

    // be sure that the request is coming from the API
    if(getRequestURL(event).pathname.includes('/api')) {

        // get requested url and remove trailing slash
        const requestedUrl = `${event.node.req.url}`.endsWith('/') ? `${event.node.req.url}`.slice(0, -1) : `${event.node.req.url}`;
        // get valid api paths from nuxt.config.ts
        const validApiPaths = config.public.apiEndPoints;

        // check if requested url is valid
        const isValid = validApiPaths.some(path => {
            if (typeof path === 'string') {
                if (path.startsWith('/') && path.endsWith('/')) {
                    // This is a regular expression stored as a string
                    const regex = new RegExp(path.slice(1, -1));
                    return regex.test(requestedUrl);
                } else {
                    // This is a normal string
                    return path === requestedUrl;
                }
            }
            return false;
        });
        
        // if not valid return 404
        if (!isValid) {
            setResponseStatus(event, 404)
            return { message: `Unexisting endpoint ${requestedUrl}` }
        }
    }   
  });
