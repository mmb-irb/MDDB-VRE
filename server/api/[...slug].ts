// Catch-all route for unmatched API endpoints
export default defineEventHandler(async (event) => {
    const url = getRequestURL(event)
    
    // Force JSON response regardless of Accept header
    setResponseStatus(event, 404)
    setResponseHeader(event, 'content-type', 'application/json')
    
    return {
        error: 'Not Found',
        message: `Unexisting endpoint ${url.pathname}`,
        statusCode: 404,
        url: url.pathname
    }
})
